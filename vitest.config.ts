import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx,vue,js}"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
      ],
      thresholds: {
        // Branch coverage thresholds
        branches: 100, // Require 100% branch coverage
        lines: 100,
        functions: 100,
        statements: 100,
        perFile: true, // Check thresholds per file (stricter)
      },
      // Optional: fail on thresholds not met
      skipFull: false,
    },
  },
});
