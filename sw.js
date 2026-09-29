const CACHE='bellabunny-studio-v18';
const APP_SHELL=["./","./index.html","./ashley-studio.png","./assets/bellabunny-dev-puppet-v2.svg?v=3","./manifest.webmanifest","./bellabunny-icon.svg","./rig/bellabunny-avatar-profile.js","./rig/bellabunny-parameter-engine.js","./rig/bellabunny-face-tracker.js","./rig/bellabunny-animation-engine.js","./rig/bellabunny-expression-mixer.js","./rig/bellabunny-tracking-calibration.js","./rig/bellabunny-audio.js","./rig/bellabunny-layer-loader.js","./rig/bellabunny-registration.js","./rig/bellabunny-art-audit.js","./rig/bellabunny-mouth-controller.js","./rig/bellabunny-autoblink.js","./rig/bellabunny-health.js","./rig/ashley-rig.css","./rig/ashley-rig.html","./rig/ashley-rig.js","./rig/ashley-rig-bridge.js","./assets/ashley/layers/manifest.json","./assets/ashley/layers/registration.json"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)))}
    return response;
  }).catch(()=>caches.match(request).then(cached=>cached||(request.mode==='navigate'?caches.match('./index.html'):Promise.reject(new Error('Offline asset unavailable'))))));
});
