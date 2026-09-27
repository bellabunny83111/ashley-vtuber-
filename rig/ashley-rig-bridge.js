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

  function perform(action){
    window.AshleyRig.pose(poseMap[action]||action);

    const expression=expressionMap[action];
    if(expression&&window.BellabunnyExpressions){
      clearTimeout(expressionTimer);
      const [name,strength,duration]=expression;
      window.BellabunnyExpressions.set(name,strength);
      expressionTimer=setTimeout(()=>{
        expressionTimer=0;
        window.BellabunnyExpressions?.set('neutral');
      },duration);
    }

    const animation=animationMap[action];
    if(animation)window.BellabunnyAnimation?.play(animation[0],animation[1]);
  }

  const oldPose=window.pose;
  window.pose=function(nx,ny){
    if(typeof oldPose==='function') oldPose(nx,ny);
    window.AshleyRig.look(nx,ny);
  };

  const oldAct=window.act;
  window.act=function(action){
    if(typeof oldAct==='function') oldAct(action);
    perform(action);
  };

  const reset=document.querySelector('#reset');
  reset?.addEventListener('click',()=>{
    clearTimeout(expressionTimer);
    expressionTimer=0;
    window.BellabunnyExpressions?.set('neutral');
    window.AshleyRig.reset();
  });

  world.dataset.rig='v3-expressions-connected';
  console.info('Ashley Rig Integration v3 connected 🎀');
})();
