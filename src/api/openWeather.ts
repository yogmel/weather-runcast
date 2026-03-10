import { AxiosError } from "axios";
import { Coordinates, WeatherForecast } from "../types";

const GEOCODING_BASE_URL = "http://api.openweathermap.org/geo/1.0/direct";

interface CoordinateResponse {
  success: boolean;
  data?: Coordinates;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
}

export const getLatLngFromLocation = async (
  API_KEY: string,
  locationName: string,
): Promise<CoordinateResponse | null> => {
  if (!API_KEY) {
    console.error("OpenWeather API key is not set in environment variables.");
    return null;
  }

  try {
    const response = await fetch(
      `${GEOCODING_BASE_URL}?q=${locationName}&limit=1&appid=${API_KEY}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.length > 0) {
      const { name, lat, lon } = data[0];
      return { success: true, data: { name, lat, lng: lon } };
    } else {
      console.warn(`No coordinates found for location: ${locationName}`);
      return null;
    }
  } catch (error) {
    const axiosError = error as AxiosError;

    console.error("Error details:", {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    return {
      success: false,
      error: {
        message: axiosError.message || "Failed to fetch coordinate data",
        status: axiosError.response?.status,
        details: axiosError.response?.data,
      },
    };
  }
};

interface WeatherResponse {
  success: boolean;
  data?: WeatherForecast;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
}

const ONE_CALL_BASE_URL = "https://api.openweathermap.org/data/3.0/onecall";

export const getWeatherForecast = async (
  API_KEY: string,
  lat: string,
  lng: string,
): Promise<WeatherResponse | null> => {
  if (!API_KEY) {
    console.error("OpenWeather API key is not set in environment variables.");
    return null;
  }

  try {
    const response = await fetch(
      `${ONE_CALL_BASE_URL}?lat=${lat}&lon=${lng}&exclude=minutely&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return { success: true, data: { ...data } };
  } catch (error) {
    const axiosError = error as AxiosError;

    console.error("Error details:", {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });

    return {
      success: false,
      error: {
        message: axiosError.message || "Failed to fetch weather data",
        status: axiosError.response?.status,
        details: axiosError.response?.data,
      },
    };
  }
};
