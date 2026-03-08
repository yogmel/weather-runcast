import axios from "axios";
import { useState, useEffect } from "react";
import { getApiUrl } from "../api/config";
import { LatLng, WeatherForecast } from "@/types";

interface UseWeatherParams {
  coordinates: LatLng;
}

interface UseWeather {
  weather: WeatherForecast | null;
  isLoading: boolean;
}

export const useWeather = ({ coordinates }: UseWeatherParams): UseWeather => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);

  const { lat, lng } = coordinates;

  const fetchCoordinates = async () => {
    const response = await axios.get(
      getApiUrl("weather", `lat=${lat}&lng=${lng}`),
    );

    return response.data;
  };

  useEffect(() => {
    if (coordinates) {
      fetchCoordinates()
        .then((data) => {
          setWeather(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  return { weather, isLoading };
};
