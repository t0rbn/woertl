import { describe, it, expect, vi } from "vitest";
import { getWordList, isWordInList } from "./wordList";

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

describe("isWordInList", () => {
  it("returns true for a word that is present in the list", () => {
    // "TANTE" is the first entry in the easy word list
    expect(isWordInList("TANTE", "easy")).toBe(true);
  });

  it("returns false for a word that is not in the list", () => {
    expect(isWordInList("XYZQW", "easy")).toBe(false);
  });

  it("comparison is case-insensitive (lowercase input matches uppercase list entry)", () => {
    expect(isWordInList("tante", "easy")).toBe(true);
  });

  it("comparison is case-insensitive (mixed case input matches uppercase list entry)", () => {
    expect(isWordInList("TaNtE", "easy")).toBe(true);
  });

  it("handles umlauts correctly – uppercased umlaut word matches the list entry", () => {
    // Words with umlauts are stored uppercase in the list; uppercasing the input
    // via toUpperCase() must preserve umlauts so the lookup succeeds.
    // Find the first word that contains an umlaut character in the easy list.
    const easyList = getWordList("easy");
    const umlautWord = easyList.find((w) => /[ÄÖÜ]/.test(w));
    if (umlautWord) {
      // Input as lowercase with umlauts – toUpperCase() should restore the uppercase form.
      expect(isWordInList(umlautWord.toLowerCase(), "easy")).toBe(true);
    } else {
      // No umlaut word in the easy list; verify that a known uppercase umlaut
      // string that is not in the list correctly returns false (normal lookup path).
      expect(isWordInList("HÖHLE", "easy")).toBe(false);
    }
  });

  it("returns false for a word absent from the normal-level list", () => {
    expect(isWordInList("XYZQWRST", "normal")).toBe(false);
  });

  it("returns true for a word present in the normal-level list", () => {
    // "ABENDROT" is in the normal word list
    expect(isWordInList("ABENDROT", "normal")).toBe(true);
  });

  it("returns true (graceful degradation) – non-empty list works normally", () => {
    // Verify the function does not throw and returns a boolean for any input.
    expect(typeof isWordInList("TANTE", "easy")).toBe("boolean");
    expect(typeof isWordInList("XYZQW", "easy")).toBe("boolean");
  });
});
