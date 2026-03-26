"use client";

import type { TileState, GameStatus } from "@/types/gameTypes";
import Tile from "./Tile";
import styles from "./TileGrid.module.css";

const TOTAL_ROWS = 6;
const WORD_LENGTH = 5;

type TileGridProps = {
  guesses: TileState[][];
  currentGuess: string;
  currentRow: number;
  status: GameStatus;
  shakeRow: boolean;
};

function getAriaAnnouncement(row: TileState[]): string {
  return row
    .map((tile) => {
      const feedbackText =
        tile.feedback === "correct"
          ? "richtig"
          : tile.feedback === "present"
            ? "vorhanden"
            : "nicht im Wort";
      return `${tile.letter} ${feedbackText}`;
    })
    .join(", ");
}

export default function TileGrid({
  guesses,
  currentGuess,
  currentRow,
  status,
  shakeRow,
}: TileGridProps) {
  const lastSubmittedRow = guesses.length > 0 ? guesses[guesses.length - 1] : null;
  const liveAnnouncement = lastSubmittedRow ? getAriaAnnouncement(lastSubmittedRow) : "";

  const currentGuessChars = Array.from(currentGuess);

  return (
    <div className={styles.grid} aria-label="Spielfeld">
      <div
        className={styles.srOnly}
        aria-live="polite"
        aria-atomic="true"
      >
        {liveAnnouncement}
      </div>
      {Array.from({ length: TOTAL_ROWS }, (_, rowIndex) => {
        const isSubmittedRow = rowIndex < guesses.length;
        const isActiveRow = rowIndex === currentRow && status === "playing";

        let rowClassName = styles.row;
        if (isActiveRow && shakeRow) {
          rowClassName += ` ${styles.shake}`;
        }
        // Apply bounce animation to winning row
        if (status === "won" && rowIndex === guesses.length - 1) {
          rowClassName += ` ${styles.bounce}`;
        }

        return (
          <div key={rowIndex} className={rowClassName}>
            {Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
              if (isSubmittedRow) {
                const tile = guesses[rowIndex]?.[colIndex] ?? { letter: "", feedback: null };
                return (
                  <Tile
                    key={colIndex}
                    letter={tile.letter}
                    feedback={tile.feedback}
                    isActiveRow={false}
                  />
                );
              } else if (isActiveRow) {
                const letter = currentGuessChars[colIndex] ?? "";
                return (
                  <Tile
                    key={colIndex}
                    letter={letter}
                    feedback={null}
                    isActiveRow={true}
                  />
                );
              } else {
                return (
                  <Tile
                    key={colIndex}
                    letter=""
                    feedback={null}
                    isActiveRow={false}
                  />
                );
              }
            })}
          </div>
        );
      })}
    </div>
  );
}
