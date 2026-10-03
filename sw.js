const CACHE='bellabunny-studio-v45';
const APP_SHELL=["./","./index.html","./ashley-studio.png","./assets/bellabunny-pngtuber-eyes-open-mouth-closed.svg?v=1","./assets/bellabunny-pngtuber-eyes-open-mouth-open.svg?v=1","./assets/bellabunny-pngtuber-eyes-closed-mouth-closed.svg?v=1","./assets/bellabunny-pngtuber-eyes-closed-mouth-open.svg?v=1","./manifest.webmanifest","./bellabunny-icon.svg","./bellabunny-icon-192.png","./bellabunny-icon-512.png","./bellabunny-touch-icon.png","./rig/bellabunny-avatar-profile.js","./rig/bellabunny-parameter-engine.js","./rig/bellabunny-face-tracker.js","./rig/bellabunny-animation-engine.js","./rig/bellabunny-expression-mixer.js","./rig/bellabunny-tracking-calibration.js","./rig/bellabunny-audio.js?v=30","./rig/bellabunny-layer-loader.js?v=27","./rig/bellabunny-registration.js","./rig/bellabunny-art-audit.js?v=22","./rig/bellabunny-mouth-controller.js","./rig/bellabunny-autoblink.js","./rig/bellabunny-health.js","./rig/ashley-rig.css","./rig/ashley-rig.html","./rig/ashley-rig.js","./rig/ashley-rig-bridge.js","./assets/ashley/layers/manifest.json","./assets/ashley/layers/registration.json"];

async function fetchAndCache(request,cacheKey=request){
  const response=await fetch(request);
  if(response.ok){
    try{
      const cache=await caches.open(CACHE);
      await cache.put(cacheKey,response.clone());
    }catch(error){
      console.warn('Bellabunny cache update failed',error);
    }
  }
  return response;
}

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetchAndCache(request,new Request(new URL('./index.html',self.location.href))).catch(async()=>{
        const exact=await caches.match(request);
        return exact||caches.match('./index.html');
      })
    );
    return;
  }

  const refresh=fetchAndCache(request).catch(error=>{
    console.warn('Bellabunny background refresh failed',error);
    return null;
  });
  event.waitUntil(refresh);
  event.respondWith(
    caches.match(request).then(cached=>cached||refresh.then(response=>
      response||Promise.reject(new Error('Offline asset unavailable'))
    ))
  );
});
