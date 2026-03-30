import { describe, it, expect, vi, afterEach } from "vitest";
import { getRandomWord } from "./randomWord";

// Mock word lists so we don't rely on real data files
vi.mock("@/lib/wordList", () => ({
  getWordList: (level: string) => {
    if (level === "easy") return ["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE"];
    if (level === "normal") return ["SCHULBUCH", "ABENDROT", "COMPUTER"];
    if (level === "hard") return ["ZUSAMMENARBEIT"];
    return [];
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getRandomWord", () => {
  it("returns a word from the correct pool for easy", () => {
    const word = getRandomWord("easy");
    expect(["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE"]).toContain(word);
  });

  it("returns a word from the correct pool for normal", () => {
    const word = getRandomWord("normal");
    expect(["SCHULBUCH", "ABENDROT", "COMPUTER"]).toContain(word);
  });

  it("returns a word from the correct pool for hard", () => {
    const word = getRandomWord("hard");
    expect(["ZUSAMMENARBEIT"]).toContain(word);
  });

  it("avoids repeating the lastWord when pool has multiple entries", () => {
    // Run many times to confirm it never returns the same as lastWord
    for (let i = 0; i < 50; i++) {
      const word = getRandomWord("easy", "TANTE");
      expect(word).not.toBe("TANTE");
    }
  });

  it("still returns word even if pool has only one entry and it equals lastWord", () => {
    // Pool for hard has only one word
    const word = getRandomWord("hard", "ZUSAMMENARBEIT");
    expect(word).toBe("ZUSAMMENARBEIT");
  });

  it("works without lastWord parameter", () => {
    const word = getRandomWord("easy");
    expect(typeof word).toBe("string");
    expect(word.length).toBeGreaterThan(0);
  });
});
