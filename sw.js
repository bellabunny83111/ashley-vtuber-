const CACHE='bellabunny-studio-v48';
const APP_SHELL=["./","./index.html","./ashley-studio.png","./assets/bellabunny-pngtuber-eyes-open-mouth-closed.svg?v=1","./assets/bellabunny-pngtuber-eyes-open-mouth-open.svg?v=1","./assets/bellabunny-pngtuber-eyes-closed-mouth-closed.svg?v=1","./assets/bellabunny-pngtuber-eyes-closed-mouth-open.svg?v=1","./manifest.webmanifest","./bellabunny-icon.svg","./bellabunny-icon-192.png","./bellabunny-icon-512.png","./bellabunny-touch-icon.png","./rig/bellabunny-avatar-profile.js?v=47","./rig/bellabunny-parameter-engine.js?v=47","./rig/bellabunny-face-tracker.js?v=47","./rig/bellabunny-animation-engine.js?v=47","./rig/bellabunny-expression-mixer.js?v=47","./rig/bellabunny-tracking-calibration.js?v=47","./rig/bellabunny-audio.js?v=47","./rig/bellabunny-layer-loader.js?v=47","./rig/bellabunny-registration.js?v=47","./rig/bellabunny-art-audit.js?v=47","./rig/bellabunny-mouth-controller.js?v=47","./rig/bellabunny-autoblink.js?v=47","./rig/bellabunny-health.js?v=47","./rig/ashley-rig.css?v=47","./rig/ashley-rig.html?v=47","./rig/ashley-rig.js?v=47","./rig/ashley-rig-bridge.js?v=47","./assets/ashley/layers/manifest.json?v=47","./assets/ashley/layers/registration.json?v=47"];

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

  const url=new URL(request.url);
  const gateFile=url.pathname.endsWith('/assets/ashley/layers/manifest.json')
    ||url.pathname.endsWith('/assets/ashley/layers/registration.json');
  const runtimeAsset=request.destination==='script'||request.destination==='style'||gateFile;

  if(request.mode==='navigate'){
    event.respondWith(
      fetchAndCache(request,new Request(new URL('./index.html',self.location.href))).catch(async()=>{
        const exact=await caches.match(request);
        return exact||caches.match('./index.html');
      })
    );
    return;
  }

  if(runtimeAsset){
    event.respondWith(
      fetchAndCache(request).catch(()=>caches.match(request).then(cached=>
        cached||Promise.reject(new Error('Offline runtime asset unavailable'))
      ))
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
