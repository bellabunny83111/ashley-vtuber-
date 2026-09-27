(()=>{
  const LOSS_GRACE_MS=450,RECENTER_FRAMES=18;
  let face,last=-1,running=false,raf=0,resetRaf=0,busy=false,failures=0;
  let lastSeen=0,lostSince=0,activeVideo=null,activeStatus=()=>{},suspended=false;

  async function init(){
    if(face)return face;
    const v=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm');
    const fs=await v.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
    face=await v.FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'},runningMode:'VIDEO',numFaces:1,minFaceDetectionConfidence:.5,minFacePresenceConfidence:.5,minTrackingConfidence:.5,outputFaceBlendshapes:true,outputFacialTransformationMatrixes:true});
    return face;
  }

  function neutralize(){
    const neutral={headX:0,headY:0,headZ:0,eyeLookX:0,eyeLookY:0,eyeOpenL:1,eyeOpenR:1,blinkL:0,blinkR:0,smile:0,browL:0,browR:0};
    if(!window.BellabunnyVoice?.active)neutral.mouthOpen=0;
    window.BellabunnyRig?.batch(neutral);
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
    const video=activeVideo,onStatus=activeStatus;
    schedule();
    if(!video||busy||document.hidden||video.readyState<2||video.currentTime===last)return;
    busy=true;
    try{
      last=video.currentTime;
      const r=face.detectForVideo(video,performance.now()),lm=r.faceLandmarks?.[0];
      if(lm){
        lastSeen=performance.now();lostSince=0;failures=0;cancelRecenter();
        const n=lm[1],l=lm[33],rr=lm[263],cx=(l.x+rr.x)/2,cy=(l.y+rr.y)/2;
        let p={x:(n.x-cx)*8,y:(n.y-cy-.10)*6};
        p=window.BellabunnyCalibration?.map(p.x,p.y)||p;
        window.BellabunnyRig?.batch({headX:p.x,headY:p.y,...window.BellabunnyRig.fromBlendshapes(r.faceBlendshapes?.[0]?.categories||[])});
        onStatus(true,r);
      }else reportLoss(onStatus,r);
    }catch(e){
      failures++;
      if(failures===1||failures%30===0)console.warn('Bellabunny tracking frame failed',e);
      reportLoss(onStatus,{error:e});
    }finally{busy=false}
  }

  async function start(video,onStatus=()=>{}){
    await init();
    activeVideo=video;activeStatus=onStatus;lastSeen=0;lostSince=0;cancelRecenter();
    if(running){resume();return}
    running=true;failures=0;last=-1;suspended=document.hidden;schedule();
  }

  function suspend(){
    if(!running)return;
    suspended=true;
    if(raf)cancelAnimationFrame(raf);
    raf=0;busy=false;last=-1;
  }

  function resume(){
    if(!running||document.hidden)return;
    suspended=false;busy=false;last=-1;
    const video=activeVideo;
    if(video?.paused&&video.srcObject)video.play().catch(()=>{});
    schedule();
  }

  function stop(){
    running=false;suspended=false;
    if(raf)cancelAnimationFrame(raf);
    raf=0;busy=false;last=-1;lastSeen=0;lostSince=0;activeVideo=null;activeStatus=()=>{};
    recenter();
  }

  function destroy(){stop();face?.close?.();face=null}
  document.addEventListener('visibilitychange',()=>document.hidden?suspend():resume());
  window.addEventListener('pagehide',suspend);
  window.addEventListener('pageshow',resume);
  window.BellabunnyFaceTracker={init,start,stop,destroy,suspend,resume,recenter,hasRecentFace,get running(){return running},get lastSeen(){return lastSeen}};
})();
