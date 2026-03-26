"use client";

import { useReducer, useEffect, useState } from "react";
import type { GameState, TileState, KeyState } from "@/types/gameTypes";
import { calculateFeedback } from "@/lib/calculateFeedback";
import { calculateKeyboardState } from "@/lib/calculateKeyboardState";

const TARGET_WORD = "TANTE";
const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

type Action =
  | { type: "ADD_LETTER"; letter: string }
  | { type: "DELETE_LETTER" }
  | { type: "SUBMIT_GUESS" };

type ReducerResult = {
  state: GameState;
  errorMessage?: string;
};

function createInitialState(): GameState {
  return {
    targetWord: TARGET_WORD,
    guesses: [],
    currentGuess: "",
    status: "playing",
    attemptCount: 0,
  };
}

function gameReducer(
  state: GameState,
  action: Action
): GameState {
  if (state.status !== "playing") return state;

  switch (action.type) {
    case "ADD_LETTER": {
      const currentChars = Array.from(state.currentGuess);
      if (currentChars.length >= WORD_LENGTH) return state;
      return { ...state, currentGuess: state.currentGuess + action.letter };
    }
    case "DELETE_LETTER": {
      const chars = Array.from(state.currentGuess);
      if (chars.length === 0) return state;
      return { ...state, currentGuess: chars.slice(0, -1).join("") };
    }
    case "SUBMIT_GUESS": {
      const currentChars = Array.from(state.currentGuess);
      if (currentChars.length !== WORD_LENGTH) return state;

      const feedbacks = calculateFeedback(state.currentGuess, state.targetWord);
      const newRow: TileState[] = currentChars.map((letter, i) => ({
        letter,
        feedback: feedbacks[i] ?? "absent",
      }));

      const newGuesses = [...state.guesses, newRow];
      const newAttemptCount = state.attemptCount + 1;

      const isWin = feedbacks.every((f) => f === "correct");
      const isLoss = !isWin && newAttemptCount >= MAX_ATTEMPTS;

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
}

export type UseGameReturn = {
  gameState: GameState;
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => void;
  toastMessage: string | null;
  keyboardState: KeyState;
};

export function useGame(): UseGameReturn {
  const [gameState, dispatch] = useReducer(gameReducer, createInitialState());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function addLetter(letter: string) {
    dispatch({ type: "ADD_LETTER", letter: letter.toUpperCase() });
  }

  function deleteLetter() {
    dispatch({ type: "DELETE_LETTER" });
  }

  function submitGuess() {
    const currentChars = Array.from(gameState.currentGuess);
    if (currentChars.length !== WORD_LENGTH) {
      setToastMessage("Nicht genug Buchstaben");
      return;
    }
    dispatch({ type: "SUBMIT_GUESS" });
  }

  // Auto-dismiss toast after 1500ms
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 1500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const keyboardState: KeyState = calculateKeyboardState(gameState.guesses);

  return {
    gameState,
    addLetter,
    deleteLetter,
    submitGuess,
    toastMessage,
    keyboardState,
  };
}
