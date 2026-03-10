import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { getApiUrl } from "./config";
import { Coordinates } from "@/types";

interface UseLocationQueryParam {
  location: string;
  enabled?: boolean;
}

export const useLocationQuery = ({
  location,
  enabled = true,
}: UseLocationQueryParam): UseQueryResult<Coordinates> => {
  return useQuery({
    queryKey: ["location", location],
    queryFn: async (): Promise<Coordinates> => {
      const response = await axios.get(
        getApiUrl("location", `location=${location}`),
      );

      return response.data;
    },
    enabled,
  });
};
