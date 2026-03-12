import React from "react";
import type {
  DailyWeather,
  WeatherAlert,
  HourlyWeather,
  RunRecommendation,
} from "../types";
import {
  getRunRecommendation,
  getBestHourlyRunTimes,
} from "../utils/weatherUtils";
import { Card, Alert, Heading, Text, Flex, Box } from "@chakra-ui/react";
import { Sun, Cloud, CloudRain, Wind } from "lucide-react";

interface WeatherCardProps {
  day: DailyWeather;
  alerts?: WeatherAlert[];
  minTemp: number;
  maxTemp: number;
  hourlyForecast: HourlyWeather[];
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  day,
  alerts,
  minTemp,
  maxTemp,
  hourlyForecast,
}) => {
  const recommendation: RunRecommendation = getRunRecommendation(
    day,
    minTemp,
    maxTemp,
    alerts,
  );
  const { suitable, bestHours } = getBestHourlyRunTimes(
    hourlyForecast,
    minTemp,
    maxTemp,
  );

  const date = new Date(day.dt * 1000).toLocaleDateString();
  const dayOfWeek = new Date(day.dt * 1000).toLocaleDateString("en-US", {
    weekday: "short",
  });

  const sunsetTime = new Date(day.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunriseTime = new Date(day.sunrise * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes("sun"))
      return <Sun className="w-8 h-8 text-yellow-500" />;
    if (iconCode.includes("cloud"))
      return <Cloud className="w-8 h-8 text-gray-400" />;
    if (iconCode.includes("rain"))
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-gray-400" />; // Default icon
  };

  return (
    <Card.Root
      variant="elevated"
      bg="whiteAlpha.200"
      backdropFilter="blur(10px)"
      borderRadius="lg"
      p={4}
      boxShadow="lg"
      color="white"
      transition="all 0.3s"
      _hover={{ transform: "scale(1.05)" }}
      borderColor={"transparent"}
      display="flex"
      flexDirection="column"
      w={"250px"}
    >
      <Card.Header p={0} mb={4}>
        <Heading size="lg" textAlign={"center"}>
          {date} - {dayOfWeek}
        </Heading>
      </Card.Header>
      <Card.Body p={0}>
        <Flex align="center" justify="center" mb={2} gap="5">
          {getWeatherIcon(day.weather[0].description)}
          <Text fontSize="lg">
            {day.temp.min}°C / {day.temp.max}°C
          </Text>
        </Flex>

        <Box marginY={2}>
          <Text fontSize="sm" mb={1}>
            Conditions: {day.summary}
          </Text>
          <Text fontSize="sm" mb={1}>
            Sunrise: {sunriseTime}
          </Text>
          <Text fontSize="sm" mb={1}>
            Sunset: {sunsetTime}
          </Text>
          <Flex fontSize="sm" mb={2} align="center">
            Wind: {day.wind_speed} m/s {day.wind_deg}°{" "}
            <Box as={Wind} ml={1} w={4} h={4} />
          </Flex>
        </Box>

        <Alert.Root
          status={recommendation.type === "Outdoor run" ? "success" : "error"}
        >
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{recommendation.type}</Alert.Title>
            {recommendation.type !== "Outdoor run" && (
              <Alert.Description>{recommendation.reason}</Alert.Description>
            )}
          </Alert.Content>
        </Alert.Root>

        {suitable && (
          <Box mt={2}>
            <Text color="white" fontWeight="bold" fontSize="sm">
              Suitable for hourly run!
            </Text>
            <Text color="white" fontSize="xs">
              Best hours: {bestHours.join(", ")}
            </Text>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default WeatherCard;
