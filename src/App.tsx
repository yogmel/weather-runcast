import { useState, useEffect } from "react";
import { getLatLngFromLocation, getWeatherForecast } from "./api/openWeather";
import type { LatLng, WeatherForecast } from "./types";
import "./App.css";
import {
  Input,
  Button,
  Heading,
  Text,
  Box,
  Stack,
  ScrollArea,
  Flex,
  Field,
} from "@chakra-ui/react";
import WeatherCard from "./components/WeatherCard";

function App() {
  const [location, setLocation] = useState<string>(
    localStorage.getItem("lastLocation") || "",
  );
  const [minTemp, setMinTemp] = useState<string>("10"); // Default min temperature
  const [maxTemp, setMaxTemp] = useState<string>("25"); // Default max temperature
  const [latLng, setLatLng] = useState<LatLng | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!location) {
      setError("Please enter a location.");
      return;
    }
    setLoading(true);
    setError(null);
    setForecast(null);

    try {
      const coords = await getLatLngFromLocation(location);
      if (coords) {
        setLatLng(coords);
      } else {
        setError("Location not found. Please try again.");
      }
    } catch (err) {
      setError("Failed to fetch location data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      localStorage.setItem("lastLocation", location);
    }
  }, [location]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (latLng) {
        setLoading(true);
        setError(null);
        try {
          const weatherData = await getWeatherForecast(latLng.lat, latLng.lng);
          if (weatherData) {
            setForecast(weatherData);
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
  }, [latLng]);

  return (
    <Box
      minH="100vh"
      bgGradient="linear(colorPalette.400, colorPalette.600)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Heading as="h1" size="2xl" color="white" mb={8}>
        Weather RunCast
      </Heading>
      <Stack direction="column" mb={8} w="full" maxW="md">
        <Field.Root orientation="horizontal">
          <Field.Label>Location:</Field.Label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., San Francisco)"
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
          />
          <Button
            onClick={handleSearch}
            colorScheme="blue"
            loading={loading}
            loadingText="Searching..."
          >
            Search
          </Button>
        </Field.Root>

        <Stack direction={"row"} mt={2} gap="5">
          <Field.Root orientation="horizontal">
            <Field.Label>Min temp:</Field.Label>
            <Input
              type="number"
              value={minTemp}
              onChange={(e) => setMinTemp(e.target.value)}
              placeholder="Min Temp (°C)"
              bg="white"
              _placeholder={{ color: "gray.400" }}
            />
            <span>°C</span>
          </Field.Root>

          <Field.Root orientation="horizontal">
            <Field.Label>Max temp:</Field.Label>
            <Input
              type="number"
              value={maxTemp}
              onChange={(e) => setMaxTemp(e.target.value)}
              placeholder="Max Temp (°C)"
              bg="white"
              _placeholder={{ color: "gray.400" }}
            />
            <span>°C</span>
          </Field.Root>
        </Stack>
      </Stack>

      {error && (
        <Text color="red.300" mb={4}>
          {error}
        </Text>
      )}

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
    </Box>
  );
}

export default App;
