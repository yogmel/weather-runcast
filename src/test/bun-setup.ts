import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach } from "bun:test";
import "@testing-library/jest-dom";

GlobalRegistrator.register();

// Dynamic import ensures @testing-library/dom's screen.js evaluates after
// document is available — it caches typeof document at module init time.
const { cleanup } = await import("@testing-library/react");
afterEach(cleanup);
