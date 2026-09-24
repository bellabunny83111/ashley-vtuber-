# Bellabunny Production Art Extraction Status

Source recovered from ChatGPT Library: Ashley Bellabunny PNG Rigging Asset Sheet (1536x1024 RGBA), plus four supporting asset sheets.

A first source-derived extraction pass has been created locally with 30 isolated transparent components on 2048x2048 canvases. These include back/front hair, side curls, face/head source, eyes, closed-eye states, brows, six mouth states, bunny ears, arms, torso/outfit, skirt, sleeves, microphone, glasses, bow and plush.

IMPORTANT: These first-pass components are isolated from the reference sheet but are not yet approved neutral-stack registration. The reference sheet presents pieces at display scale rather than their final body coordinates. Do not falsely treat center placement as final rig alignment.

## Next art pass
1. Clean residual labels/panel pixels from every extraction.
2. Use the full-character reference as the registration target.
3. Scale and position each isolated component on the shared 2048x2048 coordinate system.
4. Create missing left/right eye separation and pupil-only masks where the source sheet combines them.
5. Build expression/viseme variants.
6. Validate neutral stack visually before enabling production rendering.
7. Keep source-derived assets separate from final approved layers until validation passes.

## Binary upload note
The current GitHub connector can create/update UTF-8 repository files but does not expose repository binary-file upload. The extracted PNG pack therefore remains a generated artifact until a binary-capable upload path is available; runtime/spec/manifest work can continue in GitHub now.
