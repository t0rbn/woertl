export type LetterFeedback = "correct" | "present" | "absent";

export type TileState = {
  letter: string;
  feedback: LetterFeedback | null;
};

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  targetWord: string;
  guesses: TileState[][];
  currentGuess: string;
  status: GameStatus;
  attemptCount: number;
};

export type KeyState = Record<string, LetterFeedback | "unused">;
