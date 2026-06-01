import { describe, it, expect } from "vitest";
import { getRunRecommendation, getBestHourlyRunTimes } from "./weatherUtils";
import { DailyWeather, HourlyWeather } from "@/types";

const mockDailyWeather: DailyWeather = {
  dt: 1711065600,
  sunrise: 1711043400,
  sunset: 1711088700,
  moonrise: 1711056000,
  moonset: 1711099200,
  moon_phase: 0.25,
  summary: "Partly cloudy with a chance of afternoon showers",
  temp: {
    day: 18.4,
    min: 15,
    max: 20,
    night: 13.1,
    eve: 16.8,
    morn: 12.3,
  },
  feels_like: {
    day: 17.9,
    night: 12.4,
    eve: 16.1,
    morn: 11.6,
  },
  pressure: 1013,
  humidity: 62,
  dew_point: 10.8,
  wind_speed: 4.2,
  wind_deg: 220,
  wind_gust: 7.8,
  weather: [
    {
      id: 803,
      main: "Clouds",
      description: "broken clouds",
      icon: "04d",
    },
  ],
  clouds: 58,
  pop: 0.35,
  uvi: 4.7,
  rain: 5,
};

describe("getRunRecommendation", () => {
  it("returns Indoor run when rain exceeds threshold", () => {
    expect(getRunRecommendation(mockDailyWeather, 10, 25)).toEqual({
      type: "Indoor run",
      reason: "It's raining",
    });
  });
});

const mockWeatherConditionCloudy = {
  id: 803,
  main: "Clouds",
  description: "broken clouds",
  icon: "04d",
};

const makeHour = (dt: number, temp: number): HourlyWeather => ({
  dt,
  temp,
  feels_like: temp - 1,
  pressure: 1008,
  humidity: 72,
  dew_point: 12.9,
  uvi: 1.4,
  clouds: 75,
  visibility: 8000,
  wind_speed: 6.2,
  wind_deg: 210,
  wind_gust: 9.4,
  weather: [mockWeatherConditionCloudy],
  pop: 0.1,
});

const mockHours: HourlyWeather[] = [
  {
    dt: 1716123600,
    temp: 18,
    feels_like: 17.5,
    pressure: 1008,
    humidity: 72,
    dew_point: 12.9,
    uvi: 1.4,
    clouds: 75,
    visibility: 8000,
    wind_speed: 6.2,
    wind_deg: 210,
    wind_gust: 9.4,
    weather: [mockWeatherConditionCloudy],
    pop: 0.35,
  },
  {
    dt: 1716127200, // +1h
    temp: 19,
    feels_like: 17.5,
    pressure: 1008,
    humidity: 72,
    dew_point: 12.9,
    uvi: 1.4,
    clouds: 75,
    visibility: 8000,
    wind_speed: 6.2,
    wind_deg: 210,
    wind_gust: 9.4,
    weather: [mockWeatherConditionCloudy],
    pop: 0.35,
  },
  {
    dt: 1716130800, // +2h
    temp: 20,
    feels_like: 17.5,
    pressure: 1008,
    humidity: 72,
    dew_point: 12.9,
    uvi: 1.4,
    clouds: 75,
    visibility: 8000,
    wind_speed: 6.2,
    wind_deg: 210,
    wind_gust: 9.4,
    weather: [mockWeatherConditionCloudy],
    pop: 0.35,
  },
];

describe("getBestHourlyRunTimes", () => {
  it("returns 3 suitable hours, sorted by temperature", () => {
    expect(getBestHourlyRunTimes(mockHours, 10, 25, "America/New_York")).toEqual({
      bestHours: ["11:00 AM (20°C)", "10:00 AM (19°C)", "09:00 AM (18°C)"],
      suitable: true,
    });
  });

  it("returns suitable hours even when fewer than 3 qualify", () => {
    // minTemp=19 excludes the 18°C hour; 19°C and 20°C still qualify
    expect(getBestHourlyRunTimes(mockHours, 19, 25, "America/New_York")).toEqual({
      bestHours: ["11:00 AM (20°C)", "10:00 AM (19°C)"],
      suitable: true,
    });
  });

  it("returns no suitable hours when temperatures are out of range", () => {
    // mockHours temps are 18–20°C, all below minTemp of 25
    expect(getBestHourlyRunTimes(mockHours, 25, 35, "America/New_York")).toEqual({
      bestHours: [],
      suitable: false,
    });
  });

  it("returns no suitable hours when all hours are outside the time window", () => {
    // 4–6 AM EDT — all before the 8 AM cutoff
    const earlyHours = [
      makeHour(1716105600, 20), // 4 AM EDT
      makeHour(1716109200, 20), // 5 AM EDT
      makeHour(1716112800, 20), // 6 AM EDT
    ];
    expect(getBestHourlyRunTimes(earlyHours, 10, 25, "America/New_York")).toEqual({
      bestHours: [],
      suitable: false,
    });
  });

  it("includes 8 AM as the start boundary", () => {
    // 7 AM is excluded; 8 AM, 9 AM, 10 AM give exactly 3 suitable hours
    const hours = [
      makeHour(1716116400, 18), // 7 AM EDT — excluded
      makeHour(1716120000, 18), // 8 AM EDT — boundary, must be included
      makeHour(1716123600, 19), // 9 AM EDT
      makeHour(1716127200, 20), // 10 AM EDT
    ];
    expect(getBestHourlyRunTimes(hours, 10, 25, "America/New_York")).toEqual({
      bestHours: ["10:00 AM (20°C)", "09:00 AM (19°C)", "08:00 AM (18°C)"],
      suitable: true,
    });
  });

  it("includes 8 PM as the end boundary", () => {
    // 6 PM, 7 PM, 8 PM give exactly 3 suitable hours; 9 PM is excluded
    const hours = [
      makeHour(1716156000, 18), // 6 PM EDT
      makeHour(1716159600, 19), // 7 PM EDT
      makeHour(1716163200, 20), // 8 PM EDT — boundary, must be included
      makeHour(1716166800, 20), // 9 PM EDT — excluded
    ];
    expect(getBestHourlyRunTimes(hours, 10, 25, "America/New_York")).toEqual({
      bestHours: ["08:00 PM (20°C)", "07:00 PM (19°C)", "06:00 PM (18°C)"],
      suitable: true,
    });
  });
});
