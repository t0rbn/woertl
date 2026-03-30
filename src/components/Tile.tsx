"use client";

import type { LetterFeedback } from "@/types/gameTypes";
import styles from "./Tile.module.css";

type TileProps = {
  letter: string;
  feedback: LetterFeedback | null;
  isActiveRow: boolean;
  sizeClass?: string;
  wobbleDelay?: number;
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

export default function Tile({ letter, feedback, isActiveRow, sizeClass, wobbleDelay }: TileProps) {
  const hasFeedback = feedback !== null;
  const hasLetter = letter.length > 0;

  let className = styles.tile;
  const isActiveFilled = isActiveRow && hasLetter && !hasFeedback;

  if (hasFeedback) {
    className += ` ${styles[feedback]}`;
  } else if (isActiveRow) {
    className += hasLetter ? ` ${styles.activeFilled}` : ` ${styles.activeEmpty}`;
  } else if (hasLetter) {
    className += ` ${styles.filledNoFeedback}`;
  }

  if (sizeClass) {
    className += ` ${sizeClass}`;
  }

  if (isActiveFilled) {
    className += ` ${styles.wobbleIn}`;
  }

  const inlineStyle = isActiveFilled && wobbleDelay !== undefined
    ? ({ "--wobble-delay": `${wobbleDelay}ms` } as React.CSSProperties)
    : undefined;

  return (
    <div
      className={className}
      style={inlineStyle}
      aria-label={getAriaLabel(letter, feedback)}
      data-feedback={feedback ?? undefined}
    >
      {letter}
    </div>
  );
}
