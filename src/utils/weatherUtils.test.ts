import { describe, it, expect } from "vitest";
import { getRunRecommendation } from "./weatherUtils";

describe("getRunRecommendation", () => {
  it("returns Indoor run when rain exceeds threshold", () => {
    const day = { rain: 5, temp: { min: 15, max: 20 } };
    expect(getRunRecommendation(day, 10, 25)).toEqual({
      type: "Indoor run",
      reason: "It's raining",
    });
  });
});
