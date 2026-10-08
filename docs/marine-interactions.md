# Marine interactions

## Source and scope

The Next.js homepage and all existing views share state in `app/page.tsx`. There is no additional router, store, database or live marine API in this implementation. `lib/ports.ts` supplies demo baselines and `lib/risk.ts` derives eight three-hour samples from 06:00 to 03:00 the following day. The original risk weights and risk-level thresholds remain unchanged.

The full eight-sample series now powers departure selection and the panel. A 72h range switch deliberately shows an unavailable-data state, confirmed by the user; it never repeats the first day or synthesizes a forecast. Wind direction, sea temperature and weather are explicitly unavailable. This is a demonstration series, not a current 24-hour forecast.

## Components and state flow

- `MarineMap`: existing Natural Earth coastline and verified harbor coordinates; markers/hover cards use the current voyage settings and shared time. Colors communicate existing risk levels, with wind speed added to the tooltip.
- `PortDetailPanel`: non-modal Radix Dialog. Desktop side panel / mobile bottom sheet. A second marker selection updates content without closing the panel. Escape and Close dismiss it; underlying navigation still works. Existing favorites and voyage analysis remain available.
- `MarineTimeline`: controlled range and sample index, existing Radix slider supporting pointer/touch/keyboard, time chips, SVG trend with active marker and best window. Midnight samples carry next-day labels.
- `RiskIndicator`: meter/badge and 280ms numeric interpolation. rAF only updates text refs, never React state. Updates cancel previous frames. Reduced motion immediately sets the target.
- `OceanParticleHero`: remains mounted behind the home UI while the detail panel is open. A single controlled conditions value feeds the shader. Search retains the 700ms transition and then opens the panel.

`portId`, `timeIndex`, `forecastRange`, and `panelOpen` live in Page. The model timeline is derived once with useMemo; the selected sample feeds panel, Hero and model-context read tools. Map and home search use the same voyage conditions/time. Existing generic harbor cards retain their baseline summaries.

The adapter multiplies wave amplitude by a bounded risk factor and raises phase speed/turbulence as risk increases. It accepts an optional measured wind direction for future sources; without one, 45° remains a visual default, never a displayed observation. Scene uniforms damp to the new values.

## Performance and dependencies

No new dependency was added for the map, panel or timeline. They reuse Radix, Lucide and Three.js already installed. The GPU grid/shaders, DPR caps, reduced-motion handling, resize/visibility/intersection observers and cleanup are retained. Low quality now disables wake generation in addition to simplifying noise and parallax.

## Validation and limits

Lint, typecheck, production builds and four ocean parameter tests pass. Browser checks cover mobile sheet, desktop panel, marker-to-marker switching, selected time values, keyboard slider operation, 72h unavailable state, search transition, panel dismissal and the existing voyage/risk analysis. The same Radix slider handles pointer dragging and touch; physical mobile touch and device thermal behavior still require device testing.

No harbor comparison, multi-harbor view, comparison table or Shift-click comparison was added. No production deployment or authentication code was changed. The live Vercel website has previously shown authentication UI not present in this repository branch; preservation of that separate deployed version cannot be verified from these sources.
