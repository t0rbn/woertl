"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import styles from "./GuessInput.module.css";

type GuessInputProps = {
  value: string;
  onGuessChange: (newValue: string) => void;
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
    { value, onGuessChange, onSubmit, onError, disabled, error, wordLength = 5 },
    ref
  ) {
    // Store the intended caret position to restore after controlled re-render
    const caretPosRef = useRef<number>(0);

    // Auto-focus on mount
    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.focus();
      }
    }, [ref]);

    // Restore caret position after each render where value may have changed.
    // useLayoutEffect runs synchronously after DOM mutations, before the browser paints,
    // which prevents visible caret jumps.
    useLayoutEffect(() => {
      if (ref && "current" in ref && ref.current) {
        const input = ref.current;
        const pos = Math.min(caretPosRef.current, input.value.length);
        input.setSelectionRange(pos, pos);
      }
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (disabled) return;

      const rawValue = e.target.value;
      // Capture the caret position from the raw input before filtering
      const rawCaretPos = e.target.selectionStart ?? rawValue.length;

      // Filter to valid letters only and convert to uppercase
      const chars = Array.from(rawValue);
      const filtered: string[] = [];
      let charsBeforeCaret = 0;
      let filteredBeforeCaret = 0;

      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i]!;
        if (VALID_LETTER_REGEX.test(ch)) {
          filtered.push(ch.toUpperCase());
          if (i < rawCaretPos) {
            filteredBeforeCaret++;
          }
        } else {
          // Count how many chars before the caret were removed (non-alphabetic)
          if (i < rawCaretPos) {
            charsBeforeCaret++;
          }
        }
      }

      // Enforce word length limit
      const limitedFiltered = filtered.slice(0, wordLength);

      // Calculate new caret position after filtering:
      // caret pos = number of valid chars before original caret, capped at word length
      const newCaretPos = Math.min(filteredBeforeCaret, wordLength);
      caretPosRef.current = newCaretPos;

      // Suppress unused variable warning
      void charsBeforeCaret;

      onGuessChange(limitedFiltered.join(""));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (disabled) return;

      // Skip if this is a composing event (IME input) — let onChange handle it
      if (e.nativeEvent.isComposing) return;

      if (e.key === "Enter") {
        if (ref && "current" in ref && ref.current) {
          caretPosRef.current = ref.current.selectionStart ?? value.length;
        }
        if (value.length === wordLength) {
          onSubmit();
        } else {
          onError();
        }
        return;
      }

      // Allow navigation keys to pass through to the native input without preventDefault:
      // ArrowLeft, ArrowRight, Home, End, Delete, Tab, Escape
      const navigationKeys = ["ArrowLeft", "ArrowRight", "Home", "End", "Delete", "Tab", "Escape", "Backspace"];
      if (navigationKeys.includes(e.key)) {
        // Update caret position ref after navigation/deletion
        // We schedule this for after the browser processes the key
        requestAnimationFrame(() => {
          if (ref && "current" in ref && ref.current) {
            caretPosRef.current = ref.current.selectionStart ?? 0;
          }
        });
        return;
      }

      // For single printable characters that fail the letter regex, block them
      if (e.key.length === 1 && !VALID_LETTER_REGEX.test(e.key)) {
        e.preventDefault();
        return;
      }

      // For valid letters, update caret position (will be handled by onChange)
      // Let them pass through to the native input so onChange fires
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
