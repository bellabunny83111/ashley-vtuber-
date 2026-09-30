(() => {
  const world=document.querySelector('#world');
  if(!world || !window.AshleyRig) return;

  const poseMap={
    wave:'wave',
    heart:'heart',
    kiss:'kiss',
    sing:'sing',
    dance:'dance',
    shy:'shy',
    love:'love',
    confetti:'finale'
  };
  const expressionMap={
    wave:['happy',.55,850],
    heart:['happy',.85,1200],
    kiss:['happy',.9,1100],
    sing:['excited',.65,1200],
    dance:['excited',.85,1400],
    shy:['shy',1,1300],
    love:['excited',1,1700],
    confetti:['excited',1,1500]
  };
  const animationMap={
    wave:['bounce',650],
    heart:['love',950],
    kiss:['love',900],
    sing:['cheer',950],
    dance:['cheer',1250],
    shy:['love',850],
    love:['love',1450],
    confetti:['cheer',1350]
  };
  let expressionTimer=0;
  let destroyed=false;

  function perform(action){
    if(destroyed) return;
    window.AshleyRig.pose(poseMap[action]||action);

    const expression=expressionMap[action];
    if(expression&&window.BellabunnyExpressions){
      clearTimeout(expressionTimer);
      const [name,strength,duration]=expression;
      window.BellabunnyExpressions.set(name,strength);
      expressionTimer=setTimeout(()=>{
        expressionTimer=0;
        if(!destroyed) window.BellabunnyExpressions?.set('neutral');
      },duration);
    }

    const animation=animationMap[action];
    if(animation)window.BellabunnyAnimation?.play(animation[0],animation[1]);
  }

  const oldPose=window.pose;
  function bridgePose(nx,ny,nz=0){
    if(destroyed) return;
    if(typeof oldPose==='function') oldPose(nx,ny,nz);
    window.AshleyRig.look(nx,ny,nz);
  }
  window.pose=bridgePose;

  const oldAct=window.act;
  function bridgeAct(action){
    if(destroyed) return;
    if(typeof oldAct==='function') oldAct(action);
    perform(action);
  }
  window.act=bridgeAct;

  const reset=document.querySelector('#reset');
  function handleReset(){
    if(destroyed) return;
    clearTimeout(expressionTimer);
    expressionTimer=0;
    window.BellabunnyExpressions?.set('neutral');
    window.AshleyRig.reset();
  }
  reset?.addEventListener('click',handleReset);

  function destroy(){
    if(destroyed) return;
    destroyed=true;
    clearTimeout(expressionTimer);
    expressionTimer=0;
    reset?.removeEventListener('click',handleReset);
    if(window.pose===bridgePose) window.pose=oldPose;
    if(window.act===bridgeAct) window.act=oldAct;
    if(world.dataset.rig==='v3-expressions-connected') delete world.dataset.rig;
  }

  window.BellabunnyRigBridge={perform,destroy};
  world.dataset.rig='v3-expressions-connected';
  console.info('Ashley Rig Integration v3 connected 🎀');
})();
