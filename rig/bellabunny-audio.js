(()=>{
  let ctx,analyser,data,stream,running=false,env=0,hold=0,raf=0,request=0,starting=null,noiseFloor=.012;
  const cfg={threshold:.018,gain:18,noiseFloorStart:.012,noiseGate:1.25,noiseLearnCeiling:.24,maxNoiseFloor:.03,noiseRise:.03,noiseFall:.08,attack:.62,release:.14,holdMs:70,faceGraceMs:450};

  function release(media,audio){
    media?.getTracks().forEach(t=>t.stop());
    audio?.close?.().catch?.(()=>{});
  }

  function emit(active,reason){
    window.dispatchEvent(new CustomEvent('bellabunny:voice',{detail:{active,reason}}));
  }

  function start(){
    if(running)return Promise.resolve();
    if(starting)return starting;
    const token=++request;
    const task=(async()=>{
      let nextStream,nextCtx;
      try{
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)throw new Error('Web Audio unavailable');
        // iOS requires AudioContext activation to happen inside the original tap.
        // Activate it before waiting for the microphone permission prompt.
        nextCtx=new AC();
        await nextCtx.resume();
        if(token!==request||document.hidden)throw new DOMException('Microphone start cancelled','AbortError');
        nextStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
        if(token!==request||document.hidden)throw new DOMException('Microphone start cancelled','AbortError');
        const src=nextCtx.createMediaStreamSource(nextStream);
        const nextAnalyser=nextCtx.createAnalyser();
        nextAnalyser.fftSize=512;
        nextAnalyser.smoothingTimeConstant=.55;
        src.connect(nextAnalyser);
        stream=nextStream;ctx=nextCtx;analyser=nextAnalyser;
        data=new Uint8Array(analyser.fftSize);
        running=true;
        const ended=()=>{if(stream===nextStream)stop('stream-ended')};
        nextStream.addEventListener?.('inactive',ended,{once:true});
        nextStream.getAudioTracks().forEach(track=>track.addEventListener?.('ended',ended,{once:true}));
        emit(true,'started');
        loop();
      }catch(error){
        release(nextStream,nextCtx);
        throw error;
      }
    })();
    starting=task;
    const clear=()=>{if(starting===task)starting=null};
    task.then(clear,clear);
    return task;
  }

  function faceOwnsMouth(){
    const f=window.BellabunnyFaceTracker;
    return !!(f?.running&&f.lastSeen&&performance.now()-f.lastSeen<cfg.faceGraceMs);
  }

  function loop(){
    if(!running)return;
    raf=requestAnimationFrame(loop);
    if(document.hidden)return;
    analyser.getByteTimeDomainData(data);
    let sum=0;
    for(const x of data){
      const v=(x-128)/128;
      sum+=v*v;
    }
    const rms=Math.sqrt(sum/data.length);
    const gate=Math.max(cfg.threshold,noiseFloor*cfg.noiseGate);
    const preliminary=rms>gate?Math.min(1,(rms-gate)*cfg.gain):0;
    // Learn steady low-level room noise even when it begins just above the
    // initial gate, but never absorb speech or let the gate climb unchecked.
    if(preliminary<cfg.noiseLearnCeiling){
      const rate=rms>noiseFloor?cfg.noiseRise:cfg.noiseFall;
      const delta=Math.max(-.006,Math.min(.006,rms-noiseFloor));
      noiseFloor=Math.max(.004,Math.min(cfg.maxNoiseFloor,noiseFloor+delta*rate));
    }
    const activeGate=Math.max(cfg.threshold,noiseFloor*cfg.noiseGate);
    const target=rms>activeGate?Math.min(1,(rms-activeGate)*cfg.gain):0;
    if(target>env){
      env+=(target-env)*cfg.attack;
      hold=performance.now()+cfg.holdMs;
    }else if(performance.now()>hold)env+=(target-env)*cfg.release;
    const update={breath:Math.min(1,env*1.15)};
    if(!faceOwnsMouth())update.mouthOpen=env;
    window.BellabunnyRig?.batch(update);
  }

  function stop(reason='stopped'){
    if(typeof reason!=='string')reason='stopped';
    const wasActive=running||!!stream;
    request++;
    running=false;
    cancelAnimationFrame(raf);
    raf=0;
    const oldStream=stream,oldCtx=ctx;
    stream=null;ctx=null;analyser=null;data=null;env=0;noiseFloor=cfg.noiseFloorStart;
    release(oldStream,oldCtx);
    const update={breath:0};
    if(!faceOwnsMouth())update.mouthOpen=0;
    if(window.BellabunnyRig?.snap)window.BellabunnyRig.snap(update);
    else window.BellabunnyRig?.batch(update);
    if(wasActive)emit(false,reason);
  }

  function onPageHide(){stop('pagehide')}

  function destroy(){
    stop('destroyed');
    window.removeEventListener('pagehide',onPageHide);
  }

  window.addEventListener('pagehide',onPageHide);
  window.BellabunnyVoice={
    start,
    stop,
    destroy,
    get active(){return running},
    get pending(){return !!starting},
    get level(){return env},
    get source(){return faceOwnsMouth()?'face':'microphone'},
    config:cfg,
    get noiseFloor(){return noiseFloor}
  };
})();
