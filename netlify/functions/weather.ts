import { Handler } from "@netlify/functions";
import { PostHog } from "posthog-node";
import { getWeatherForecast } from "../../src/api/openWeather";

export const handler: Handler = async (event) => {
  const params = event.queryStringParameters;

  console.log("Function called with method:", event.httpMethod);
  console.log("Query params: NETLIFY", event.queryStringParameters);

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  const posthog = new PostHog(process.env.POSTHOG_KEY ?? "", {
    host: process.env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });

  const distinctId =
    event.headers["x-posthog-distinct-id"] ||
    // event.requestContext?.identity?.sourceIp ||
    "anonymous";

  if (event.httpMethod !== "GET") {
    await posthog.shutdown();
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const result = await getWeatherForecast(
    API_KEY ?? "",
    params?.lat ?? "",
    params?.lng ?? "",
  );

  if (result?.success) {
    posthog.capture({
      distinctId,
      event: "weather_forecast_retrieved",
      properties: {
        lat: params?.lat,
        lng: params?.lng,
      },
    });
    await posthog.shutdown();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    };
  }

  posthog.capture({
    distinctId,
    event: "weather_forecast_error",
    properties: {
      lat: params?.lat,
      lng: params?.lng,
      error_status: result?.error?.status,
      error_message: result?.error?.message,
    },
  });
  await posthog.shutdown();
  return {
    statusCode: result?.error?.status || 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result?.error),
  };
};
