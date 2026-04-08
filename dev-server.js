import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PostHog } from "posthog-node";
import {
  getLatLngFromLocation,
  getWeatherForecast,
} from "./src/api/openWeather";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENWEATHER_API_KEY;

const posthog = new PostHog(process.env.POSTHOG_KEY, {
  host: process.env.POSTHOG_HOST,
  enableExceptionAutocapture: true,
});

process.on("SIGINT", async () => {
  await posthog.shutdown();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await posthog.shutdown();
  process.exit(0);
});

app.get("/api/location", async (req, res) => {
  console.log("Function called with method:", req.method);
  console.log("Query params: DEV-SERVER", req.query);

  const distinctId =
    req.headers["x-posthog-distinct-id"] || req.ip || "anonymous";

  try {
    const result = await getLatLngFromLocation(
      API_KEY ?? "",
      req.query.location,
    );

    if (result.success) {
      posthog.capture({
        distinctId,
        event: "location_searched",
        properties: {
          location: req.query.location,
          resolved_name: result.data?.name,
        },
      });
      return res.status(200).json(result.data);
    }

    posthog.capture({
      distinctId,
      event: "location_not_found",
      properties: {
        location: req.query.location,
        error_status: result.error?.status,
      },
    });
    return res.status(result.error?.status || 500).json(result.error);
  } catch (error) {
    console.error("Error in location endpoint:", error);
    posthog.captureException(error, distinctId);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/weather", async (req, res) => {
  console.log("Function called with method:", req.method);
  console.log("Query params: DEV-SERVER", req.query);

  const distinctId =
    req.headers["x-posthog-distinct-id"] || req.ip || "anonymous";

  try {
    const result = await getWeatherForecast(
      API_KEY ?? "",
      req.query.lat,
      req.query.lng,
    );

    if (result.success) {
      posthog.capture({
        distinctId,
        event: "weather_forecast_retrieved",
        properties: {
          lat: req.query.lat,
          lng: req.query.lng,
        },
      });
      return res.status(200).json(result.data);
    }

    posthog.capture({
      distinctId,
      event: "api_error",
      properties: {
        endpoint: "/api/weather",
        error_status: result.error?.status,
        error_message: result.error?.message,
      },
    });
    return res.status(result.error?.status || 500).json(result.error);
  } catch (error) {
    console.error("Error in weather endpoint:", error);
    posthog.captureException(error, distinctId);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
});
