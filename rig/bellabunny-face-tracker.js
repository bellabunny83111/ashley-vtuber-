(()=>{
  const LOSS_GRACE_MS=450,RECENTER_FRAMES=18,TRACK_INTERVAL_MS=1000/30,TRACK_INTERVAL_EPSILON_MS=1;
  let face,initTask,last=-1,running=false,raf=0,resetRaf=0,busy=false,failures=0,lifecycle=0;
  let lastSeen=0,lostSince=0,lastProcessAt=-Infinity,activeVideo=null,activeStatus=()=>{},suspended=false;

  async function init(){
    if(face)return face;
    if(initTask)return initTask;
    const task=(async()=>{
      const v=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm');
      const fs=await v.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
      return v.FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'},runningMode:'VIDEO',numFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:true,outputFacialTransformationMatrixes:true});
    })();
    initTask=task;
    try{
      face=await task;
      return face;
    }finally{
      if(initTask===task)initTask=null;
    }
  }

  function publishHead(x,y,z=0){
    window.dispatchEvent(new CustomEvent('bellabunny:head',{detail:{x,y,z}}));
  }

  function neutralize(){
    const neutral={headX:0,headY:0,headZ:0,eyeLookX:0,eyeLookY:0,eyeOpenL:1,eyeOpenR:1,blinkL:0,blinkR:0,smile:0,browL:0,browR:0};
    if(!window.BellabunnyVoice?.active)neutral.mouthOpen=0;
    window.BellabunnyRig?.batch(neutral);
    publishHead(0,0,0);
  }

  function cancelRecenter(){
    if(resetRaf)cancelAnimationFrame(resetRaf);
    resetRaf=0;
  }

  function recenter(){
    cancelRecenter();
    let frames=0;
    const step=()=>{
      neutralize();
      if(++frames<RECENTER_FRAMES)resetRaf=requestAnimationFrame(step);
      else resetRaf=0;
    };
    step();
  }

  function hasRecentFace(graceMs=LOSS_GRACE_MS){
    return !!(running&&lastSeen&&performance.now()-lastSeen<graceMs);
  }

  function reportLoss(onStatus,payload){
    const now=performance.now();
    if(!lostSince)lostSince=now;
    if(now-lostSince>=LOSS_GRACE_MS&&!resetRaf)recenter();
    onStatus(false,payload);
  }

  function schedule(){
    if(!running||suspended||raf)return;
    raf=requestAnimationFrame(loop);
  }

  function loop(){
    raf=0;
    if(!running||suspended)return;
    const video=activeVideo,onStatus=activeStatus,now=performance.now();
    schedule();
    if(!video||busy||document.hidden||video.readyState<2||video.currentTime===last||now-lastProcessAt<TRACK_INTERVAL_MS-TRACK_INTERVAL_EPSILON_MS)return;
    lastProcessAt=now;
    busy=true;
    try{
      last=video.currentTime;
      const r=face.detectForVideo(video,now),lm=r.faceLandmarks?.[0];
      if(lm){
        lastSeen=now;lostSince=0;failures=0;cancelRecenter();
        const n=lm[1],l=lm[33],rr=lm[263],cx=(l.x+rr.x)/2,cy=(l.y+rr.y)/2;
        let p={x:(n.x-cx)*8,y:(n.y-cy-.10)*6,z:Math.max(-1,Math.min(1,Math.atan2(rr.y-l.y,rr.x-l.x)*2.2))};
        p=window.BellabunnyCalibration?.map(p.x,p.y,p.z)||p;
        window.BellabunnyRig?.batch({headX:p.x,headY:p.y,headZ:p.z,...window.BellabunnyRig.fromBlendshapes(r.faceBlendshapes?.[0]?.categories||[])});
        publishHead(p.x,p.y,p.z);
        onStatus(true,r);
      }else reportLoss(onStatus,r);
    }catch(e){
      failures++;
      if(failures===1||failures%30===0)console.warn('Bellabunny tracking frame failed',e);
      reportLoss(onStatus,{error:e});
    }finally{busy=false}
  }

  async function start(video,onStatus=()=>{}){
    const token=++lifecycle;
    await init();
    if(token!==lifecycle||document.hidden)throw new DOMException('Face tracker start cancelled','AbortError');
    activeVideo=video;activeStatus=onStatus;lastSeen=0;lostSince=0;cancelRecenter();
    if(running){resume();return true}
    running=true;failures=0;last=-1;lastProcessAt=-Infinity;suspended=false;schedule();
    return true;
  }

  function suspend(){
    if(!running)return;
    suspended=true;
    if(raf)cancelAnimationFrame(raf);
    raf=0;busy=false;last=-1;lastProcessAt=-Infinity;
  }

  function resume(){
    if(!running||document.hidden)return;
    suspended=false;busy=false;last=-1;lastProcessAt=-Infinity;
    const video=activeVideo;
    if(video?.paused&&video.srcObject)video.play().catch(()=>{});
    schedule();
  }

  function stop(){
    lifecycle++;
    running=false;suspended=false;
    if(raf)cancelAnimationFrame(raf);
    raf=0;busy=false;last=-1;lastProcessAt=-Infinity;lastSeen=0;lostSince=0;activeVideo=null;activeStatus=()=>{};
    recenter();
  }

  function destroy(){stop();face?.close?.();face=null}
  document.addEventListener('visibilitychange',()=>document.hidden?suspend():resume());
  window.addEventListener('pagehide',suspend);
  window.addEventListener('pageshow',resume);
  window.BellabunnyFaceTracker={init,start,stop,destroy,suspend,resume,recenter,hasRecentFace,get running(){return running},get lastSeen(){return lastSeen}};
})();
