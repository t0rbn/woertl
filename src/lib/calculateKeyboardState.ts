import type { TileState, KeyState, LetterFeedback } from "@/types/gameTypes";

const FEEDBACK_PRIORITY: Record<LetterFeedback, number> = {
  correct: 3,
  present: 2,
  absent: 1,
};

/**
 * Computes the cumulative feedback state for every letter across all submitted guesses.
 * Priority: "correct" overrides "present", "present" overrides "absent", any feedback overrides "unused".
 */
export function calculateKeyboardState(guesses: TileState[][]): KeyState {
  const state: KeyState = {};

  for (const row of guesses) {
    for (const tile of row) {
      if (!tile.feedback) continue;
      const letter = tile.letter.toUpperCase();
      const currentPriority =
        state[letter] && state[letter] !== "unused"
          ? FEEDBACK_PRIORITY[state[letter] as LetterFeedback]
          : 0;
      const newPriority = FEEDBACK_PRIORITY[tile.feedback];
      if (newPriority > currentPriority) {
        state[letter] = tile.feedback;
      }
    }
  }

  return state;
}
