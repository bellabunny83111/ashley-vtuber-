(()=>{
  let enabled=true,scheduleTimer=0,reopenTimer=0,blinking=false;

  function faceIsActive(){
    const tracker=window.BellabunnyFaceTracker;
    return tracker?.hasRecentFace?tracker.hasRecentFace():!!tracker?.running;
  }

  function apply(values){
    const rig=window.BellabunnyRig;
    if(rig?.snap)rig.snap(values);
    else rig?.batch(values);
  }

  function openEyes(){
    if(!blinking)return;
    blinking=false;
    clearTimeout(reopenTimer);
    reopenTimer=0;
    if(!faceIsActive())apply({eyeOpenL:1,eyeOpenR:1,blinkL:0,blinkR:0});
  }

  function blink(){
    if(!enabled||document.hidden||faceIsActive())return;
    blinking=true;
    apply({eyeOpenL:.05,eyeOpenR:.05,blinkL:1,blinkR:1});
    clearTimeout(reopenTimer);
    reopenTimer=setTimeout(openEyes,105);
  }

  function schedule(){
    clearTimeout(scheduleTimer);
    scheduleTimer=0;
    if(!enabled||document.hidden)return;
    scheduleTimer=setTimeout(()=>{
      scheduleTimer=0;
      blink();
      schedule();
    },1700+Math.random()*3200);
  }

  function pause(){
    clearTimeout(scheduleTimer);
    scheduleTimer=0;
    openEyes();
  }

  function resume(){
    if(enabled&&!document.hidden)schedule();
  }

  function enable(value=true){
    enabled=!!value;
    if(enabled)resume();
    else pause();
  }

  const onVisibility=()=>document.hidden?pause():resume();
  function destroy(){
    enabled=false;pause();clearTimeout(reopenTimer);reopenTimer=0;blinking=false;
    document.removeEventListener('visibilitychange',onVisibility);
    window.removeEventListener('pagehide',pause);
    window.removeEventListener('pageshow',resume);
  }

  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('pagehide',pause);
  window.addEventListener('pageshow',resume);
  schedule();
  window.BellabunnyAutoBlink={enable,pause,resume,blink,destroy,get enabled(){return enabled}};
})();
