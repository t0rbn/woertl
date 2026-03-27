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
};

// Valid German letters including umlauts
const VALID_LETTER_REGEX = /^[a-zA-ZäöüÄÖÜß]$/;

const GuessInput = forwardRef<HTMLInputElement, GuessInputProps>(
  function GuessInput(
    { value, onLetterInput, onDelete, onSubmit, onError, disabled, error },
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
        if (value.length === 5) {
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
        if (value.length < 5) {
          onLetterInput(e.key.toUpperCase());
        }
        e.preventDefault();
        return;
      }

      // Block all other keys
      e.preventDefault();
    }

    const isFull = value.length === 5;

    return (
      <div className={styles.wrapper}>
        <input
          ref={ref}
          type="text"
          className={`${styles.input} ${isFull ? styles.full : ""} ${error ? styles.error : ""}`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={5}
          disabled={disabled}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-label="Ratewort eingeben"
          placeholder="Wort eingeben..."
        />
        <div className={styles.hint}>
          Enter zum Absenden / Backspace zum Löschen
        </div>
      </div>
    );
  }
);

export default GuessInput;
