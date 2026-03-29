"use client";

import type { GameStatus } from "@/types/gameTypes";
import styles from "./ResultBanner.module.css";

type ResultBannerProps = {
  status: GameStatus;
  targetWord: string;
  attemptCount: number;
};

export default function ResultBanner({ status, targetWord, attemptCount }: ResultBannerProps) {
  if (status === "playing") return null;

  const isWin = status === "won";

  return (
    <div
      className={`${styles.banner} ${isWin ? styles.win : styles.lose}`}
      role="status"
      aria-live="polite"
    >
      {isWin ? (
        <>
          <div className={styles.heading}>Richtig! Du hast das Wort erraten.</div>
          <div className={styles.subtext}>
            Du hast das Wort in {attemptCount} Versuchen erraten.
          </div>
        </>
      ) : (
        <>
          <div className={styles.heading}>Schade!</div>
          <div className={styles.subtext}>
            Das Wort war:{" "}
            <span className={styles.word}>{targetWord}</span>
          </div>
        </>
      )}
    </div>
  );
}
