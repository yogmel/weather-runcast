import { useState, useEffect } from "react";
import { getLatLngFromLocation, getWeatherForecast } from "./api/openWeather";
import type { LatLng, WeatherForecast } from "./types";
import "./App.css";
import {
  getRunRecommendation,
  getBestOutdoorRunDay,
} from "./utils/weatherUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WeatherCard from "./components/WeatherCard";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [location, setLocation] = useState<string>(
    localStorage.getItem("lastLocation") || ""
  );
  const [minTemp, setMinTemp] = useState<string>("10"); // Default min temperature
  const [maxTemp, setMaxTemp] = useState<string>("25"); // Default max temperature
  const [latLng, setLatLng] = useState<LatLng | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!location) {
      setError("Please enter a location.");
      return;
    }
    setLoading(true);
    setError(null);
    setForecast(null);

    try {
      const coords = await getLatLngFromLocation(location);
      if (coords) {
        setLatLng(coords);
      } else {
        setError("Location not found. Please try again.");
      }
    } catch (err) {
      setError("Failed to fetch location data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      localStorage.setItem("lastLocation", location);
    }
  }, [location]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (latLng) {
        setLoading(true);
        setError(null);
        try {
          const weatherData = await getWeatherForecast(latLng.lat, latLng.lng);
          if (weatherData) {
            setForecast(weatherData);
          } else {
            setError("Failed to fetch weather forecast.");
          }
        } catch (err) {
          setError("Failed to fetch weather forecast.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchWeather();
  }, [latLng]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8">RunCast</h1>
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., San Francisco)"
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={minTemp}
            onChange={(e) => setMinTemp(e.target.value)}
            placeholder="Min Temp (°C)"
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Input
            type="number"
            value={maxTemp}
            onChange={(e) => setMaxTemp(e.target.value)}
            placeholder="Max Temp (°C)"
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-red-300 mb-4">{error}</p>}

      {forecast && (
        <AnimatePresence>
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {forecast.daily.slice(0, 7).map((day, index) => (
              <WeatherCard
                key={day.dt} // Use a unique identifier for key
                day={day}
                alerts={forecast.alerts}
                minTemp={parseInt(minTemp)}
                maxTemp={parseInt(maxTemp)}
                isBestDay={
                  index === 0 &&
                  !!getBestOutdoorRunDay(
                    forecast.daily,
                    parseInt(minTemp),
                    parseInt(maxTemp),
                    forecast.alerts
                  )
                }
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
