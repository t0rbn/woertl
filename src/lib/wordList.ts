import type { Level } from "@/types/gameTypes";
import WORDS5 from "@/data/words5";
import WORDS8 from "@/data/words8";
import WORDS12 from "@/data/words12";

export function getWordList(level: Level): string[] {
  switch (level) {
    case "easy":
      return WORDS5;
    case "normal":
      return WORDS8;
    case "hard":
      return WORDS12;
  }
}

/**
 * Checks whether the given word is present in the word list for the specified level.
 * The comparison is case-insensitive (both the input and list entries are normalised to
 * uppercase before comparison), which also covers umlaut handling since the lists store
 * words in a single consistent case.
 *
 * If the word list for the level is empty or undefined the function returns `true` so
 * that a missing dictionary never blocks all guesses (graceful degradation).
 */
export function isWordInList(word: string, level: Level): boolean {
  const list = getWordList(level);
  if (!list || list.length === 0) return true;

  const normalised = word.toUpperCase();
  const wordSet = new Set(list.map((w) => w.toUpperCase()));
  return wordSet.has(normalised);
}
