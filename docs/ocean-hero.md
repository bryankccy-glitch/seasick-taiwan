# Particle ocean Hero

The home Hero keeps its existing search, harbor map, text, and cards. Only search selection waits for a 700ms water/camera transition before opening the controlled harbor detail panel. Other navigation stays immediate and cancels pending selection. Reduced motion skips the delay.

## Structure

- `components/OceanParticleHero.tsx`: client component, lazy import, fallback, imperative API, selection timer cleanup.
- `components/ocean/ocean-scene.ts`: Three.js renderer, fixed point grid, uniforms, pointer projection, observers and resource lifecycle.
- `components/ocean/ocean-shaders.ts`: GPU wave/noise, pressure, ripples, tiny dash shading and distance fade.
- `lib/ocean-conditions.ts`: bounded visual parameters and adapter for the existing marine readings; it does not change the risk model.
- `app/ocean-hero.css`: background placement, readability mask and pointer-transparent UI layers.

One `Points` / `BufferGeometry` draw call uses multi-direction sine waves and low-frequency value noise. Desktop adds a second noise octave and a small turbulent wave. Height changes point brightness rather than adding bloom. The canvas has no textures, postprocessing, external requests, or pointer capture.

## Conditions interface

```tsx
oceanRef.current?.setOceanConditions({
  waveHeight: 0.7,       // visual amplitude, bounded 0–2.5
  waveSpeed: 0.4,        // bounded 0–1.2
  turbulence: 0.2,      // bounded 0–1
  windDirection: 45,    // degrees, wrapped to 0–360
  riskLevel: 31,        // existing numeric score, bounded 0–100
});
```

Conditions damp toward the target and direction takes the shortest angular path. Wave phase is accumulated independently of speed, so changes do not jump. Current harbor data contains no measured wind direction: 45° is a visual default, not an observation. Selecting/searching a harbor and changing the shared timeline uses the existing calculation and does not imply a new live API.

## Interaction

Passive pointer events on the Hero parent update a target. The frame loop damps the cursor, projects its position onto the water plane and applies subtle pressure using the actual canvas bounds. A fixed ring buffer holds eight ripple origins on desktop, two on mobile and low quality. Entering the surface creates a ring even without further movement. Movement deposits propagating crest and trailing rings, with a brighter aqua crest and slightly larger particles. Rings expire within 2.4 seconds; movement deposits are throttled to 140ms on desktop and 240ms on mobile and 320ms at low quality. Camera parallax is small and disabled on mobile.

Scroll events only invalidate cached bounds during normal animation. A frame reads them once, smoothly reduces amplitude/opacity and raises the camera. Intersection and visibility observers stop the frame loop offscreen or in a background tab.

## Quality and fallback

| Tier | Grid | Points | DPR cap | Rendering |
| --- | --- | --- | --- | --- |
| Desktop | 288 × 180 | 51,840 | 1.5 | display refresh rate |
| Mobile/coarse pointer | 144 × 96 | 13,824 | 1 | at most 30fps |
| Low capability / sustained slow frames | 96 × 72 | 6,912 | 0.8 | at most 30fps |

Low capability uses hardware concurrency and device memory when exposed. A sustained measured frame rate below 24fps lowers desktop quality to the mobile tier; below 20fps lowers that tier to low quality. A stable 30fps display retains its density; geometry is rebuilt only on tier changes, not per frame. ResizeObserver updates container size, camera aspect and breakpoint tier. Pixel ratio and pointer type are reevaluated on resize.

`prefers-reduced-motion` switches immediately to a static render: no pointer interaction, no phase advance, no parallax or port-selection delay. Changes to data and size can still redraw it. WebGL initialization/compilation failure or context loss shows an existing static dotted SVG wave surface. Context restoration resumes the renderer. Fallback preserves all UI input.

Unmount cancels timers and animation frames, removes listeners, disconnects observers, disposes geometry/material/renderer, releases the WebGL context and removes the canvas. Async import completion after unmount is ignored.

## Checks

```sh
npm run lint
npm run typecheck
npm run test:ocean
npm run build
```

Use `next start` for visual verification. The existing CSP disallows eval, which currently prevents webpack development-mode hydration; this change does not weaken that policy. Production preview checks should cover search → transition → port, analysis, favorites, logs, language, repeated home/unmount, desktop/mobile resize and console shader errors. Physical-device thermal/battery behavior remains a separate check.
