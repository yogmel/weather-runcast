import { Handler } from "@netlify/functions";
import { getWeatherForecast } from "../../src/api/openWeather";

export const handler: Handler = async (event) => {
  const params = event.queryStringParameters;

  console.log("Function called with method:", event.httpMethod);
  console.log("Query params: NETLIFY", event.queryStringParameters);

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (event.httpMethod !== "GET") {
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
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    };
  }

  return {
    statusCode: result?.error?.status || 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result?.error),
  };
};
