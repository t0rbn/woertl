"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./page.module.css";
import { useGame } from "@/hooks/useGame";
import Toast from "@/components/Toast";
import type { ToastVariant } from "@/components/Toast";
import TileGrid from "@/components/TileGrid";
import ResultBanner from "@/components/ResultBanner";
import GuessInput from "@/components/GuessInput";
import LevelSelect from "@/components/LevelSelect";
import type { Level } from "@/types/gameTypes";
import { LEVEL_CONFIGS } from "@/lib/levelConfig";

type LevelStatus = "available" | "won" | "lost";

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readLevelStatus(level: Level): LevelStatus {
  if (typeof window === "undefined") return "available";
  try {
    const key = `game_${level}_${getTodayKey()}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return "available";
    const data = JSON.parse(raw) as { status?: string };
    if (data.status === "won") return "won";
    if (data.status === "lost") return "lost";
  } catch {
    // ignore
  }
  return "available";
}

function writeLevelStatus(level: Level, status: "won" | "lost"): void {
  if (typeof window === "undefined") return;
  try {
    const key = `game_${level}_${getTodayKey()}`;
    sessionStorage.setItem(key, JSON.stringify({ status }));
  } catch {
    // ignore
  }
}

function readAllLevelStatuses(): Record<Level, LevelStatus> {
  return {
    easy: readLevelStatus("easy"),
    normal: readLevelStatus("normal"),
    hard: readLevelStatus("hard"),
  };
}

type View = "levelSelect" | "game";

function GameScreen({
  level,
  onBack,
  onGameOver,
}: {
  level: Level;
  onBack: () => void;
  onGameOver: () => void;
}) {
  const {
    gameState,
    setGuess,
    submitGuess,
    toastMessage,
    inputError: hookInputError,
    isDictLoading,
    isDictError,
  } = useGame(level);
  const [inputError, setInputError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const levelConfig = LEVEL_CONFIGS[level];

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Notify parent when game ends
  const gameOverReported = useRef(false);
  useEffect(() => {
    if (!gameOverReported.current && gameState.status !== "playing") {
      gameOverReported.current = true;
      writeLevelStatus(level, gameState.status);
      onGameOver();
    }
  }, [gameState.status, level, onGameOver]);

  // Escape key to go back
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onBack();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  // Secondary scroll-lock: when the virtual keyboard opens on mobile, some browsers
  // resize the visualViewport and may still scroll the page. We listen for visualViewport
  // resize events and force the window back to the top.
  // Guard for SSR safety and browsers without visualViewport support (e.g., older Firefox).
  // Known limitation: browsers without visualViewport API fall back to the CSS-only approach
  // (overflow: hidden on html) which covers the majority of modern mobile browsers.
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    function handleViewportResize() {
      window.scrollTo(0, 0);
    }

    window.visualViewport!.addEventListener("resize", handleViewportResize);
    return () => {
      window.visualViewport!.removeEventListener("resize", handleViewportResize);
    };
  }, []);

  function handleSubmitGuess() {
    submitGuess();
    // Use requestAnimationFrame to keep the focus call within the same user-gesture
    // callback chain, which is required for mobile browsers to keep the virtual keyboard open.
    requestAnimationFrame(() => focusInput());
  }

  function handleGuessChange(newValue: string) {
    setGuess(newValue);
  }

  function handleError() {
    submitGuess();
    setInputError(true);
    setTimeout(() => {
      setInputError(false);
      focusInput();
    }, 350);
  }

  const isGameOver = gameState.status !== "playing";

  // Determine toast variant based on dictionary loading state.
  const toastVariant: ToastVariant = isDictLoading
    ? "loading"
    : isDictError
      ? "error"
      : "error";

  return (
    <>
      <Toast message={toastMessage} variant={toastVariant} />
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
            onGuessChange={handleGuessChange}
            onSubmit={handleSubmitGuess}
            onError={handleError}
            disabled={isGameOver || isDictLoading || isDictError}
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
  // Lazily initialise from sessionStorage. Game state is not persisted across page reloads.
  const [levelStatuses, setLevelStatuses] = useState<Record<Level, LevelStatus>>(() => {
    return readAllLevelStatuses();
  });

  function handleSelectLevel(level: Level) {
    setSelectedLevel(level);
    setCurrentView("game");
  }

  function handleBack() {
    setCurrentView("levelSelect");
    // Refresh statuses when returning
    setLevelStatuses(readAllLevelStatuses());
  }

  const handleGameOver = useCallback(() => {
    // Refresh statuses when game ends
    setLevelStatuses(readAllLevelStatuses());
  }, []);

  if (currentView === "levelSelect") {
    return (
      <div className={styles.pageWrapper}>
        <header className={styles.appHeader}>
          <span className={styles.appTitle}>wörtl</span>
        </header>
        <div className={styles.main}>
          <LevelSelect
            onSelectLevel={handleSelectLevel}
            levelStatuses={levelStatuses}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <GameScreen
        level={selectedLevel}
        onBack={handleBack}
        onGameOver={handleGameOver}
      />
    </div>
  );
}
