import type { Level } from "@/types/gameTypes";
import { getWordList } from "@/lib/wordList";

/**
 * Pick a random word from the pool for the given level.
 * If `lastWord` is provided and the pool has more than one entry,
 * re-pick until the result differs from `lastWord`.
 */
export function getRandomWord(level: Level, lastWord?: string): string {
  const words = getWordList(level);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0] ?? "";

  let word: string;
  do {
    const index = Math.floor(Math.random() * words.length);
    word = words[index] ?? "";
  } while (lastWord !== undefined && word === lastWord);

  return word;
}
