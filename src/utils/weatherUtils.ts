import type {
  DailyWeather,
  WeatherAlert,
  HourlyWeather,
  RunRecommendation,
} from "../types";

export const getRunRecommendation = (
  day: DailyWeather,
  minTemp: number,
  maxTemp: number,
  alerts?: WeatherAlert[]
): RunRecommendation => {
  const maxWindSpeed = 5; // m/s (approx 18 km/h or 11 mph)
  const maxRainVolume = 2; // mm (any rain makes it unsuitable)

  // If it's raining, it's not suitable for outdoor running, regardless of temperature.
  if ((day.rain || 0) > maxRainVolume) {
    return { type: "Indoor run", reason: "It's raining" };
  }

  const isIdealTemperature = day.temp.min >= minTemp && day.temp.max <= maxTemp;
  const isLowWind = day.wind_speed <= maxWindSpeed;
  const isNoAlerts = !(alerts && alerts.length > 0); // Simplified check for any alerts

  if (isIdealTemperature && isLowWind && isNoAlerts) {
    return { type: "Outdoor run" };
  } else {
    let reason = "";
    if (!isIdealTemperature) {
      reason += "Temperature is not ideal. ";
    }
    if (!isLowWind) {
      reason += "Wind speed is too high. ";
    }
    if (!isNoAlerts) {
      reason += "Weather alerts are active. ";
    }
    return { type: "Indoor run", reason: reason.trim() };
  }
};

export const getBestOutdoorRunDay = (
  dailyForecast: DailyWeather[],
  minTemp: number,
  maxTemp: number,
  alerts?: WeatherAlert[]
): RunRecommendation | null => {
  for (const day of dailyForecast) {
    const recommendation = getRunRecommendation(day, minTemp, maxTemp, alerts);
    if (recommendation.type === "Outdoor run") {
      return recommendation;
    }
  }
  return null;
};

export const getHourlyRunRecommendation = (
  hour: HourlyWeather,
  minTemp: number,
  maxTemp: number
): RunRecommendation => {
  const maxWindSpeed = 5; // m/s (approx 18 km/h or 11 mph)
  const maxRainVolume = 0; // mm (any rain makes it unsuitable)

  // If it's raining, it's not suitable for outdoor running, regardless of temperature.
  if ((hour.rain?.["1h"] || 0) > maxRainVolume) {
    return { type: "Indoor run", reason: "It's raining" };
  }

  const isIdealTemperature = hour.temp >= minTemp && hour.temp <= maxTemp;
  const isLowWind = hour.wind_speed <= maxWindSpeed;

  if (isIdealTemperature && isLowWind) {
    return { type: "Outdoor run" };
  } else {
    let reason = "";
    if (!isIdealTemperature) {
      reason += "Temperature is not ideal. ";
    }
    if (!isLowWind) {
      reason += "Wind speed is too high. ";
    }
    return { type: "Indoor run", reason: reason.trim() };
  }
};

export const getBestHourlyRunTimes = (
  hourlyForecast: HourlyWeather[],
  minTemp: number,
  maxTemp: number
): { suitable: boolean; bestHours: string[] } => {
  const suitableHours: HourlyWeather[] = [];
  const startHour = 9; // 9 AM
  const endHour = 20; // 8 PM

  hourlyForecast.forEach((hour) => {
    const hourOfDay = new Date(hour.dt * 1000).getHours();
    if (hourOfDay >= startHour && hourOfDay <= endHour) {
      const recommendation = getHourlyRunRecommendation(hour, minTemp, maxTemp);
      if (recommendation.type === "Outdoor run") {
        suitableHours.push(hour);
      }
    }
  });

  if (suitableHours.length >= 3) {
    // Sort by temperature in descending order to find the best hours
    suitableHours.sort((a, b) => b.temp - a.temp);

    const bestHours = suitableHours
      .slice(0, Math.min(suitableHours.length, 3)) // Take up to 3 warmest hours
      .map((hour) => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${time} (${hour.temp}°C)`;
      });

    return { suitable: true, bestHours };
  }

  return { suitable: false, bestHours: [] };
};
