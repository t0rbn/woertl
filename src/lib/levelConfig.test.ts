import { describe, it, expect } from "vitest";
import { LEVEL_CONFIGS } from "./levelConfig";

describe("LEVEL_CONFIGS", () => {
  it("easy has wordLength 5, maxAttempts 6", () => {
    expect(LEVEL_CONFIGS.easy.wordLength).toBe(5);
    expect(LEVEL_CONFIGS.easy.maxAttempts).toBe(6);
    expect(LEVEL_CONFIGS.easy.label).toBe("Einfach");
    expect(LEVEL_CONFIGS.easy.statsKey).toBe("stats_easy");
  });

  it("normal has wordLength 8, maxAttempts 7", () => {
    expect(LEVEL_CONFIGS.normal.wordLength).toBe(8);
    expect(LEVEL_CONFIGS.normal.maxAttempts).toBe(7);
    expect(LEVEL_CONFIGS.normal.label).toBe("Normal");
    expect(LEVEL_CONFIGS.normal.statsKey).toBe("stats_normal");
  });

  it("hard has wordLength 12, maxAttempts 8", () => {
    expect(LEVEL_CONFIGS.hard.wordLength).toBe(12);
    expect(LEVEL_CONFIGS.hard.maxAttempts).toBe(8);
    expect(LEVEL_CONFIGS.hard.label).toBe("Schwer");
    expect(LEVEL_CONFIGS.hard.statsKey).toBe("stats_hard");
  });
});
