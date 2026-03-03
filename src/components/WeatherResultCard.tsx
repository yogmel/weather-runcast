import { ScrollArea, Flex } from "@chakra-ui/react";
import WeatherCard from "./WeatherCard";
import { FC, useEffect, useState } from "react";
import { useWeather } from "@/hooks/useWeather";
import { LatLng, WeatherForecast } from "@/types";

interface WeatherResultCardProps {
  latLng: LatLng;
  minTemp: string;
  maxTemp: string;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const WeatherResultCard: FC<WeatherResultCardProps> = ({
  latLng,
  minTemp,
  maxTemp,
  setError,
  setLoading,
}) => {
  const weatherData = useWeather({
    coordinates: { lat: latLng.lat, lng: latLng.lng },
  });

  const [forecast, setForecast] = useState<WeatherForecast | null>(null);

  console.log("forecast", forecast);

  useEffect(() => {
    const fetchWeather = async () => {
      if (weatherData.weather) {
        setLoading(true);
        setError(null);
        try {
          if (weatherData) {
            setForecast(weatherData.weather);
          } else {
            setError("Failed to fetch weather forecast.");
          }
        } catch (err) {
          setError("Failed to fetch weather forecast.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchWeather();
  }, [latLng, weatherData]);

  return (
    <>
      {forecast && (
        <ScrollArea.Root width="100vw" size="xs" p={5}>
          <ScrollArea.Viewport>
            <ScrollArea.Content>
              <Flex gap="5">
                {forecast.daily.slice(0, 7).map((day) => (
                  <WeatherCard
                    key={day.dt} // Use a unique identifier for key
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
      )}
    </>
  );
};
