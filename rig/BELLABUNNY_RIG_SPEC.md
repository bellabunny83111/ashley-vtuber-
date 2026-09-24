# Bellabunny VTuber Rig

## Runtime pipeline
Camera -> MediaPipe Face Landmarker -> parameter bus -> animation mixer -> PNG hierarchy -> spring physics -> stream scene.
Microphone -> smoothed RMS envelope -> mouthOpen.

## Parameters
headX, headY, headZ, eyeOpenL/R, eyeLookX/Y, blinkL/R, mouthOpen, smile, browL/R, breath.

## Production artwork rule
Every PNG uses the same 2048x2048 transparent canvas and origin. Never crop layers independently. Neutral layers must reconstruct the approved Bellabunny artwork exactly.

## Layer order
Back hair; body/outfit; neck; head base; eyes/pupils; brows; mouth; front hair; curls; bunny ears; arms; accessories/props; effects.

## Tracking
Use one face. Face blendshapes drive blink, jaw, smile, brows and gaze. Facial landmarks drive head position. Smooth noisy inputs before rendering. Tracking loss falls back to idle rather than freezing in a distorted pose.

## Animation
Tracking remains the base layer. Idle/breathing is subtle. Expressions override only their intended parameters. One-shot reactions (bounce/cheer/love) layer above tracking. Hair, curls, ears and ribbons use delayed spring motion.

## Streaming
Camera/mic require HTTPS or localhost. Keep a clean character-only output scene for OBS/TikTok capture and a presentation scene for viewers. Technical/debug controls must be hidden in clean output.

## Privacy
Face/mic processing should remain local in the browser where possible. Do not record or upload camera/microphone media as part of tracking.

## Quality gate
No missing layers, no independently cropped production layers, neutral stack aligns, blink closes cleanly, pupils remain inside eyes, mouth does not jitter at silence, head motion recenters smoothly, tracking loss is graceful, mobile UI respects safe areas, clean output contains no debug UI.
