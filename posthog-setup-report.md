<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the runcast-app server-side Node.js codebase. The `posthog-node` SDK (v5.28.2) was installed and configured across three server files — the long-running Express dev server (`dev-server.js`) and two serverless Netlify functions (`netlify/functions/location.ts`, `netlify/functions/weather.ts`).

**Key changes made:**

- **`dev-server.js`**: Initialized a PostHog singleton with `enableExceptionAutocapture: true` and default batching (appropriate for a long-running process). Added `SIGINT`/`SIGTERM` handlers for graceful shutdown. Both route handlers now capture events and use `posthog.captureException()` in catch blocks. The `distinctId` is derived from the `X-POSTHOG-DISTINCT-ID` request header (set by the frontend), falling back to the client IP or `"anonymous"`.

- **`netlify/functions/location.ts`**: Created a new PostHog instance per request with `flushAt: 1` and `flushInterval: 0` (required for serverless environments to flush before the function exits). `await posthog.shutdown()` is called before every return path.

- **`netlify/functions/weather.ts`**: Same serverless pattern as `location.ts`.

- **`.env`**: `POSTHOG_KEY` and `POSTHOG_HOST` added as environment variables.

| Event name | Description | File(s) |
|---|---|---|
| `location_searched` | User successfully searches for a location | `dev-server.js`, `netlify/functions/location.ts` |
| `location_not_found` | Location search returns no results or fails | `dev-server.js`, `netlify/functions/location.ts` |
| `weather_forecast_retrieved` | Weather forecast successfully fetched for coordinates | `dev-server.js`, `netlify/functions/weather.ts` |
| `api_error` | Unhandled error in an Express API endpoint | `dev-server.js` |
| `weather_forecast_error` | Weather forecast fetch fails (Netlify function) | `netlify/functions/weather.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/145989/dashboard/586005
- **Location Search → Weather Forecast Conversion** (funnel): https://eu.posthog.com/project/145989/insights/ojbWFZ8u
- **Location Searches Over Time** (trend): https://eu.posthog.com/project/145989/insights/IEQmNzsx
- **Weather Forecasts Retrieved Over Time** (trend): https://eu.posthog.com/project/145989/insights/9sjWUMvt
- **Location Not Found Rate** (churn indicator): https://eu.posthog.com/project/145989/insights/zAiEfc9d
- **API Errors Over Time** (reliability monitor): https://eu.posthog.com/project/145989/insights/21PxwzXj

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
