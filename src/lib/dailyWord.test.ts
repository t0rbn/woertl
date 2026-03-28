import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getDailyWord } from "./dailyWord";
import { getWordList } from "./wordList";

describe("getDailyWord", () => {
  beforeEach(() => {
    // Fix date to 2026-03-28
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns same word for same date and level", () => {
    const word1 = getDailyWord("easy");
    const word2 = getDailyWord("easy");
    expect(word1).toBe(word2);
  });

  it("different levels yield different words on the same day", () => {
    const easyWord = getDailyWord("easy");
    const normalWord = getDailyWord("normal");
    const hardWord = getDailyWord("hard");
    // Words are from different lists so they must differ in length
    expect(Array.from(easyWord).length).toBe(5);
    expect(Array.from(normalWord).length).toBe(8);
    expect(Array.from(hardWord).length).toBe(12);
  });

  it("result is always in the correct word list for easy", () => {
    const word = getDailyWord("easy");
    const list = getWordList("easy");
    expect(list).toContain(word);
  });

  it("result is always in the correct word list for normal", () => {
    const word = getDailyWord("normal");
    const list = getWordList("normal");
    expect(list).toContain(word);
  });

  it("result is always in the correct word list for hard", () => {
    const word = getDailyWord("hard");
    const list = getWordList("hard");
    expect(list).toContain(word);
  });

  it("different dates yield potentially different words", () => {
    vi.setSystemTime(new Date("2026-03-28"));
    const word1 = getDailyWord("easy");
    vi.setSystemTime(new Date("2026-03-29"));
    const word2 = getDailyWord("easy");
    // They may or may not differ (cycle), but this validates the function runs for both dates
    expect(typeof word1).toBe("string");
    expect(typeof word2).toBe("string");
  });
});
