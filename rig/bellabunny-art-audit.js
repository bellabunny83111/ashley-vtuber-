(()=>{
  const required=['backHair','body','neck','head','eyeL','eyeR','pupilL','pupilR','eyeLClosed','eyeRClosed','browL','browR','mouth','frontHairL','frontHairR','curlL','curlR','earL','earR','armL','armR','sleeveL','sleeveR','skirt','accessories'];
  const timers=new Set();
  let last=null,destroyed=false;

  function imageOK(image){
    return image.complete&&image.naturalWidth>0&&image.naturalHeight>0;
  }

  function audit(){
    if(destroyed)return last;
    const host=document.querySelector('[data-ashley-rig]');
    if(!host){
      last={ok:false,artLoaded:false,registered:false,reason:'rig-not-mounted',rows:[],missing:[...required],unregistered:[...required]};
      return last;
    }
    const registration=window.BellabunnyRegistration;
    const rows=required.map(slot=>{
      const element=host.querySelector('[data-layer="'+slot+'"]');
      const images=[...(element?.querySelectorAll('img')||[])];
      return{
        slot,
        present:images.length>0,
        loaded:images.some(imageOK),
        files:images.map(image=>image.dataset.bbFile||image.src.split('/').pop())
      };
    });
    const registered=rows.every(row=>{
      if(!registration?.isRegistered?.(row.slot))return false;
      const value=registration.get(row.slot);
      return Number.isFinite(value.x)&&Number.isFinite(value.y)&&Number.isFinite(value.scale)&&value.scale>0;
    });
    const artLoaded=rows.every(row=>row.loaded);
    last={
      ok:artLoaded&&registered,
      artLoaded,
      registered,
      rows,
      missing:rows.filter(row=>!row.loaded).map(row=>row.slot),
      unregistered:rows.filter(row=>!registration?.isRegistered?.(row.slot)).map(row=>row.slot)
    };
    host.dataset.artAudit=last.ok?'pass':'hold';
    dispatchEvent(new CustomEvent('bellabunny:art-audit',{detail:last}));
    return last;
  }

  function schedule(delay=80){
    if(destroyed)return 0;
    const timer=setTimeout(()=>{
      timers.delete(timer);
      if(!destroyed)audit();
    },delay);
    timers.add(timer);
    return timer;
  }

  function onLayers(){schedule()}
  function onRegistration(){audit()}

  function destroy(){
    if(destroyed)return;
    destroyed=true;
    timers.forEach(clearTimeout);
    timers.clear();
    removeEventListener('bellabunny:layers',onLayers);
    removeEventListener('bellabunny:registration',onRegistration);
  }

  addEventListener('bellabunny:layers',onLayers);
  addEventListener('bellabunny:registration',onRegistration);
  window.BellabunnyArtAudit={audit,destroy,get last(){return last}};
})();
