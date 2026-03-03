import axios from "axios";
import { useState, useEffect } from "react";
import { getApiUrl } from "../api/config";
import { LatLng } from "@/types";

interface UseLocationParams {
  location: string;
}

interface UseLocation {
  coordinates: LatLng | null;
  isLoading: boolean;
}

export const useLocation = ({ location }: UseLocationParams): UseLocation => {
  const [coordinates, setCoordinates] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCoordinates = async () => {
    const response = await axios.get(
      getApiUrl("location", `location=${location}`),
    );

    return response.data;
  };

  useEffect(() => {
    fetchCoordinates()
      .then((data) => {
        setCoordinates(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { coordinates, isLoading };
};
