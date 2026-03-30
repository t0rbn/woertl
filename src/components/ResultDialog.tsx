"use client";

import { useEffect, useRef } from "react";
import type { Level } from "@/types/gameTypes";
import { LEVEL_CONFIGS } from "@/lib/levelConfig";
import styles from "./ResultDialog.module.css";

type ResultDialogProps = {
  status: "won" | "lost";
  targetWord: string;
  attemptCount: number;
  maxAttempts: number;
  currentLevel: Level;
  onPlayAgain: () => void;
  onChangeLevel: (level: Level) => void;
  onBackToLevelSelect: () => void;
};

const LEVEL_ORDER: Level[] = ["easy", "normal", "hard"];

function getNextHarderLevel(level: Level): Level | null {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx < LEVEL_ORDER.length - 1 ? (LEVEL_ORDER[idx + 1] ?? null) : null;
}

function getNextEasierLevel(level: Level): Level | null {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx > 0 ? (LEVEL_ORDER[idx - 1] ?? null) : null;
}

export default function ResultDialog({
  status,
  targetWord,
  attemptCount,
  maxAttempts,
  currentLevel,
  onPlayAgain,
  onChangeLevel,
  onBackToLevelSelect,
}: ResultDialogProps) {
  const isWin = status === "won";
  const nextHarder = getNextHarderLevel(currentLevel);
  const nextEasier = getNextEasierLevel(currentLevel);

  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "result-dialog-title";

  // Focus the primary button on mount
  useEffect(() => {
    primaryBtnRef.current?.focus();
  }, []);

  // Focus trap: keep Tab/Shift+Tab within the dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const levelConfig = LEVEL_CONFIGS[currentLevel];

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog" aria-labelledby={titleId}>
      <div className={styles.dialog} ref={dialogRef}>
        <h2 id={titleId} className={styles.heading}>
          {isWin ? "Gewonnen!" : "Leider verloren!"}
        </h2>
        <p className={styles.subheading}>
          {isWin
            ? `Versuch ${attemptCount} von ${maxAttempts}`
            : `Alle ${maxAttempts} Versuche aufgebraucht`}
        </p>

        <div className={styles.solutionBox}>
          <span className={styles.solutionLabel}>Das Wort war:</span>
          <span className={styles.solutionWord}>{targetWord.toUpperCase()}</span>
        </div>

        <div className={styles.actions}>
          {isWin ? (
            <>
              {nextHarder ? (
                <>
                  <button
                    ref={primaryBtnRef}
                    className={styles.btnPrimary}
                    onClick={() => onChangeLevel(nextHarder)}
                    aria-label={`Schwerer spielen: ${LEVEL_CONFIGS[nextHarder].label}`}
                    type="button"
                  >
                    Schwerer spielen
                  </button>
                  <button
                    className={styles.btnSecondary}
                    onClick={onPlayAgain}
                    aria-label={`Nochmal auf ${levelConfig.label} spielen`}
                    type="button"
                  >
                    Nochmal spielen
                  </button>
                </>
              ) : (
                <button
                  ref={primaryBtnRef}
                  className={styles.btnPrimary}
                  onClick={onPlayAgain}
                  aria-label={`Nochmal auf ${levelConfig.label} spielen`}
                  type="button"
                >
                  Nochmal spielen
                </button>
              )}
            </>
          ) : (
            <>
              {nextEasier ? (
                <>
                  <button
                    ref={primaryBtnRef}
                    className={styles.btnPrimary}
                    onClick={() => onChangeLevel(nextEasier)}
                    aria-label={`Leichter spielen: ${LEVEL_CONFIGS[nextEasier].label}`}
                    type="button"
                  >
                    Leichter spielen
                  </button>
                  <button
                    className={styles.btnSecondary}
                    onClick={onPlayAgain}
                    aria-label={`Nochmal auf ${levelConfig.label} spielen`}
                    type="button"
                  >
                    Nochmal spielen
                  </button>
                </>
              ) : (
                <button
                  ref={primaryBtnRef}
                  className={styles.btnPrimary}
                  onClick={onPlayAgain}
                  aria-label={`Nochmal auf ${levelConfig.label} spielen`}
                  type="button"
                >
                  Nochmal spielen
                </button>
              )}
            </>
          )}

          <button
            className={styles.btnGhost}
            onClick={onBackToLevelSelect}
            aria-label="Zur Stufenauswahl zurückkehren"
            type="button"
          >
            Stufenauswahl
          </button>
        </div>
      </div>
    </div>
  );
}
