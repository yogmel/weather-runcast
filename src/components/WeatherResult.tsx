import { useLocation } from "@/hooks/useLocation";
import { useEffect, useState } from "react";
import { LatLng } from "@/types";
import { WeatherResultCard } from "./WeatherResultCard";

interface WeatherResultProps {
  location: string;
  minTemp: string;
  maxTemp: string;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const WeatherResult = ({
  location,
  minTemp,
  maxTemp,
  setError,
  setLoading,
}: WeatherResultProps) => {
  const [latLng, setLatLng] = useState<LatLng | null>(null);

  const { coordinates } = useLocation({ location });

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      if (coordinates !== null) {
        setLatLng(coordinates);
      } else {
        setError("Location not found. Please try again.");
      }
    } catch (err) {
      setError("Failed to fetch location data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [coordinates]);

  return (
    <>
      {latLng && (
        <WeatherResultCard
          latLng={latLng}
          minTemp={minTemp}
          maxTemp={maxTemp}
          setLoading={setLoading}
          setError={setError}
        />
      )}
    </>
  );
};
