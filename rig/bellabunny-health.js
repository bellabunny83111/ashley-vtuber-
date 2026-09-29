(()=>{
  const checks=[],timers=new Set();
  let last={ok:false,playable:false,productionReady:false,checks:[]},destroyed=false;

  function later(delay){
    const timer=setTimeout(()=>{timers.delete(timer);if(!destroyed)run()},delay);
    timers.add(timer);
    return timer;
  }

  function add(name,ok,detail='',scope='runtime'){
    checks.push({name,ok:!!ok,detail,scope});
  }

  async function run(){
    if(destroyed)return checks.map(check=>({...check}));
    checks.length=0;
    const secure=location.protocol==='https:'||location.hostname==='localhost';
    add('Secure camera context',secure,location.protocol);
    add('Media devices',!!navigator.mediaDevices?.getUserMedia);
    add('Parameter engine',!!window.BellabunnyRig);
    add('Face tracker',!!window.BellabunnyFaceTracker);
    add('Animation engine',!!window.BellabunnyAnimation);
    add('Voice engine',!!window.BellabunnyVoice);
    add('Layer loader',!!window.BellabunnyLayers);
    add('Avatar profile',!!window.BellabunnyAvatar);

    const state=window.BellabunnyLayers?.state;
    if(state){
      const deferred=state.deferred>0;
      add('Production artwork files',!deferred&&state.criticalReady&&state.loaded===state.total,deferred?state.deferred+' layers deferred until approval':state.loaded+'/'+state.total+' layers','production');
      add('Production approval',state.approvedForProduction,state.artworkStatus+(state.gateReason?' · '+state.gateReason:''),'production');
    }else{
      add('Production artwork files',false,'layer state unavailable','production');
      add('Production approval',false,'layer state unavailable','production');
    }

    let audit=null;
    if(state?.deferred>0){
      add('Critical art decoded',false,'deferred until artwork approval','production');
      add('Artwork registered',false,'pending artwork approval','production');
    }else{
      try{audit=window.BellabunnyArtAudit?.audit?.()||null}catch(error){console.warn('Bellabunny art audit failed',error)}
      if(audit){
        add('Critical art decoded',audit.artLoaded,audit.missing?.join(', ')||'complete','production');
        add('Artwork registered',audit.registered,audit.registered?'verified':audit.unregistered?.join(', ')||'registration required','production');
      }else{
        add('Critical art decoded',false,'audit unavailable','production');
        add('Artwork registered',false,'audit unavailable','production');
      }
    }

    const runtimeChecks=checks.filter(check=>check.scope==='runtime');
    const productionChecks=checks.filter(check=>check.scope==='production');
    const playable=runtimeChecks.every(check=>check.ok);
    const productionReady=productionChecks.every(check=>check.ok);
    last={ok:playable&&productionReady,playable,productionReady,checks:checks.map(check=>({...check}))};
    window.dispatchEvent(new CustomEvent('bellabunny:health',{detail:last}));
    return checks.map(check=>({...check}));
  }

  const onLayers=()=>later(120),onRegistration=()=>later(30);
  function destroy(){
    if(destroyed)return;
    destroyed=true;
    timers.forEach(clearTimeout);timers.clear();
    window.removeEventListener('bellabunny:layers',onLayers);
    window.removeEventListener('bellabunny:registration',onRegistration);
  }

  window.BellabunnyHealth={
    run,destroy,
    get checks(){return checks.map(check=>({...check}))},
    get status(){return{...last,checks:last.checks.map(check=>({...check}))}}
  };
  window.addEventListener('bellabunny:layers',onLayers);
  window.addEventListener('bellabunny:registration',onRegistration);
  later(700);
})();
