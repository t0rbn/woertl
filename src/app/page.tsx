"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./page.module.css";
import { useGame } from "@/hooks/useGame";
import Toast from "@/components/Toast";
import TileGrid from "@/components/TileGrid";
import ResultBanner from "@/components/ResultBanner";
import GuessInput from "@/components/GuessInput";

export default function Home() {
  const { gameState, addLetter, deleteLetter, submitGuess, toastMessage, duplicateError } =
    useGame();
  const [inputError, setInputError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmitGuess() {
    submitGuess();
    setTimeout(() => focusInput(), 50);
  }

  function handleLetterInput(letter: string) {
    addLetter(letter);
  }

  function handleDelete() {
    deleteLetter();
  }

  function handleError() {
    // submitGuess() triggers the toast message for "Nicht genug Buchstaben"
    submitGuess();
    setInputError(true);
    setTimeout(() => {
      setInputError(false);
      focusInput();
    }, 350);
  }

  const isGameOver = gameState.status !== "playing";

  return (
    <div className={styles.pageWrapper}>
      <Toast message={toastMessage} />

      <main className={styles.main}>
        <div className={styles.gameArea}>
          <TileGrid
            guesses={gameState.guesses}
            currentGuess={gameState.currentGuess}
            currentRow={gameState.guesses.length}
            status={gameState.status}
            shakeRow={false}
          />

          {isGameOver && (
            <ResultBanner
              status={gameState.status}
              targetWord={gameState.targetWord}
              attemptCount={gameState.attemptCount}
            />
          )}

          <GuessInput
            ref={inputRef}
            value={gameState.currentGuess}
            onLetterInput={handleLetterInput}
            onDelete={handleDelete}
            onSubmit={handleSubmitGuess}
            onError={handleError}
            disabled={isGameOver}
            error={inputError || duplicateError}
          />
        </div>
      </main>
    </div>
  );
}
