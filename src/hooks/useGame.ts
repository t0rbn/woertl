"use client";

import { useReducer, useEffect, useState, useCallback, useMemo } from "react";
import type { GameState, TileState, Level } from "@/types/gameTypes";
import { calculateFeedback } from "@/lib/calculateFeedback";
import { LEVEL_CONFIGS } from "@/lib/levelConfig";
import { getDailyWord } from "@/lib/dailyWord";

type Action =
  | { type: "ADD_LETTER"; letter: string }
  | { type: "DELETE_LETTER" }
  | { type: "SUBMIT_GUESS" };

type ReducerConfig = {
  wordLength: number;
  maxAttempts: number;
};

function createInitialState(targetWord: string): GameState {
  return {
    targetWord,
    guesses: [],
    currentGuess: "",
    status: "playing",
    attemptCount: 0,
  };
}

function makeGameReducer(config: ReducerConfig) {
  return function gameReducer(state: GameState, action: Action): GameState {
    if (state.status !== "playing") return state;

    switch (action.type) {
      case "ADD_LETTER": {
        const currentChars = Array.from(state.currentGuess);
        if (currentChars.length >= config.wordLength) return state;
        return { ...state, currentGuess: state.currentGuess + action.letter };
      }
      case "DELETE_LETTER": {
        const chars = Array.from(state.currentGuess);
        if (chars.length === 0) return state;
        return { ...state, currentGuess: chars.slice(0, -1).join("") };
      }
      case "SUBMIT_GUESS": {
        const currentChars = Array.from(state.currentGuess);
        if (currentChars.length !== config.wordLength) return state;

        const feedbacks = calculateFeedback(state.currentGuess, state.targetWord);
        const newRow: TileState[] = currentChars.map((letter, i) => ({
          letter,
          feedback: feedbacks[i] ?? "absent",
        }));

        const newGuesses = [...state.guesses, newRow];
        const newAttemptCount = state.attemptCount + 1;

        const isWin = feedbacks.every((f) => f === "correct");
        const isLoss = !isWin && newAttemptCount >= config.maxAttempts;

        return {
          ...state,
          guesses: newGuesses,
          currentGuess: "",
          attemptCount: newAttemptCount,
          status: isWin ? "won" : isLoss ? "lost" : "playing",
        };
      }
      default:
        return state;
    }
  };
}

export type UseGameReturn = {
  gameState: GameState;
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => void;
  toastMessage: string | null;
  duplicateError: boolean;
};

export function useGame(level: Level = "easy"): UseGameReturn {
  const levelConfig = LEVEL_CONFIGS[level];
  const targetWord = getDailyWord(level);

  // Create a stable reducer from the level config; level is fixed for the
  // lifetime of this hook instance (GameScreen unmounts when level changes).
  const gameReducer = useMemo(
    () => makeGameReducer({ wordLength: levelConfig.wordLength, maxAttempts: levelConfig.maxAttempts }),
    [levelConfig.wordLength, levelConfig.maxAttempts]
  );

  const [gameState, dispatch] = useReducer(
    gameReducer,
    createInitialState(targetWord)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState(false);

  const addLetter = useCallback((letter: string) => {
    dispatch({ type: "ADD_LETTER", letter: letter.toUpperCase() });
  }, []);

  const deleteLetter = useCallback(() => {
    dispatch({ type: "DELETE_LETTER" });
  }, []);

  const submitGuess = useCallback(() => {
    const currentChars = Array.from(gameState.currentGuess);
    if (currentChars.length !== levelConfig.wordLength) {
      setToastMessage("Nicht genug Buchstaben");
      return;
    }

    const currentWord = gameState.currentGuess.toUpperCase();
    const isDuplicate = gameState.guesses.some((row) => {
      const guessedWord = row.map((tile) => tile.letter).join("").toUpperCase();
      return guessedWord === currentWord;
    });

    if (isDuplicate) {
      setToastMessage("Du hast dieses Wort bereits geraten.");
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 350);
      return;
    }

    dispatch({ type: "SUBMIT_GUESS" });
  }, [gameState.currentGuess, gameState.guesses, levelConfig.wordLength]);

  // Auto-dismiss toast after 1500ms
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 1500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return {
    gameState,
    addLetter,
    deleteLetter,
    submitGuess,
    toastMessage,
    duplicateError,
  };
}
