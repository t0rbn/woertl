"use client";

import type { KeyState, LetterFeedback } from "@/types/gameTypes";
import styles from "./Keyboard.module.css";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Y", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ["AE", "OE", "UE"],
];

type KeyboardProps = {
  keyboardState: KeyState;
  onKeyPress: (key: string) => void;
  disabled: boolean;
};

function getKeyClass(key: string, keyboardState: KeyState): string {
  const state = keyboardState[key];
  if (!state || state === "unused") return styles.key ?? "";
  const feedbackClass = styles[state as LetterFeedback] ?? "";
  return `${styles.key ?? ""} ${feedbackClass}`.trim();
}

function getKeyLabel(key: string): string {
  if (key === "ENTER") return "EINGABE";
  if (key === "BACKSPACE") return "<=";
  if (key === "AE") return "Ä";
  if (key === "OE") return "Ö";
  if (key === "UE") return "Ü";
  return key;
}

function getAriaLabel(key: string): string {
  if (key === "ENTER") return "Eingabe";
  if (key === "BACKSPACE") return "Löschen";
  if (key === "AE") return "Ä";
  if (key === "OE") return "Ö";
  if (key === "UE") return "Ü";
  return key;
}

function getGameKey(key: string): string {
  if (key === "AE") return "Ä";
  if (key === "OE") return "Ö";
  if (key === "UE") return "Ü";
  return key;
}

export default function Keyboard({ keyboardState, onKeyPress, disabled }: KeyboardProps) {
  return (
    <div className={styles.keyboard} aria-label="Tastatur">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "BACKSPACE";
            const feedbackKey = getGameKey(key);
            const keyClass =
              getKeyClass(feedbackKey, keyboardState) +
              (isWide ? ` ${styles.wide}` : "");

            return (
              <button
                key={key}
                className={keyClass}
                onClick={() => onKeyPress(getGameKey(key))}
                disabled={disabled}
                aria-label={getAriaLabel(key)}
              >
                {getKeyLabel(key)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
