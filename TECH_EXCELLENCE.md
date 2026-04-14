# Tech Excellence Plan — Runcast App

## Overview

This document tracks identified improvements across testing, type safety, code quality,
architecture, and performance. Items are ordered roughly by impact and effort.

---

## 1. Testing — Expand Coverage

**Current state:** One test (`getRunRecommendation` rain case). `getBestHourlyRunTimes` and
all component/hook logic are untested.

**Improvements:**

- [ ] Add unit tests for `getRunRecommendation`: happy path (outdoor), temperature out of
  range, active weather alerts, combined conditions.
- [ ] Add unit tests for `getBestHourlyRunTimes`: suitable hours found, fewer than 3 suitable
  hours, no suitable hours, edge cases at 8am/8pm boundary.
- [ ] Add component tests (Vitest + React Testing Library) for `WeatherCard`: renders correct
  recommendation badge, renders best hours when suitable, hides best hours when not suitable.
- [ ] Add component test for `App`: location persists to `localStorage` on search.
- [ ] Enforce a coverage threshold in `vite.config.ts` (e.g. 80 % lines/branches) so CI fails
  if coverage regresses.

---

## 2. Bug Fixes

### 2a. Wrong error type cast in `openWeather.ts`

`openWeather.ts` uses native `fetch`, not axios, so casting caught errors to `AxiosError` is
incorrect — `error.response` will always be `undefined` and status codes are silently lost.

```ts
// current (wrong)
const axiosError = error as AxiosError;
axiosError.response?.status // always undefined

// fix: use native Error / Response
const err = error as Error;
return { success: false, error: { message: err.message } };
```

- [ ] Remove the `AxiosError` import and cast in `openWeather.ts`.
- [ ] Parse the HTTP status from the `Response` object before throwing so it is available in
  the error envelope.

### 2b. `getWeatherIcon` never matches "sun"

The function checks `iconCode.includes("sun")` but the argument passed is
`day.weather[0].description` (e.g. `"broken clouds"`, `"clear sky"`), not the icon code
(`"01d"`). "sun" never appears in OWM description strings.

- [ ] Either map OWM icon codes (`01d/01n` → Sun, `09d` → CloudRain, etc.) or match against
  description strings that actually contain recognisable words (`"clear"`, `"rain"`,
  `"cloud"`).

### 2c. Premature error shown before location query settles

In `WeatherResult.tsx`, the `useEffect` calls `setError("Location not found.")` in the `else`
branch whenever `coordinates === undefined`. This fires on initial render (before the query
runs), briefly flashing an error.

- [ ] Guard the else branch: only call `setError` when `!isLoading && coordinates === undefined`.

### 2d. Temperature state stored as strings

`minTemp`/`maxTemp` are `useState<string>` in `App.tsx` and parsed with `parseInt` at every
render in `WeatherResult`. Keeping them as strings increases chance of `NaN` bugs and
clutters parsing logic.

- [ ] Change state to `useState<number>` and parse once in the `onChange` handler (or use a
  controlled numeric input).

---

## 3. Type Safety

### 3a. `dev-server.js` — migrate to TypeScript

The dev server is plain JS while the rest of the project is strictly typed. Express route
handlers receive `req.query` values typed as `string | string[] | ParsedQs | ParsedQs[]`
but are passed directly to `getLatLngFromLocation(API_KEY, req.query.location)` which
expects `string`. TypeScript would catch this.

- [ ] Rename `dev-server.js` → `dev-server.ts` and add the missing narrowing/assertions.
- [ ] Update `package.json` scripts to run it via `bun` (which handles TS natively).

### 3b. Replace `any` with `unknown`

`details?: any` in the error envelope types in `openWeather.ts` weakens inference.

- [ ] Change to `details?: unknown`.

---

## 4. Code Duplication — PostHog & Endpoint Logic

### 4a. PostHog instantiated per request in Netlify functions

Both `location.ts` and `weather.ts` construct `new PostHog(...)` inside the handler body,
meaning a new client is created and torn down on every invocation.

- [ ] Extract a shared `getPostHogClient()` helper at module level (or a shared
  `netlify/lib/posthog.ts`) and reuse it. The client already supports batching; a singleton
  is the correct model.

### 4b. Duplicated endpoint boilerplate

Both Netlify functions share the same structure: method check → PostHog init → call
OpenWeather → capture event → return response. The `dev-server.js` duplicates this a third
time.

- [ ] Extract a `withPostHog(handler)` wrapper or shared request-handling utility so the
  method guard and analytics plumbing live in one place.

---

## 5. Architecture — `openWeather.ts` placement

`src/api/openWeather.ts` is in the frontend source tree but is **server-only** (it holds the
raw API key calls and is only imported by Netlify functions and the dev server). Placing it
under `src/` implies it is client-safe, and any future bundler/lint misconfiguration could
accidentally include it in the client bundle.

- [ ] Move to `server/openWeather.ts` (or `netlify/lib/openWeather.ts`) and update imports in
  both Netlify functions and `dev-server.ts`.

---

## 6. Performance — React Query cache configuration

Neither `useLocationQuery` nor `useForecastQuery` sets `staleTime`, so React Query refetches
both on every window focus and every component mount. Weather data is stable for at least 10
minutes.

- [ ] Add `staleTime: 10 * 60 * 1000` (10 min) to both queries.
- [ ] Consider `gcTime: 30 * 60 * 1000` (30 min) so background tabs don't evict cached
  forecasts immediately.

---

## 7. Minor / Low-effort Improvements

| # | Issue | Fix |
|---|-------|-----|
| 7a | `useEffect` to sync React Query state to parent is an anti-pattern | Lift error/loading state out of `WeatherResult` or use React Query's `isError`/`error` fields directly |
| 7b | `getBestHourlyRunTimes` sorts by `temp` descending (hottest hours) | Sort by closeness to midpoint of `[minTemp, maxTemp]` to surface _most comfortable_ hours |
| 7c | No `aria-label` on icon-only weather icons | Add accessible labels for screen readers |
| 7d | `console.log` debug lines left in Netlify function handlers | Remove or gate behind `process.env.NODE_ENV === 'development'` |
| 7e | Hard-coded port `3001` in `dev-server` | Read from `process.env.PORT` with fallback |

---

## Priority Order

1. **Bug fixes** (2a–2d) — correctness issues that affect users today
2. **Testing** (1) — safety net before any refactor
3. **Type safety** (3a–3b) — prevents whole class of future bugs
4. **PostHog duplication** (4a–4b) — performance + maintainability
5. **Architecture** (5) — low risk, big clarity gain
6. **React Query cache** (6) — reduces unnecessary API calls
7. **Minor** (7a–7e) — polish
