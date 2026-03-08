import { useState, useEffect } from "react";
import "./App.css";
import {
  Input,
  Button,
  Heading,
  Text,
  Box,
  Stack,
  Field,
} from "@chakra-ui/react";
import { WeatherResult } from "./components/WeatherResult";

function App() {
  const [editingLocation, setEditingLocation] = useState<string>("");
  const [location, setLocation] = useState<string>(
    localStorage.getItem("lastLocation") || "",
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [minTemp, setMinTemp] = useState<string>("10"); // Default min temperature
  const [maxTemp, setMaxTemp] = useState<string>("25"); // Default max temperature

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      localStorage.setItem("lastLocation", location);
    }
  }, [location]);

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
            value={editingLocation}
            onChange={(e) => setEditingLocation(e.target.value)}
            placeholder="Enter location (e.g., Sao Paulo)"
            bg="white"
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
          />
          <Button
            onClick={() => {
              setLocation(editingLocation);
            }}
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

      {location !== "" && (
        <WeatherResult
          location={location}
          setLoading={setLoading}
          setError={setError}
          maxTemp={maxTemp}
          minTemp={minTemp}
        />
      )}
    </Box>
  );
}

export default App;
