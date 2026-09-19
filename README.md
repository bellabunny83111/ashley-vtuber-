# Ashley Studio — Frankenstein VTuber FINAL

A zero-subscription, browser-based interactive Ashley performance studio assembled from free/open browser capabilities and the existing canonical Ashley Studio artwork.

## What works now
- iPhone/device tilt tracking (tap **Motion** and allow permission)
- touch/mouse puppeteering
- microphone-reactive sing mode (tap **Sing** and allow mic)
- camera preview (tap **Camera**; the camera stays local to the browser)
- Wave, Heart, Mwah, Sing, Dance, Shy, Love Overload and Finale actions
- animated hearts/strawberries/sparkles/confetti
- installable PWA/offline cache after first load
- no paid API or subscription is required by the app itself

## Run it
Camera/microphone permissions require a secure page (HTTPS) or localhost. For a computer, from this folder run:

    python -m http.server 8000

Then open `http://localhost:8000`.

For iPhone, host this folder on any HTTPS static host (GitHub Pages works once a repository exists) and open the link in Safari. Use Share → Add to Home Screen for an app-like icon.

## Why this is the Frankenstein build
It deliberately uses the canonical Ashley art as the visual source and layers free browser motion sensors, touch input, Web Audio microphone analysis, camera access, CSS transforms/physics-like animation, Web App Manifest and Service Worker caching. This avoids replacing Ashley with a generic avatar just to gain motion.

## Upgrade path (still free)
The next true-rig tier can plug in MediaPipe tracking plus a layered 2D rig or VRM. The included app is intentionally useful before that rig exists; it is not pretending that a single flattened PNG has independently deformable fingers, lips, hair strands or eyes.
