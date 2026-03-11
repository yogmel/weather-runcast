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
    queryKey: ["forecast", coordinates],
    queryFn: async (): Promise<WeatherForecast> => {
      const response = await axios.get(
        getApiUrl("weather", `lat=${lat}&lng=${lng}`),
      );

      return response.data;
    },
    enabled,
  });
};
