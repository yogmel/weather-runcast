import type {
  DailyWeather,
  WeatherAlert,
  HourlyWeather,
  RunRecommendation,
} from "../types";

const MAX_RAIN_VOLUME = 2; // mm (any rain makes it unsuitable)

export const getRunRecommendation = (
  day: DailyWeather,
  minTemp: number,
  maxTemp: number,
  alerts?: WeatherAlert[],
): RunRecommendation => {
  if ((day.rain || 0) > MAX_RAIN_VOLUME) {
    return { type: "Indoor run", reason: "It's raining" };
  }

  const isIdealTemperature = day.temp.min <= maxTemp && day.temp.max >= minTemp;
  const isNoAlerts = !(alerts && alerts.length > 0);

  if (isIdealTemperature && isNoAlerts) {
    return { type: "Outdoor run" };
  } else {
    let reason = "";
    if (!isIdealTemperature) {
      reason += "Temperature is not ideal. ";
    }
    if (!isNoAlerts) {
      reason += "Weather alerts are active. ";
    }
    return { type: "Indoor run", reason: reason.trim() };
  }
};

const getHourlyRunRecommendation = (
  hour: HourlyWeather,
  minTemp: number,
  maxTemp: number,
): RunRecommendation => {
  if ((hour.rain?.["1h"] || 0) > MAX_RAIN_VOLUME) {
    return { type: "Indoor run", reason: "It's raining" };
  }

  const isIdealTemperature = hour.temp >= minTemp && hour.temp <= maxTemp;

  if (isIdealTemperature) {
    return { type: "Outdoor run" };
  }
  return { type: "Indoor run", reason: "Temperature is not ideal. " };
};

export const getBestHourlyRunTimes = (
  hourlyForecast: HourlyWeather[],
  minTemp: number,
  maxTemp: number,
): { suitable: boolean; bestHours: string[] } => {
  const suitableHours: HourlyWeather[] = [];
  const startHour = 8;
  const endHour = 20;

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
