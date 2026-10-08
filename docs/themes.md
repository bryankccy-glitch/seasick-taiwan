# Ocean themes

- Ocean Dark retains the original CSS colors as variable fallbacks. Ocean Morning supplies shared semantic roles in `app/theme.css` (text, secondary text, accent, surfaces, tint, border, land and shadow), plus explicit risk and chart tokens.
- Existing geometry, typography, navigation and voyage calculations remain unchanged. Title uses the existing Noto Sans TC / system fallback; no LINE Seed font files were present or added.
- Root `data-theme` drives CSS, Tailwind 4 `dark:` utilities, portal dialogs, SVG colors and a Three.js light palette uniform. Theme changes do not remount the scene or alter marine uniforms.
- A small inline head script resolves `seasick-theme` before paint. Explicit preference wins; first visit follows `prefers-color-scheme`; missing system support falls back to dark. Blocked storage does not prevent toggling.
- One root ThemeProvider uses `useSyncExternalStore` with a stable SSR dark snapshot; both icons render consistently and CSS controls visibility, avoiding hydration mismatch. Stored choices sync across tabs; system changes apply until a user selects a theme.
- Theme toggle is in the header at all breakpoints, has a 44px target, an accessible name and focus outline. Enter and Space use native button behavior.
- Color/icon transitions use 250ms. Reduced-motion preferences disable nonessential CSS motion and trigger the existing static ocean rendering path.
- Run `npm run test:theme` for preference, pre-paint fallback, blocked storage and light color contrast checks. Other product, marine and ocean tests remain applicable.
- Local preview was reviewed and the user approved GitHub / Vercel publication on 2026-10-08. Future changes still require local review before publication.

## Local verification

- Production build preview: http://127.0.0.1:3102/.
- Desktop 1280px, tablet 820px, mobile 390px: no document horizontal overflow; 44px theme target; original single-line Chinese heading preserved.
- Browser: light/dark switching via mouse, Enter and Space; both stored themes survive reload; initial unsaved theme follows the actual dark system preference. Light system preference and missing storage/system support are covered by bootstrap tests.
- Explore search, saved ports, port selection, port details, result/weights dialog, profile and empty voyage log checked. Mobile harbor selector and 24/72h panel checked.
- Actual API remains connected; unavailable ports have no fabricated readings. Loading/error use the same themed empty-state surfaces; upstream-error and offline scenarios were not artificially injected into the browser.
- No hydration or theme errors observed. Existing WebMCP registration cleanup emits AbortError on page reload (lifecycle.abort in app/page.tsx); it was not changed in this theme-only task. Light primary/secondary/accent/risk palette passes 4.5:1 against white and the light/tinted surfaces. This is a palette check, not a full external accessibility audit; original Dark muted shades are preserved.
- Screenshots are outside the repository in the workspace outputs directory.

## Changed files

1. app/globals.css — semantic color fallbacks and Tailwind dark variant.
2. app/marine-interactions.css — panel/timeline color roles.
3. app/ocean-hero.css — hero color roles.
4. app/theme.css — shared light tokens and theme presentation.
5. app/layout.tsx — pre-paint script and root provider.
6. app/page.tsx — header theme toggle.
7. components/ThemeProvider.tsx — shared preferences, events and toggle.
8. components/ResultRiskChart.tsx — theme-aware chart colors.
9. components/ocean/ocean-scene.ts — theme observer / GPU uniform.
10. components/ocean/ocean-shaders.ts — light ocean palette.
11. lib/theme.ts — preference resolution / bootstrap.
12. tests/theme.test.mjs — theme and contrast regressions.
13. package.json — test:theme command.
14. docs/themes.md — architecture and verification record.
