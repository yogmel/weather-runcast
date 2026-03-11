import { useEffect, useState } from "react";
import { Coordinates } from "@/types";
import { useLocationQuery } from "@/api/useLocationQuery";
import { useForecastQuery } from "@/api/useForecastQuery";
import { ScrollArea, Flex, Spinner, Heading } from "@chakra-ui/react";
import WeatherCard from "./WeatherCard";

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
  const [latLng, setLatLng] = useState<Coordinates | null>(null);

  const { data: coordinates, isLoading } = useLocationQuery({
    location,
    enabled: location !== "",
  });

  const { data: forecast, isLoading: isForecastLoading } = useForecastQuery({
    coordinates: { lat: latLng?.lat ?? 0, lng: latLng?.lng ?? 0 },
    enabled: latLng !== null,
  });

  useEffect(() => {
    setLoading(isLoading);
    setError(null);

    if (coordinates !== undefined) {
      setLatLng(coordinates);
    } else {
      setError("Location not found. Please try again.");
    }
  }, [coordinates, isLoading]);

  return (
    <>
      {isLoading || (isForecastLoading && <Spinner />)}
      {!isLoading && !isForecastLoading && latLng && forecast !== undefined && (
        <>
          <Heading>Showing Forecast for {coordinates?.name}</Heading>

          <ScrollArea.Root width="100vw" size="xs" p={5}>
            <ScrollArea.Viewport>
              <ScrollArea.Content>
                <Flex gap="5">
                  {forecast &&
                    forecast.daily.slice(0, 7).map((day) => (
                      <WeatherCard
                        key={day.dt}
                        day={day}
                        alerts={forecast.alerts}
                        minTemp={parseInt(minTemp)}
                        maxTemp={parseInt(maxTemp)}
                        hourlyForecast={forecast.hourly.filter((hour) => {
                          const dayStart = day.dt;
                          const dayEnd = day.dt + 24 * 60 * 60; // 24 hours in seconds
                          return hour.dt >= dayStart && hour.dt < dayEnd;
                        })}
                      />
                    ))}
                </Flex>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="horizontal" />
            <ScrollArea.Corner />
          </ScrollArea.Root>
        </>
      )}
    </>
  );
};
