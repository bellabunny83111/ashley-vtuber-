(() => {
  const root = 'assets/ashley/layers/';
  let state = {
    loaded: 0,
    missing: 0,
    deferred: 0,
    total: 0,
    ready: false,
    criticalReady: false,
    criticalMissing: [],
    artworkStatus: 'MISSING',
    approvedForProduction: false,
    gateReason: 'manifest not loaded'
  };
  let run = 0;
  let destroyed = false;

  const slots = {
    backHair: '00_back_hair.png',
    body: '01_body_outfit.png',
    neck: '02_neck.png',
    head: '03_head_base.png',
    eyeL: '04_eye_l_open.png',
    eyeR: '05_eye_r_open.png',
    pupilL: '06_pupil_l.png',
    pupilR: '07_pupil_r.png',
    eyeLClosed: '08_eye_l_closed.png',
    eyeRClosed: '09_eye_r_closed.png',
    browL: '10_brow_l.png',
    browR: '11_brow_r.png',
    frontHairL: '13_front_hair_l.png',
    frontHairR: '14_front_hair_r.png',
    curlL: '15_curl_l.png',
    curlR: '16_curl_r.png',
    earL: '17_bunny_ear_l.png',
    earR: '18_bunny_ear_r.png',
    armL: '19_arm_l.png',
    armR: '20_arm_r.png',
    sleeveL: '23_sleeve_l.png',
    sleeveR: '24_sleeve_r.png',
    accessories: '21_accessories.png',
    skirt: '22_skirt_front.png'
  };
  const mouths = ['closed', 'small', 'talk1', 'talk2', 'talk3', 'wide'];
  const critical = [
    '00_back_hair.png', '01_body_outfit.png', '02_neck.png', '03_head_base.png',
    '04_eye_l_open.png', '05_eye_r_open.png', '06_pupil_l.png', '07_pupil_r.png',
    '08_eye_l_closed.png', '09_eye_r_closed.png', '10_brow_l.png', '11_brow_r.png',
    '12_mouth_closed.png', '12_mouth_small.png', '12_mouth_talk1.png',
    '12_mouth_talk2.png', '12_mouth_talk3.png', '12_mouth_wide.png',
    '13_front_hair_l.png', '14_front_hair_r.png', '15_curl_l.png', '16_curl_r.png',
    '17_bunny_ear_l.png', '18_bunny_ear_r.png', '19_arm_l.png', '20_arm_r.png',
    '21_accessories.png', '22_skirt_front.png', '23_sleeve_l.png', '24_sleeve_r.png'
  ];

  function manifestApproved(manifest) {
    const approval = manifest?.approval;
    return approval?.status === 'VERIFIED'
      && approval.readyForRegistration === true
      && approval.approvedForProduction === true;
  }

  function updateReadiness(audit) {
    state.ready = state.approvedForProduction
      && state.criticalReady
      && state.loaded === state.total
      && !!audit?.artLoaded
      && !!audit?.registered;
    state.gateReason = !state.approvedForProduction
      ? 'artwork approval required'
      : !state.criticalReady
        ? 'critical layers missing'
        : state.loaded !== state.total
          ? 'manifest coverage incomplete'
          : !audit?.artLoaded
            ? 'artwork decode incomplete'
            : !audit?.registered
              ? 'explicit registration required'
              : '';
  }

  function report(host) {
    host.dataset.layersLoaded = state.loaded;
    host.dataset.layersMissing = state.missing;
    host.dataset.rigReady = state.ready ? 'true' : 'false';
    host.dataset.artworkStatus = state.artworkStatus;
    host.dataset.productionApproved = state.approvedForProduction ? 'true' : 'false';
    dispatchEvent(new CustomEvent('bellabunny:layers', { detail: { ...state } }));
  }

  function probe(file) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = root + file + '?v=8';
    });
  }

  function add(host, slot, file, className = '') {
    const element = host.querySelector('[data-layer="' + slot + '"]');
    if (!element || element.querySelector('[data-bb-file="' + file + '"]')) return;
    const image = new Image();
    image.className = 'ashley-layer ' + className;
    image.dataset.bbFile = file;
    image.alt = '';
    image.decoding = 'async';
    image.src = root + file + '?v=8';
    element.append(image);
  }

  async function load() {
    if (destroyed) return null;
    const id = ++run;
    const manifest = await fetch(root + 'manifest.json', { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error('Bellabunny manifest ' + response.status);
      return response.json();
    });
    const host = document.querySelector('[data-ashley-rig]');
    if (!host) return manifest;
    const files = manifest.layers.map(layer => typeof layer === 'string' ? layer : layer.file);
    const approval = manifest.approval || {};
    const approvedForProduction = manifestApproved(manifest);
    if (!approvedForProduction) {
      if (destroyed || id !== run) return manifest;
      state = {
        loaded: 0,
        missing: 0,
        deferred: files.length,
        total: files.length,
        ready: false,
        criticalReady: false,
        criticalMissing: [],
        artworkStatus: approval.status || 'MISSING',
        approvedForProduction: false,
        gateReason: 'artwork approval required'
      };
      host.classList.remove('production-ready');
      document.querySelector('#dev-puppet')?.classList.remove('rig-fallback-hidden');
      report(host);
      return manifest;
    }
    const results = await Promise.all(files.map(async file => [file, await probe(file)]));
    if (destroyed || id !== run) return manifest;
    const available = new Set(results.filter(result => result[1]).map(result => result[0]));
    state = {
      loaded: available.size,
      missing: files.length - available.size,
      deferred: 0,
      total: files.length,
      ready: false,
      criticalReady: false,
      criticalMissing: [],
      artworkStatus: approval.status || 'MISSING',
      approvedForProduction: manifestApproved(manifest),
      gateReason: ''
    };
    for (const [slot, file] of Object.entries(slots)) {
      if (available.has(file)) add(host, slot, file);
    }
    for (const name of mouths) {
      const file = '12_mouth_' + name + '.png';
      if (available.has(file)) add(host, 'mouth', file, 'mouth-state mouth-' + name);
    }
    state.criticalMissing = critical.filter(file => !available.has(file));
    state.criticalReady = state.criticalMissing.length === 0;
    updateReadiness(window.BellabunnyArtAudit?.audit?.());
    host.classList.toggle('production-ready', state.ready);
    document.querySelector('#dev-puppet')?.classList.toggle('rig-fallback-hidden', state.ready);
    report(host);
    return manifest;
  }

  function syncAudit(event) {
    if (destroyed) return;
    const host = document.querySelector('[data-ashley-rig]');
    if (!host) return;
    const audit = event?.detail || window.BellabunnyArtAudit?.last;
    if (!audit) return;
    const previousReady = state.ready;
    const previousReason = state.gateReason;
    updateReadiness(audit);
    if (state.ready === previousReady && state.gateReason === previousReason) return;
    host.classList.toggle('production-ready', state.ready);
    document.querySelector('#dev-puppet')?.classList.toggle('rig-fallback-hidden', state.ready);
    report(host);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    ++run;
    removeEventListener('bellabunny:art-audit', syncAudit);
  }

  addEventListener('bellabunny:art-audit', syncAudit);
  window.BellabunnyLayers = {
    load,
    destroy,
    get state() { return { ...state }; },
    critical: [...critical]
  };
})();
