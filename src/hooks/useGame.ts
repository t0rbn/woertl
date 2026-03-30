"use client";

import { useReducer, useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { GameState, TileState, Level } from "@/types/gameTypes";
import { calculateFeedback } from "@/lib/calculateFeedback";
import { LEVEL_CONFIGS } from "@/lib/levelConfig";
import { getDailyWord } from "@/lib/dailyWord";
import { isWordInValidationDict } from "@/lib/wordList";
import { loadValidationDict } from "@/lib/dictLoader";

// Valid German letters including umlauts
const VALID_LETTER_REGEX = /^[a-zA-ZäöüÄÖÜß]$/;

type Action =
  | { type: "SET_GUESS"; guess: string }
  | { type: "SUBMIT_GUESS" };

type ReducerConfig = {
  wordLength: number;
  maxAttempts: number;
};

type DictStatus = "idle" | "loading" | "loaded" | "error";

function createInitialState(targetWord: string): GameState {
  return {
    targetWord,
    guesses: [],
    currentGuess: "",
    status: "playing",
    attemptCount: 0,
  };
}

function makeGameReducer(config: ReducerConfig) {
  return function gameReducer(state: GameState, action: Action): GameState {
    if (state.status !== "playing") return state;

    switch (action.type) {
      case "SET_GUESS": {
        // Filter to valid letters only and enforce word length limit
        const filtered = Array.from(action.guess)
          .filter((ch) => VALID_LETTER_REGEX.test(ch))
          .map((ch) => ch.toUpperCase());
        if (filtered.length > config.wordLength) return state;
        return { ...state, currentGuess: filtered.join("") };
      }
      case "SUBMIT_GUESS": {
        const currentChars = Array.from(state.currentGuess);
        if (currentChars.length !== config.wordLength) return state;

        const feedbacks = calculateFeedback(state.currentGuess, state.targetWord);
        const newRow: TileState[] = currentChars.map((letter, i) => ({
          letter,
          feedback: feedbacks[i] ?? "absent",
        }));

        const newGuesses = [...state.guesses, newRow];
        const newAttemptCount = state.attemptCount + 1;

        const isWin = feedbacks.every((f) => f === "correct");
        const isLoss = !isWin && newAttemptCount >= config.maxAttempts;

        return {
          ...state,
          guesses: newGuesses,
          currentGuess: "",
          attemptCount: newAttemptCount,
          status: isWin ? "won" : isLoss ? "lost" : "playing",
        };
      }
      default:
        return state;
    }
  };
}

export type UseGameReturn = {
  gameState: GameState;
  setGuess: (newGuess: string) => void;
  submitGuess: () => void;
  toastMessage: string | null;
  /** True while the input-error shake animation should be active. */
  inputError: boolean;
  /** True while the validation dictionary is being fetched. Input should be disabled. */
  isDictLoading: boolean;
  /** True if the validation dictionary failed to load. Input should remain disabled. */
  isDictError: boolean;
};

export function useGame(level: Level = "easy"): UseGameReturn {
  const levelConfig = LEVEL_CONFIGS[level];
  const targetWord = getDailyWord(level);

  // Create a stable reducer from the level config; level is fixed for the
  // lifetime of this hook instance (GameScreen unmounts when level changes).
  const gameReducer = useMemo(
    () => makeGameReducer({ wordLength: levelConfig.wordLength, maxAttempts: levelConfig.maxAttempts }),
    [levelConfig.wordLength, levelConfig.maxAttempts]
  );

  const [gameState, dispatch] = useReducer(
    gameReducer,
    createInitialState(targetWord)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inputError, setInputError] = useState(false);

  // Dictionary loading state
  const [dictStatus, setDictStatus] = useState<DictStatus>("idle");
  const [validationDict, setValidationDict] = useState<Set<string> | null>(null);

  // Ref to hold the pending guess word while the dictionary loads, so we can
  // validate and submit it automatically once the dictionary is ready.
  const pendingGuess = useRef<string | null>(null);

  // Stable ref to the current guesses list so async callbacks can access the
  // latest value without stale-closure issues.
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  });

  const setGuess = useCallback((newGuess: string) => {
    dispatch({ type: "SET_GUESS", guess: newGuess });
  }, []);

  /**
   * Validates and submits the current guess. The validation order is:
   *   1. Length check
   *   2. Dictionary check (using the extended validation dictionary)
   *   3. Duplicate check
   *   4. Dispatch SUBMIT_GUESS
   *
   * On the first call, if the dictionary hasn't been loaded yet, it triggers
   * an async fetch. The pending guess is remembered and processed automatically
   * once the dictionary is available.
   */
  const submitGuess = useCallback(() => {
    // (1) Check correct length
    const currentChars = Array.from(gameState.currentGuess);
    if (currentChars.length !== levelConfig.wordLength) {
      setToastMessage(`Wort muss ${levelConfig.wordLength} Buchstaben haben.`);
      return;
    }

    // (2a) If dict loading failed – nothing to do; input already disabled.
    if (dictStatus === "error") {
      return;
    }

    // (2b) If dict not yet loaded, trigger loading and remember pending guess.
    if (dictStatus === "idle") {
      pendingGuess.current = gameState.currentGuess;
      setDictStatus("loading");
      setToastMessage("Wortliste wird geladen...");
      return;
    }

    // (2c) Already loading – show loading toast and do nothing else.
    if (dictStatus === "loading") {
      setToastMessage("Wortliste wird geladen...");
      return;
    }

    // (2d) Dict is loaded – validate the word against the dictionary.
    const dict = validationDict;
    if (!dict || !isWordInValidationDict(gameState.currentGuess, dict)) {
      setToastMessage("Wort nicht im Wörterbuch");
      setInputError(true);
      setTimeout(() => setInputError(false), 350);
      return;
    }

    // (3) Check word is not a duplicate.
    const currentWord = gameState.currentGuess.toUpperCase();
    const isDuplicate = gameState.guesses.some((row) => {
      const guessedWord = row.map((tile) => tile.letter).join("").toUpperCase();
      return guessedWord === currentWord;
    });

    if (isDuplicate) {
      setToastMessage("Du hast dieses Wort bereits geraten.");
      setInputError(true);
      setTimeout(() => setInputError(false), 350);
      return;
    }

    // (4) Process guess.
    dispatch({ type: "SUBMIT_GUESS" });
  }, [gameState.currentGuess, gameState.guesses, levelConfig.wordLength, dictStatus, validationDict]);

  // Effect: when dictStatus transitions to "loading", perform the async fetch.
  // All post-load logic (clearing toast, validating pending guess) is done
  // inside the promise callbacks to avoid React stale-closure issues between effects.
  useEffect(() => {
    if (dictStatus !== "loading") return;

    let cancelled = false;

    loadValidationDict(level)
      .then((dict) => {
        if (cancelled) return;

        // Store the dictionary and mark as loaded.
        setValidationDict(dict);
        setDictStatus("loaded");

        // Process the pending guess immediately in the .then() callback so that
        // we use the freshly-resolved dictionary (not stale state).
        const pending = pendingGuess.current;
        pendingGuess.current = null;

        if (!pending) {
          // No pending guess; just clear the loading toast.
          setToastMessage(null);
          return;
        }

        // Validate the pending guess against the freshly loaded dictionary.
        if (!isWordInValidationDict(pending, dict)) {
          setToastMessage("Wort nicht im Wörterbuch");
          setInputError(true);
          setTimeout(() => setInputError(false), 350);
          return;
        }

        // Check for duplicate using the ref to get the most recent guesses list.
        const currentWord = pending.toUpperCase();
        const isDuplicate = gameStateRef.current.guesses.some((row) => {
          const guessedWord = row.map((tile) => tile.letter).join("").toUpperCase();
          return guessedWord === currentWord;
        });

        if (isDuplicate) {
          setToastMessage("Du hast dieses Wort bereits geraten.");
          setInputError(true);
          setTimeout(() => setInputError(false), 350);
          return;
        }

        // Clear the loading toast and submit the guess.
        setToastMessage(null);
        dispatch({ type: "SUBMIT_GUESS" });
      })
      .catch(() => {
        if (cancelled) return;
        setDictStatus("error");
        setToastMessage("Fehler beim Laden. Bitte Seite neu laden.");
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictStatus, level]);

  // Auto-dismiss toast after 1500ms – but NOT for the loading toast and NOT for
  // the persistent dictionary-error toast.
  useEffect(() => {
    if (!toastMessage) return;
    if (toastMessage === "Wortliste wird geladen...") return;
    if (toastMessage === "Fehler beim Laden. Bitte Seite neu laden.") return;
    const timer = setTimeout(() => setToastMessage(null), 1500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  return {
    gameState,
    setGuess,
    submitGuess,
    toastMessage,
    inputError,
    isDictLoading: dictStatus === "loading",
    isDictError: dictStatus === "error",
  };
}
