"use client";

import { forwardRef, useEffect } from "react";
import styles from "./GuessInput.module.css";

type GuessInputProps = {
  value: string;
  onLetterInput: (letter: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onError: () => void;
  disabled: boolean;
  error: boolean;
  wordLength?: number;
};

// Valid German letters including umlauts
const VALID_LETTER_REGEX = /^[a-zA-ZäöüÄÖÜß]$/;

const GuessInput = forwardRef<HTMLInputElement, GuessInputProps>(
  function GuessInput(
    { value, onLetterInput, onDelete, onSubmit, onError, disabled, error, wordLength = 5 },
    ref
  ) {
    // Auto-focus on mount
    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.focus();
      }
    }, [ref]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      // We handle input via onKeyDown; reset input to controlled value
      e.preventDefault();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (disabled) return;

      if (e.key === "Enter") {
        if (value.length === wordLength) {
          onSubmit();
        } else {
          onError();
        }
        return;
      }

      if (e.key === "Backspace") {
        onDelete();
        e.preventDefault();
        return;
      }

      if (e.key.length === 1 && VALID_LETTER_REGEX.test(e.key)) {
        if (value.length < wordLength) {
          onLetterInput(e.key.toUpperCase());
        }
        e.preventDefault();
        return;
      }

      // Block all other keys
      e.preventDefault();
    }

    const isFull = value.length === wordLength;

    function handleButtonClick() {
      if (disabled) return;
      if (isFull) {
        onSubmit();
      } else {
        onError();
      }
    }

    return (
      <div className={styles.wrapper}>
        <input
          ref={ref}
          type="text"
          className={`${styles.input} ${isFull ? styles.full : ""} ${error ? styles.error : ""}`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={wordLength}
          disabled={disabled}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Wort eingeben"
          placeholder="Wort eingeben..."
        />
        <div className={styles.hint}>
          Enter zum Absenden / Backspace zum Löschen
        </div>
        <button
          className={`${styles.submitBtn} ${isFull ? styles.submitBtnFull : ""}`}
          onClick={handleButtonClick}
          disabled={disabled}
          type="button"
          aria-label="Wort abschicken"
        >
          OK
        </button>
        <div
          aria-live="polite"
          className={styles.errorMsg}
        >
          {error ? "Nicht im Wörterbuch" : ""}
        </div>
      </div>
    );
  }
);

export default GuessInput;
