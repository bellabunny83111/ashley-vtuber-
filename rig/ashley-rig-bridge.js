(() => {
  const world=document.querySelector('#world');
  if(!world || !window.AshleyRig) return;

  const oldPose=window.pose;
  window.pose=function(nx,ny){
    if(typeof oldPose==='function') oldPose(nx,ny);
    window.AshleyRig.look(nx,ny);
  };

  const oldAct=window.act;
  window.act=function(action){
    if(typeof oldAct==='function') oldAct(action);
    const map={wave:'wave',heart:'heart',kiss:'kiss',sing:'sing',dance:'dance',shy:'shy',love:'love',confetti:'finale'};
    window.AshleyRig.pose(map[action]||action);
  };

  const reset=document.querySelector('#reset');
  reset?.addEventListener('click',()=>window.AshleyRig.reset());

  world.dataset.rig='v2-connected';
  console.info('Ashley Rig Integration v2 connected 🎀');
})();