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

  // Mic bridge: observes existing voice meter so the future mouth layers
  // can respond without replacing Ashley Studio's working microphone code.
  const meter=document.querySelector('#level');
  let last=0;
  function syncMouth(){
    if(meter){
      const n=parseFloat(meter.style.width)||0;
      const v=Math.max(0,Math.min(1,n/55));
      last += (v-last)*.35;
      window.AshleyRig.mouth(last);
    }
    requestAnimationFrame(syncMouth);
  }
  syncMouth();

  world.dataset.rig='v2-connected';
  console.info('Ashley Rig Integration v2 connected 🎀');
})();