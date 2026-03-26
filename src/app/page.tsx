"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useGame } from "@/hooks/useGame";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import Toast from "@/components/Toast";
import TileGrid from "@/components/TileGrid";
import ResultBanner from "@/components/ResultBanner";
import Keyboard from "@/components/Keyboard";

export default function Home() {
  const { gameState, addLetter, deleteLetter, submitGuess, toastMessage, keyboardState } =
    useGame();
  const [shakeRow, setShakeRow] = useState(false);

  function handleSubmitGuess() {
    const currentChars = Array.from(gameState.currentGuess);
    if (currentChars.length !== 5) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 350);
    }
    submitGuess();
  }

  function handleKeyPress(key: string) {
    if (key === "ENTER") {
      handleSubmitGuess();
    } else if (key === "BACKSPACE") {
      deleteLetter();
    } else {
      addLetter(key);
    }
  }

  useKeyboardInput({
    status: gameState.status,
    addLetter,
    deleteLetter,
    submitGuess: handleSubmitGuess,
  });

  const isGameOver = gameState.status !== "playing";

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.appBar}>
        <div className={styles.appBarTitle}>woertl</div>
        <div className={styles.appBarActions}>
          <button
            className={styles.iconButton}
            aria-label="Hilfe"
            title="Hilfe"
          >
            ?
          </button>
          <button
            className={styles.iconButton}
            aria-label="Einstellungen"
            title="Einstellungen"
          >
            ⚙
          </button>
        </div>
      </header>

      <Toast message={toastMessage} />

      <main className={styles.main}>
        <div className={styles.gameArea}>
          <TileGrid
            guesses={gameState.guesses}
            currentGuess={gameState.currentGuess}
            currentRow={gameState.guesses.length}
            status={gameState.status}
            shakeRow={shakeRow}
          />

          {isGameOver && (
            <ResultBanner
              status={gameState.status}
              targetWord={gameState.targetWord}
              attemptCount={gameState.attemptCount}
            />
          )}

          <Keyboard
            keyboardState={keyboardState}
            onKeyPress={handleKeyPress}
            disabled={isGameOver}
          />
        </div>
      </main>
    </div>
  );
}
