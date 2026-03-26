import type { LetterFeedback } from "@/types/gameTypes";

/**
 * Calculates feedback for a guessed word compared to the target word.
 * Returns an array of 5 LetterFeedback values.
 * Handles duplicate letters correctly: a letter appearing once in the target
 * may only produce one "correct" or "present" marking; excess occurrences are "absent".
 */
export function calculateFeedback(guess: string, target: string): LetterFeedback[] {
  const guessUpper = guess.toUpperCase();
  const targetUpper = target.toUpperCase();

  const guessLetters = Array.from(guessUpper);
  const targetLetters = Array.from(targetUpper);

  const result: LetterFeedback[] = new Array(guessLetters.length).fill("absent");
  const targetUsed: boolean[] = new Array(targetLetters.length).fill(false);
  const guessUsed: boolean[] = new Array(guessLetters.length).fill(false);

  // First pass: find exact matches (correct)
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = "correct";
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  // Second pass: find present letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < targetLetters.length; j++) {
      if (targetUsed[j]) continue;
      if (guessLetters[i] === targetLetters[j]) {
        result[i] = "present";
        targetUsed[j] = true;
        guessUsed[i] = true;
        break;
      }
    }
  }

  return result;
}
