import { describe, it, expect, vi } from "vitest";
import { getWordList, isWordInList, isWordInSolutionPool, isWordInValidationDict } from "./wordList";

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

describe("isWordInSolutionPool", () => {
  it("returns true for a word that is present in the solution pool", () => {
    // "TANTE" is the first entry in the easy word list
    expect(isWordInSolutionPool("TANTE", "easy")).toBe(true);
  });

  it("returns false for a word that is not in the solution pool", () => {
    expect(isWordInSolutionPool("XYZQW", "easy")).toBe(false);
  });

  it("comparison is case-insensitive (lowercase input matches uppercase list entry)", () => {
    expect(isWordInSolutionPool("tante", "easy")).toBe(true);
  });

  it("comparison is case-insensitive (mixed case input matches uppercase list entry)", () => {
    expect(isWordInSolutionPool("TaNtE", "easy")).toBe(true);
  });

  it("handles umlauts correctly – uppercased umlaut word matches the list entry", () => {
    // Words with umlauts are stored uppercase in the list; uppercasing the input
    // via toUpperCase() must preserve umlauts so the lookup succeeds.
    // Find the first word that contains an umlaut character in the easy list.
    const easyList = getWordList("easy");
    const umlautWord = easyList.find((w) => /[ÄÖÜ]/.test(w));
    if (umlautWord) {
      // Input as lowercase with umlauts – toUpperCase() should restore the uppercase form.
      expect(isWordInSolutionPool(umlautWord.toLowerCase(), "easy")).toBe(true);
    } else {
      // No umlaut word in the easy list; verify that a known uppercase umlaut
      // string that is not in the list correctly returns false (normal lookup path).
      expect(isWordInSolutionPool("HÖHLE", "easy")).toBe(false);
    }
  });

  it("returns false for a word absent from the normal-level list", () => {
    expect(isWordInSolutionPool("XYZQWRST", "normal")).toBe(false);
  });

  it("returns true for a word present in the normal-level list", () => {
    // "ABENDROT" is in the normal word list
    expect(isWordInSolutionPool("ABENDROT", "normal")).toBe(true);
  });

  it("returns true (graceful degradation) – non-empty list works normally", () => {
    // Verify the function does not throw and returns a boolean for any input.
    expect(typeof isWordInSolutionPool("TANTE", "easy")).toBe("boolean");
    expect(typeof isWordInSolutionPool("XYZQW", "easy")).toBe("boolean");
  });
});

describe("isWordInList (backward-compat alias for isWordInSolutionPool)", () => {
  it("returns true for a word that is present in the list", () => {
    expect(isWordInList("TANTE", "easy")).toBe(true);
  });

  it("returns false for a word that is not in the list", () => {
    expect(isWordInList("XYZQW", "easy")).toBe(false);
  });

  it("comparison is case-insensitive (lowercase input matches uppercase list entry)", () => {
    expect(isWordInList("tante", "easy")).toBe(true);
  });
});

describe("isWordInValidationDict", () => {
  it("returns true when the word is present in the Set", () => {
    const dict = new Set(["HUNDE", "VOGEL", "MUSIK"]);
    expect(isWordInValidationDict("HUNDE", dict)).toBe(true);
  });

  it("returns false when the word is not in the Set", () => {
    const dict = new Set(["HUNDE", "VOGEL", "MUSIK"]);
    expect(isWordInValidationDict("XYZQW", dict)).toBe(false);
  });

  it("lookup is case-insensitive (lowercase input matched against uppercase Set entries)", () => {
    const dict = new Set(["HUNDE", "VOGEL", "MUSIK"]);
    expect(isWordInValidationDict("hunde", dict)).toBe(true);
    expect(isWordInValidationDict("Vogel", dict)).toBe(true);
  });

  it("handles umlauts correctly – umlaut characters in input are uppercased and matched", () => {
    const dict = new Set(["ÄCKER", "ÖFTER", "ÜBUNG"]);
    expect(isWordInValidationDict("äcker", dict)).toBe(true);
    expect(isWordInValidationDict("ÖFTER", dict)).toBe(true);
    expect(isWordInValidationDict("übung", dict)).toBe(true);
    expect(isWordInValidationDict("XYZQW", dict)).toBe(false);
  });

  it("returns false for an empty Set", () => {
    const dict = new Set<string>();
    expect(isWordInValidationDict("HUNDE", dict)).toBe(false);
  });
});
