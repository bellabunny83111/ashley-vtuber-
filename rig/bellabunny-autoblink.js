(()=>{
  let enabled=true,timer=0;
  function faceIsActive(){
    const tracker=window.BellabunnyFaceTracker;
    return tracker?.hasRecentFace?tracker.hasRecentFace():!!tracker?.running;
  }
  function schedule(){
    clearTimeout(timer);
    if(!enabled)return;
    timer=setTimeout(()=>{
      if(!faceIsActive()){
        window.BellabunnyRig?.batch({eyeOpenL:.05,eyeOpenR:.05,blinkL:1,blinkR:1});
        setTimeout(()=>window.BellabunnyRig?.batch({eyeOpenL:1,eyeOpenR:1,blinkL:0,blinkR:0}),105);
      }
      schedule();
    },1700+Math.random()*3200);
  }
  schedule();
  window.BellabunnyAutoBlink={enable(v=true){enabled=v;schedule()}};
})();
