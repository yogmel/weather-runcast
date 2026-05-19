import { describe, it, expect } from "vitest";
import { getRunRecommendation } from "./weatherUtils";
import { DailyWeather } from "@/types";

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
  rain: 0,
};

describe("getRunRecommendation", () => {
  it("returns Outdoor run when ideal temperature and no rain", () => {
    expect(getRunRecommendation(mockDailyWeather, 10, 25)).toEqual({
      type: "Outdoor run",
    });
  });

  it("returns Indoor run when rain exceeds threshold", () => {
    expect(
      getRunRecommendation({ ...mockDailyWeather, rain: 3 }, 10, 25),
    ).toEqual({
      type: "Indoor run",
      reason: "It's raining",
    });
  });

  it("returns Indoor run when outside of temperature range", () => {
    expect(getRunRecommendation(mockDailyWeather, 21, 25)).toEqual({
      type: "Indoor run",
      reason: "Temperature is not ideal.",
    });
  });

  it("returns Indoor run when alerts active", () => {
    const alertsMock = [
      {
        sender_name: "JMA",
        event: "Wind",
        start: 1779159601,
        end: 1779202800,
        description: "",
        tags: ["Wind"],
      },
    ];

    expect(getRunRecommendation(mockDailyWeather, 10, 25, alertsMock)).toEqual({
      type: "Indoor run",
      reason: "Weather alerts are active.",
    });
  });

  it("returns Indoor run when outside of temperature range and alerts active", () => {
    const alertsMock = [
      {
        sender_name: "JMA",
        event: "Wind",
        start: 1779159601,
        end: 1779202800,
        description: "",
        tags: ["Wind"],
      },
    ];

    expect(getRunRecommendation(mockDailyWeather, 21, 25, alertsMock)).toEqual({
      type: "Indoor run",
      reason: "Temperature is not ideal. Weather alerts are active.",
    });
  });
});
