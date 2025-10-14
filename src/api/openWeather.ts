import { LatLng, WeatherForecast } from "../types";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GEOCODING_BASE_URL = "http://api.openweathermap.org/geo/1.0/direct";

export const getLatLngFromLocation = async (
  locationName: string
): Promise<LatLng | null> => {
  if (!API_KEY) {
    console.error("OpenWeather API key is not set in environment variables.");
    return null;
  }

  try {
    const response = await fetch(
      `${GEOCODING_BASE_URL}?q=${locationName}&limit=1&appid=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return { lat, lng: lon };
    } else {
      console.warn(`No coordinates found for location: ${locationName}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

const ONE_CALL_BASE_URL = "https://api.openweathermap.org/data/3.0/onecall";

export const getWeatherForecast = async (
  lat: number,
  lon: number
): Promise<WeatherForecast | null> => {
  if (!API_KEY) {
    console.error("OpenWeather API key is not set in environment variables.");
    return null;
  }

  try {
    const response = await fetch(
      `${ONE_CALL_BASE_URL}?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return null;
  }
};
