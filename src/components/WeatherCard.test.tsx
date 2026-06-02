import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import WeatherCard from "./WeatherCard";
import type { DailyWeather } from "../types";
import * as weatherUtils from "../utils/weatherUtils";

vi.mock("../utils/weatherUtils");

const mockDay: DailyWeather = {
  dt: 1711065600,
  sunrise: 1711043400,
  sunset: 1711088700,
  moonrise: 1711056000,
  moonset: 1711099200,
  moon_phase: 0.25,
  summary: "Partly cloudy",
  temp: { day: 18, min: 15, max: 20, night: 13, eve: 16, morn: 12 },
  feels_like: { day: 17, night: 12, eve: 15, morn: 11 },
  pressure: 1013,
  humidity: 62,
  dew_point: 10,
  wind_speed: 4.2,
  wind_deg: 220,
  wind_gust: 7.8,
  weather: [{ id: 803, main: "Clouds", description: "broken clouds", icon: "04d" }],
  clouds: 58,
  pop: 0.35,
  uvi: 4.7,
};

const renderCard = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <WeatherCard day={mockDay} minTemp={10} maxTemp={25} hourlyForecast={[]} />
    </ChakraProvider>,
  );

describe("WeatherCard", () => {
  beforeEach(() => {
    vi.mocked(weatherUtils.getRunRecommendation).mockReturnValue({ type: "Outdoor run" });
    vi.mocked(weatherUtils.getBestHourlyRunTimes).mockReturnValue({ suitable: false, bestHours: [] });
  });

  it("renders the Outdoor run badge", () => {
    renderCard();
    expect(screen.getByText("Outdoor run")).toBeInTheDocument();
  });

  it("renders the Indoor run badge with reason", () => {
    vi.mocked(weatherUtils.getRunRecommendation).mockReturnValue({
      type: "Indoor run",
      reason: "It's raining",
    });
    renderCard();
    expect(screen.getByText("Indoor run")).toBeInTheDocument();
    expect(screen.getByText("It's raining")).toBeInTheDocument();
  });

  it("renders best hours when suitable hours exist", () => {
    vi.mocked(weatherUtils.getBestHourlyRunTimes).mockReturnValue({
      suitable: true,
      bestHours: ["10:00 AM (20°C)", "09:00 AM (18°C)"],
    });
    renderCard();
    expect(screen.getByText("Suitable for hourly run!")).toBeInTheDocument();
    expect(screen.getByText("Best hours: 10:00 AM (20°C), 09:00 AM (18°C)")).toBeInTheDocument();
  });

  it("hides best hours when none are suitable", () => {
    renderCard();
    expect(screen.queryByText("Suitable for hourly run!")).not.toBeInTheDocument();
  });
});
