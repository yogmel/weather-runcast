import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getLatLngFromLocation,
  getWeatherForecast,
} from "./src/api/openWeather";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENWEATHER_API_KEY;

app.get("/api/location", async (req, res) => {
  console.log("Function called with method:", req.method);
  console.log("Query params:", req.query);

  try {
    const result = await getLatLngFromLocation(
      API_KEY ?? "",
      req.query.location,
    );

    if (result.success) {
      return res.status(200).json(result.data);
    }

    return res.status(result.error?.status || 500).json(result.error);
  } catch (error) {
    console.error("Error in location endpoint:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/weather", async (req, res) => {
  console.log("Function called with method:", req.method);
  console.log("Query params:", req.query);

  try {
    const result = await getWeatherForecast(
      API_KEY ?? "",
      req.query.lat,
      req.query.lng,
    );

    if (result.success) {
      return res.status(200).json(result.data);
    }

    return res.status(result.error?.status || 500).json(result.error);
  } catch (error) {
    console.error("Error in weather endpoint:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
});
