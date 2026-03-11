# RunCast — 7-Day Running Forecast App

This is a single-page web application that helps runners decide whether to run outdoor or indoor based on the 7-day weather forecast for a given location.

## Features

- User inputs a location name (e.g., “São Paulo).
- Fetches 7-day forecast, daily min/max temperatures, weather alerts, and sunset time from OpenWeatherMap One Call API 3.0.
- Recommends "Outdoor run" or "Indoor run" per day based on weather conditions.
- Identifies the best day and hour for outdoor running based on ideal temperature range (10 °C–25 °C), no rain/low wind/no alerts, and preferably before sunset.
- Displays a card-style layout for each day’s forecast, including date, weather icon and condition, min/max temperature, sunset time, and recommendation badge.
- Modern, minimal, responsive, and intuitive UI using React, Vite, Chakra UI.
- Caches the most recent search in localStorage.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **API**: OpenWeatherMap One Call API 3.0 + Geocoding API
- **Package manager**: Bun v1.3

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yogmel/weather-runcast.git
    cd weather-runcast
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the `weather-runcast/` directory with your OpenWeatherMap API key:

    ```
    OPENWEATHER_API_KEY=your_open_weather_api_key
    ```

    Get the key [here](https://openweathermap.org/) and replace `your_open_weather_api_key` with your actual API key from OpenWeatherMap.

4.  **Run the development server:**
    ```bash
    bun dev
    ```
    The app will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

### Docker Development - need revision

You can run the application using Docker for a consistent development environment.

**Prerequisites:**

- Docker and Docker Compose installed.

**Steps:**

1. Build and start the container:
   ```bash
   docker-compose up --build
   ```
2. Access the application at `http://localhost:5173`.

The container is configured with volume mounting, so changes to your local source code will be reflected in the running container via Hot Module Replacement (HMR).

## API Usage Notes

This application uses the OpenWeatherMap Geocoding API to convert location names to latitude and longitude, and the OpenWeatherMap One Call API 3.0 to fetch weather forecast data.

- **Geocoding API Endpoint**: `http://api.openweathermap.org/geo/1.0/direct`
- **One Call API 3.0 Endpoint**: `https://api.openweathermap.org/data/3.0/onecall`

Ensure your API key has access to both the Geocoding API and the One Call API 3.0.
