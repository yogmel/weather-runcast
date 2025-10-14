import React from "react";
import type { DailyWeather, WeatherAlert } from "../types";
import { getRunRecommendation } from "../utils/weatherUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, Wind } from "lucide-react";
import { motion } from "framer-motion";

interface WeatherCardProps {
  day: DailyWeather;
  alerts?: WeatherAlert[];
  isBestDay: boolean;
  minTemp: number;
  maxTemp: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  day,
  alerts,
  isBestDay,
  minTemp,
  maxTemp,
}) => {
  const recommendation = getRunRecommendation(day, minTemp, maxTemp, alerts);
  const date = new Date(day.dt * 1000).toLocaleDateString();
  const sunsetTime = new Date(day.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getWeatherIcon = (iconCode: string) => {
    // You would typically map OpenWeatherMap icon codes to actual icon components
    // For simplicity, using a few examples
    if (iconCode.includes("sun"))
      return <Sun className="w-8 h-8 text-yellow-500" />;
    if (iconCode.includes("cloud"))
      return <Cloud className="w-8 h-8 text-gray-400" />;
    if (iconCode.includes("rain"))
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-gray-400" />; // Default icon
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 shadow-lg text-white transform transition-all duration-300 hover:scale-105
            ${isBestDay ? "border-2 border-green-400" : ""}`}
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{date}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getWeatherIcon(day.weather[0].icon)}
              <p className="text-lg">
                {day.temp.min}°C / {day.temp.max}°C
              </p>
            </div>
            <p className="text-sm mb-1">
              Condition: {day.weather[0].description}
            </p>
            <p className="text-sm mb-1">Sunset: {sunsetTime}</p>
            <p className="text-sm mb-2 flex items-center">
              Wind: {day.wind_speed} m/s {day.wind_deg}°{" "}
              <Wind className="ml-1 w-4 h-4" />
            </p>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-white mt-2 ${
                recommendation === "Outdoor run" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {recommendation}
            </span>
            {isBestDay && (
              <p className="text-green-300 font-bold text-sm mt-2">
                Best day for outdoor run!
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default WeatherCard;
