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
import {
  Card,
  Alert,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Flex,
  Box,
  AlertTitle,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { Sun, Cloud, CloudRain, Wind } from "lucide-react";

interface WeatherCardProps {
  day: DailyWeather;
  alerts?: WeatherAlert[];
  isBestDay: boolean;
  minTemp: number;
  maxTemp: number;
  hourlyForecast: HourlyWeather[];
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  day,
  alerts,
  isBestDay,
  minTemp,
  maxTemp,
  hourlyForecast,
}) => {
  const recommendation: RunRecommendation = getRunRecommendation(
    day,
    minTemp,
    maxTemp,
    alerts
  );
  const { suitable, bestHours } = getBestHourlyRunTimes(
    hourlyForecast,
    minTemp,
    maxTemp
  );
  const date = new Date(day.dt * 1000).toLocaleDateString();
  const sunsetTime = new Date(day.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getWeatherIcon = (iconCode: string) => {
    // You would typically map OpenWeatherMap icon codes to actual icon components
    // For simplicity, using a few examples
    if (iconCode.includes("sun"))
      return <Sun className="w-8 h-8 text-yellow-500" />;
    if (iconCode.includes("cloud"))
      return <Cloud className="w-8 h-8 text-gray-400" />;
    if (iconCode.includes("rain"))
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-gray-400" />; // Default icon
  };

  return (
    <Card
      variant="elevated"
      bg="whiteAlpha.200"
      backdropFilter="blur(10px)"
      borderRadius="lg"
      p={4}
      boxShadow="lg"
      color="white"
      transition="all 0.3s"
      _hover={{ transform: "scale(1.05)" }}
      border={isBestDay ? "2px solid" : "none"}
      borderColor={isBestDay ? "green.400" : "transparent"}
      display="flex"
      flexDirection="column"
      className="max-w-xs w-full"
    >
      <CardHeader p={0} mb={2}>
        <Heading size="md">{date}</Heading>
      </CardHeader>
      <CardBody p={0}>
        <Flex align="center" justify="space-between" mb={2}>
          {getWeatherIcon(day.weather[0].icon)}
          <Text fontSize="lg">
            {day.temp.min}°C / {day.temp.max}°C
          </Text>
        </Flex>
        <Text fontSize="sm" mb={1}>
          Conditions: {day.weather[0].description}
        </Text>
        <Text fontSize="sm" mb={1}>
          Sunset: {sunsetTime}
        </Text>
        <Flex fontSize="sm" mb={2} align="center">
          Wind: {day.wind_speed} m/s {day.wind_deg}°{" "}
          <Box as={Wind} ml={1} w={4} h={4} />
        </Flex>
        <Alert
          status={recommendation.type === "Outdoor run" ? "success" : "error"}
        >
          <AlertIcon />
          <AlertTitle>{recommendation.type}</AlertTitle>
          <AlertDescription>
            {" "}
            {recommendation.type === "Outdoor run"
              ? "Outdoor run"
              : `Indoor run: ${recommendation.reason}`}
          </AlertDescription>
        </Alert>

        {isBestDay && (
          <Text color="green.300" fontWeight="bold" fontSize="sm" mt={2}>
            Best day for outdoor run!
          </Text>
        )}
        {suitable && (
          <Box mt={2}>
            <Text color="green.300" fontWeight="bold" fontSize="sm">
              Suitable for hourly run!
            </Text>
            <Text color="green.300" fontSize="xs">
              Best hours: {bestHours.join(", ")}
            </Text>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default WeatherCard;
