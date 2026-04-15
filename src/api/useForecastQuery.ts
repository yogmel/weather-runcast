import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { getApiUrl } from "./config";
import { Coordinates, WeatherForecast } from "@/types";

interface UseForecastQueryParam {
  coordinates: Pick<Coordinates, "lat" | "lng">;
  enabled?: boolean;
}

export const useForecastQuery = ({
  coordinates,
  enabled = true,
}: UseForecastQueryParam): UseQueryResult<WeatherForecast> => {
  const { lat, lng } = coordinates;

  return useQuery({
    queryKey: ["forecast", lat, lng],
    queryFn: async (): Promise<WeatherForecast> => {
      const response = await axios.get(
        getApiUrl("weather", `lat=${lat}&lng=${lng}`),
      );

      return response.data;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000,    // 30 min
  });
};