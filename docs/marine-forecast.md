# Live 24h / 72h marine forecasts

`GET /api/marine` joins Open-Meteo Marine and Weather API responses by Unix timestamp. The server fetches four local calendar days, retains 72 consecutive hourly records beginning at the current hour, and validates wave height (m), wave period (s), and wind speed (m/s). Missing/invalid required hours reject the harbor; they are never filled, repeated, or replaced with demo data. Optional currents remain null; km/h is converted to m/s. UTC ISO timestamps are displayed in Asia/Taipei.

Only the 13 harbor coordinates in `MAP_HARBORS` are currently supported. Other catalog entries explicitly show no forecast. These are surrounding marine grid forecasts, not measurements inside a harbor or a forecast along an entire ferry route. Marine and wind grids can differ; both returned grid coordinates are included in the response.

Both range buttons use the same validated hourly series, sampled every three hours (8 points for 24h, 24 for 72h). The map, search, cards, panel, departure selection and risk result share the selected range and time. Old port wave/wind/current baselines and the former diurnal simulation are not used. Tide descriptions and confidence percentages are not supplied by the provider and are not displayed. Static marine briefs are replaced by educational guides.

The SickSea risk score remains an uncalibrated relative heuristic based on actual forecast inputs and user voyage settings, not a provider measurement, probability or official index. Unavailable optional factors and the old artificial confidence factor are excluded; remaining weights are normalized. The ocean animation is decorative; its idle defaults do not appear as marine measurements.

Upstream successful fetches cache for 10 minutes. Browser refresh and the 10-minute poll really query `/api/marine`; failures clear displayed readings instead of silently retaining stale values. `queriedAt` is the server's query time, not a model run/issuance time (not returned by these endpoints). Requests have a 15-second timeout and return a sanitized 502 error when the provider cannot supply usable forecasts. CSP remains same-origin because provider calls run on the server.

No API key/database is needed. Open-Meteo's free hosted API is for non-commercial use; commercial sites need the customer plan/key and corresponding server endpoints. Attribution is shown in the UI. Review https://open-meteo.com/en/pricing before commercial operation.

Sources: https://open-meteo.com/en/docs/marine-weather-api and https://open-meteo.com/en/docs

Vercel supports this Next.js server route. GitHub Pages static export cannot serve `/api/marine`; use Vercel for the live forecasts.
