"use client";

import type { LetterFeedback } from "@/types/gameTypes";
import styles from "./Tile.module.css";

type TileProps = {
  letter: string;
  feedback: LetterFeedback | null;
  isActiveRow: boolean;
};

function getAriaLabel(letter: string, feedback: LetterFeedback | null): string {
  if (!letter) return "leer";
  const feedbackLabel =
    feedback === "correct"
      ? "richtig"
      : feedback === "present"
        ? "vorhanden"
        : feedback === "absent"
          ? "nicht im Wort"
          : "";
  return feedbackLabel ? `${letter}, ${feedbackLabel}` : letter;
}

export default function Tile({ letter, feedback, isActiveRow }: TileProps) {
  const hasFeedback = feedback !== null;
  const hasLetter = letter.length > 0;

  let className = styles.tile;

  if (hasFeedback) {
    className += ` ${styles[feedback]}`;
  } else if (isActiveRow) {
    className += hasLetter ? ` ${styles.activeFilled}` : ` ${styles.activeEmpty}`;
  } else if (hasLetter) {
    className += ` ${styles.filledNoFeedback}`;
  }

  return (
    <div
      className={className}
      aria-label={getAriaLabel(letter, feedback)}
      data-feedback={feedback ?? undefined}
    >
      {letter}
    </div>
  );
}
