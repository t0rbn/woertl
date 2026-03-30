"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./page.module.css";
import { useGame } from "@/hooks/useGame";
import Toast from "@/components/Toast";
import TileGrid from "@/components/TileGrid";
import ResultDialog from "@/components/ResultDialog";
import GuessInput from "@/components/GuessInput";
import LevelSelect from "@/components/LevelSelect";
import type { Level } from "@/types/gameTypes";
import { LEVEL_CONFIGS } from "@/lib/levelConfig";
import { getRandomWord } from "@/lib/randomWord";

/** Persist per-level stats to sessionStorage (wins, losses, total). */
function incrementLevelStats(level: Level, result: "won" | "lost"): void {
  if (typeof window === "undefined") return;
  try {
    const key = `stats_${level}`;
    const raw = sessionStorage.getItem(key);
    const data: { wins: number; losses: number; total: number } = raw
      ? (JSON.parse(raw) as { wins: number; losses: number; total: number })
      : { wins: 0, losses: 0, total: 0 };
    if (result === "won") data.wins += 1;
    else data.losses += 1;
    data.total += 1;
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

type View = "levelSelect" | "game";

function GameScreen({
  level,
  onBack,
  onSwitchLevel,
}: {
  level: Level;
  onBack: () => void;
  onSwitchLevel: (newLevel: Level) => void;
}) {
  // Initialise target word once per mount (no previous word on first load)
  const [targetWord] = useState<string>(() => getRandomWord(level));

  const {
    gameState,
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
    toastMessage,
    inputError: hookInputError,
  } = useGame(level, targetWord);

  const [inputError, setInputError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const levelConfig = LEVEL_CONFIGS[level];
  const statsRecorded = useRef(false);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Show result dialog after game ends (with short delay for animation)
  useEffect(() => {
    if (gameState.status === "playing") return;
    if (statsRecorded.current) return;

    statsRecorded.current = true;
    incrementLevelStats(level, gameState.status);

    // Determine delay: 0 if prefers-reduced-motion
    const reducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reducedMotion ? 0 : 150;

    const timer = setTimeout(() => {
      setShowDialog(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [gameState.status, level]);

  // Escape key to go back (only when dialog is not showing)
  useEffect(() => {
    if (showDialog) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onBack();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack, showDialog]);

  function handleSubmitGuess() {
    submitGuess();
    // Use requestAnimationFrame to keep the focus call within the same user-gesture
    // callback chain, which is required for mobile browsers to keep the virtual keyboard open.
    requestAnimationFrame(() => focusInput());
  }

  function handleLetterInput(letter: string) {
    addLetter(letter);
  }

  function handleDelete() {
    deleteLetter();
  }

  function handleError() {
    submitGuess();
    setInputError(true);
    setTimeout(() => {
      setInputError(false);
      focusInput();
    }, 350);
  }

  function handlePlayAgain() {
    const newWord = getRandomWord(level, gameState.targetWord);
    statsRecorded.current = false;
    resetGame(newWord);
    setShowDialog(false);
    requestAnimationFrame(() => focusInput());
  }

  function handleChangeLevel(newLevel: Level) {
    setShowDialog(false);
    onSwitchLevel(newLevel);
  }

  function handleBackToLevelSelect() {
    setShowDialog(false);
    onBack();
  }

  const isGameOver = gameState.status !== "playing";

  return (
    <>
      <Toast message={toastMessage} />
      {showDialog && isGameOver && (
        <ResultDialog
          status={gameState.status as "won" | "lost"}
          targetWord={gameState.targetWord}
          attemptCount={gameState.attemptCount}
          maxAttempts={levelConfig.maxAttempts}
          currentLevel={level}
          onPlayAgain={handlePlayAgain}
          onChangeLevel={handleChangeLevel}
          onBackToLevelSelect={handleBackToLevelSelect}
        />
      )}
      <main className={styles.main}>
        <div className={styles.gameHeader}>
          <button
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Zurück zur Levelauswahl"
            type="button"
          >
            ←
          </button>
          <span className={styles.gameTitle}>wörtl</span>
        </div>
        <div
          className={styles.levelBadge}
          aria-live="polite"
        >
          {levelConfig.label} – {levelConfig.wordLength} Buchstaben
        </div>
        <div className={styles.gameArea}>
          <TileGrid
            guesses={gameState.guesses}
            currentGuess={gameState.currentGuess}
            currentRow={gameState.guesses.length}
            status={gameState.status}
            shakeRow={false}
            wordLength={levelConfig.wordLength}
            totalRows={levelConfig.maxAttempts}
          />

          <GuessInput
            ref={inputRef}
            value={gameState.currentGuess}
            onLetterInput={handleLetterInput}
            onDelete={handleDelete}
            onSubmit={handleSubmitGuess}
            onError={handleError}
            disabled={isGameOver}
            error={inputError || hookInputError}
            wordLength={levelConfig.wordLength}
          />
        </div>
      </main>
    </>
  );
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("levelSelect");
  const [selectedLevel, setSelectedLevel] = useState<Level>("easy");

  function handleSelectLevel(level: Level) {
    setSelectedLevel(level);
    setCurrentView("game");
  }

  function handleBack() {
    setCurrentView("levelSelect");
  }

  function handleSwitchLevel(newLevel: Level) {
    setSelectedLevel(newLevel);
    setCurrentView("game");
  }

  if (currentView === "levelSelect") {
    return (
      <div className={styles.pageWrapper}>
        <header className={styles.appHeader}>
          <span className={styles.appTitle}>wörtl</span>
        </header>
        <div className={styles.main}>
          <LevelSelect onSelectLevel={handleSelectLevel} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <GameScreen
        key={selectedLevel}
        level={selectedLevel}
        onBack={handleBack}
        onSwitchLevel={handleSwitchLevel}
      />
    </div>
  );
}
