import type { DailyWeather, WeatherAlert } from "../types";

export const getRunRecommendation = (
  day: DailyWeather,
  minTemp: number,
  maxTemp: number,
  alerts?: WeatherAlert[]
): "Outdoor run" | "Indoor run" => {
  const maxWindSpeed = 5; // m/s (approx 18 km/h or 11 mph)
  const maxRainVolume = 2; // mm (any rain makes it unsuitable)

  // If it's raining, it's not suitable for outdoor running, regardless of temperature.
  if ((day.rain || 0) > maxRainVolume) {
    return "Indoor run";
  }

  const isIdealTemperature = day.temp.min >= minTemp && day.temp.max <= maxTemp;
  const isLowWind = day.wind_speed <= maxWindSpeed;
  const isNoAlerts = !(alerts && alerts.length > 0); // Simplified check for any alerts

  if (isIdealTemperature && isLowWind && isNoAlerts) {
    return "Outdoor run";
  } else {
    return "Indoor run";
  }
};

export const getBestOutdoorRunDay = (
  dailyForecast: DailyWeather[],
  minTemp: number,
  maxTemp: number,
  alerts?: WeatherAlert[]
): DailyWeather | null => {
  const outdoorRunDays = dailyForecast.filter((day) => {
    const recommendation = getRunRecommendation(day, minTemp, maxTemp, alerts);
    return recommendation === "Outdoor run";
  });

  // For simplicity, we'll pick the first suitable day.
  // More complex logic could involve considering temperature closer to ideal,
  // or specific time slots before sunset.
  if (outdoorRunDays.length > 0) {
    return outdoorRunDays[0];
  }

  return null;
};
