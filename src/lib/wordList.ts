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
 * Checks whether the given word is present in the *solution pool* for the
 * specified level. This function is used only for daily-word selection purposes.
 *
 * The comparison is case-insensitive (both the input and list entries are
 * normalised to uppercase before comparison).
 *
 * If the word list for the level is empty or undefined the function returns
 * `true` so that a missing dictionary never blocks all guesses (graceful
 * degradation).
 *
 * @deprecated Use `isWordInValidationDict` with the loaded validation
 *   dictionary for guess validation. This function should only be used for
 *   daily-word selection logic.
 */
export function isWordInList(word: string, level: Level): boolean {
  return isWordInSolutionPool(word, level);
}

/**
 * Checks whether the given word is present in the *solution pool* for the
 * specified level. The solution pool is the curated set of words from which
 * the daily word is selected; it does not contain all valid German words.
 *
 * For guess validation, use `isWordInValidationDict` with the lazily-loaded
 * extended validation dictionary.
 */
export function isWordInSolutionPool(word: string, level: Level): boolean {
  const list = getWordList(level);
  if (!list || list.length === 0) return true;

  const normalised = word.toUpperCase();
  const wordSet = new Set(list.map((w) => w.toUpperCase()));
  return wordSet.has(normalised);
}

/**
 * Checks whether the given word is present in the provided validation
 * dictionary Set. This is a synchronous O(1) lookup against the already-loaded
 * dictionary (see `loadValidationDict` in `dictLoader.ts`).
 *
 * The input word is uppercased before the lookup to ensure case-insensitive
 * matching.
 */
export function isWordInValidationDict(word: string, dict: Set<string>): boolean {
  return dict.has(word.toUpperCase());
}
