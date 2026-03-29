"use client";

import { forwardRef, useEffect, useRef } from "react";
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
    // Track whether the most recent input came from keyDown so onChange can skip it
    const keyHandledRef = useRef(false);

    // Auto-focus on mount
    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.focus();
      }
    }, [ref]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      // If the keystroke was already fully handled by handleKeyDown, skip processing here
      if (keyHandledRef.current) {
        keyHandledRef.current = false;
        return;
      }

      if (disabled) return;

      const newValue = e.target.value;
      const oldValue = value;

      // Detect deletion: new value is shorter than old value
      if (newValue.length < oldValue.length) {
        onDelete();
        return;
      }

      // Detect addition: new value is longer (one or more characters added)
      if (newValue.length > oldValue.length) {
        // Process each newly added character
        const addedPart = newValue.slice(oldValue.length);
        for (const char of addedPart) {
          if (VALID_LETTER_REGEX.test(char) && value.length < wordLength) {
            onLetterInput(char.toUpperCase());
          }
        }
        return;
      }

      // If lengths are equal, no actionable change (e.g. composition events)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (disabled) return;

      // Skip if this is a composing event (IME input) — let onChange handle it
      if (e.nativeEvent.isComposing) return;

      if (e.key === "Enter") {
        keyHandledRef.current = true;
        if (value.length === wordLength) {
          onSubmit();
        } else {
          onError();
        }
        return;
      }

      if (e.key === "Backspace") {
        keyHandledRef.current = true;
        onDelete();
        e.preventDefault();
        return;
      }

      if (e.key.length === 1 && VALID_LETTER_REGEX.test(e.key)) {
        keyHandledRef.current = true;
        if (value.length < wordLength) {
          onLetterInput(e.key.toUpperCase());
        }
        e.preventDefault();
        return;
      }

      // Block all other keys that would produce output
      if (e.key.length === 1) {
        keyHandledRef.current = true;
        e.preventDefault();
      }
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

    function handleFocus() {
      if (ref && "current" in ref && ref.current) {
        ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    return (
      <div className={styles.wrapper}>
        <input
          ref={ref}
          type="text"
          inputMode="text"
          className={`${styles.input} ${isFull ? styles.full : ""} ${error ? styles.error : ""}`}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
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
