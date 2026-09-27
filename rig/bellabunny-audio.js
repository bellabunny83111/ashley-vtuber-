(()=>{
  let ctx,analyser,data,stream,running=false,env=0,hold=0,raf=0,request=0,starting=null;
  const cfg={threshold:.035,attack:.62,release:.14,holdMs:70,faceGraceMs:450};

  function release(media,audio){
    media?.getTracks().forEach(t=>t.stop());
    audio?.close?.().catch?.(()=>{});
  }

  function start(){
    if(running)return Promise.resolve();
    if(starting)return starting;
    const token=++request;
    const task=(async()=>{
      let nextStream,nextCtx;
      try{
        nextStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
        if(token!==request||document.hidden)throw new Error('Microphone start cancelled');
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)throw new Error('Web Audio unavailable');
        nextCtx=new AC();
        await nextCtx.resume();
        if(token!==request||document.hidden)throw new Error('Microphone start cancelled');
        const src=nextCtx.createMediaStreamSource(nextStream);
        const nextAnalyser=nextCtx.createAnalyser();
        nextAnalyser.fftSize=512;
        nextAnalyser.smoothingTimeConstant=.55;
        src.connect(nextAnalyser);
        stream=nextStream;ctx=nextCtx;analyser=nextAnalyser;
        data=new Uint8Array(analyser.fftSize);
        running=true;
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
    const target=rms>cfg.threshold?Math.min(1,(rms-cfg.threshold)*6):0;
    if(target>env){
      env+=(target-env)*cfg.attack;
      hold=performance.now()+cfg.holdMs;
    }else if(performance.now()>hold)env+=(target-env)*cfg.release;
    const update={breath:Math.min(1,env*1.15)};
    if(!faceOwnsMouth())update.mouthOpen=env;
    window.BellabunnyRig?.batch(update);
  }

  function stop(){
    request++;
    running=false;
    cancelAnimationFrame(raf);
    raf=0;
    release(stream,ctx);
    stream=null;ctx=null;analyser=null;data=null;env=0;
    const update={breath:0};
    if(!faceOwnsMouth())update.mouthOpen=0;
    window.BellabunnyRig?.batch(update);
  }

  window.addEventListener('pagehide',stop);
  window.BellabunnyVoice={
    start,
    stop,
    get active(){return running},
    get pending(){return !!starting},
    get level(){return env},
    get source(){return faceOwnsMouth()?'face':'microphone'},
    config:cfg
  };
})();
