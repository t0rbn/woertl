import { describe, it, expect } from "vitest";
import { getWordList } from "./wordList";

describe("getWordList", () => {
  it("returns the easy word list with all words of length 5", () => {
    const words = getWordList("easy");
    expect(words.length).toBeGreaterThan(0);
    for (const word of words) {
      expect(Array.from(word).length).toBe(5);
    }
  });

  it("returns the normal word list with all words of length 8", () => {
    const words = getWordList("normal");
    expect(words.length).toBeGreaterThan(0);
    for (const word of words) {
      expect(Array.from(word).length).toBe(8);
    }
  });

  it("returns the hard word list with all words of length 12", () => {
    const words = getWordList("hard");
    expect(words.length).toBeGreaterThan(0);
    for (const word of words) {
      expect(Array.from(word).length).toBe(12);
    }
  });

  it("each level returns a different list", () => {
    const easy = getWordList("easy");
    const normal = getWordList("normal");
    const hard = getWordList("hard");
    expect(easy).not.toBe(normal);
    expect(normal).not.toBe(hard);
    expect(easy).not.toBe(hard);
  });
});
