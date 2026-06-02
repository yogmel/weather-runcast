import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "./App";

vi.mock("./components/WeatherResult", () => ({
  WeatherResult: () => null,
}));

const renderApp = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>,
  );

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists location to localStorage on search", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(
      screen.getByPlaceholderText("Enter location (e.g., São Paulo)"),
      "London",
    );
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(localStorage.getItem("lastLocation")).toBe("London");
  });
});
