import { Handler } from "@netlify/functions";
import { PostHog } from "posthog-node";
import { getLatLngFromLocation } from "../../src/api/openWeather";

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

  const result = await getLatLngFromLocation(
    API_KEY ?? "",
    params?.location ?? "",
  );

  if (result?.success) {
    posthog.capture({
      distinctId,
      event: "location_searched",
      properties: {
        location: params?.location,
        resolved_name: result.data?.name,
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
    event: "location_not_found",
    properties: {
      location: params?.location,
      error_status: result?.error?.status,
    },
  });
  await posthog.shutdown();
  return {
    statusCode: result?.error?.status || 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result?.error),
  };
};
