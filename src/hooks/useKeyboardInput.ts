"use client";

import { useEffect } from "react";
import type { GameStatus } from "@/types/gameTypes";

type UseKeyboardInputProps = {
  status: GameStatus;
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => void;
};

// Valid German letter keys including umlauts
const VALID_LETTERS = new Set([
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "ä", "ö", "ü",
]);

export function useKeyboardInput({
  status,
  addLetter,
  deleteLetter,
  submitGuess,
}: UseKeyboardInputProps) {
  useEffect(() => {
    if (status !== "playing") return;

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key;

      if (key === "Enter") {
        submitGuess();
      } else if (key === "Backspace") {
        deleteLetter();
      } else if (VALID_LETTERS.has(key.toLowerCase())) {
        addLetter(key.toUpperCase());
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [status, addLetter, deleteLetter, submitGuess]);
}
