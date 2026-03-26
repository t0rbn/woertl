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
          <div className={styles.heading}>Gewonnen!</div>
          <div className={styles.subtext}>
            Versuch {attemptCount} von 6
          </div>
        </>
      ) : (
        <>
          <div className={styles.heading}>Leider verloren!</div>
          <div className={styles.subtext}>
            Das Wort war:{" "}
            <span className={styles.word}>{targetWord}</span>
          </div>
        </>
      )}
    </div>
  );
}
