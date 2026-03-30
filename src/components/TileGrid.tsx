"use client";

import type { TileState, GameStatus } from "@/types/gameTypes";
import Tile from "./Tile";
import styles from "./TileGrid.module.css";

type TileGridProps = {
  guesses: TileState[][];
  currentGuess: string;
  currentRow: number;
  status: GameStatus;
  shakeRow: boolean;
  wordLength?: number;
  totalRows?: number;
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
  wordLength = 5,
  totalRows = 6,
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
      {Array.from({ length: totalRows }, (_, rowIndex) => {
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

        // Determine font-size modifier class based on word length
        let tileSizeClass = "";
        if (wordLength >= 12) {
          tileSizeClass = styles.tileXs ?? "";
        } else if (wordLength >= 8) {
          tileSizeClass = styles.tileSm ?? "";
        }

        return (
          <div
            key={rowIndex}
            className={rowClassName}
            style={{ "--col-count": wordLength } as React.CSSProperties}
          >
            {Array.from({ length: wordLength }, (_, colIndex) => {
              if (isSubmittedRow) {
                const tile = guesses[rowIndex]?.[colIndex] ?? { letter: "", feedback: null };
                return (
                  <Tile
                    key={colIndex}
                    letter={tile.letter}
                    feedback={tile.feedback}
                    isActiveRow={false}
                    sizeClass={tileSizeClass}
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
                    sizeClass={tileSizeClass}
                    wobbleDelay={colIndex * 70}
                  />
                );
              } else {
                return (
                  <Tile
                    key={colIndex}
                    letter=""
                    feedback={null}
                    isActiveRow={false}
                    sizeClass={tileSizeClass}
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
