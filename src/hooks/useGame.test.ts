import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGame } from "./useGame";

// Mock word lists so we don't rely on real data files
vi.mock("@/lib/wordList", () => ({
  getWordList: (level: string) => {
    if (level === "easy") return ["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK"];
    if (level === "normal") return ["ABENDROT", "SCHULBUCH", "COMPUTER", "DIAGNOSE", "BIOLOGIE"];
    if (level === "hard") return ["ABENDSTUNDEN", "ZUSAMMENARBEIT", "ALLGEMEINGUT"];
    return ["TANTE"];
  },
  isWordInList: (word: string, level: string) => {
    const lists: Record<string, string[]> = {
      easy: ["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK"],
      normal: ["ABENDROT", "SCHULBUCH", "COMPUTER", "DIAGNOSE", "BIOLOGIE"],
      hard: ["ABENDSTUNDEN", "ZUSAMMENARBEIT", "ALLGEMEINGUT"],
    };
    const list = lists[level] ?? ["TANTE"];
    if (!list || list.length === 0) return true;
    return list.includes(word.toUpperCase());
  },
}));

describe("useGame", () => {
  it("initializes with correct initial state", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    expect(result.current.gameState.status).toBe("playing");
    expect(result.current.gameState.currentGuess).toBe("");
    expect(result.current.gameState.guesses).toHaveLength(0);
    expect(result.current.gameState.attemptCount).toBe(0);
  });

  it("adds letters to currentGuess", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("A"));
    expect(result.current.gameState.currentGuess).toBe("TA");
  });

  it("deletes last letter from currentGuess", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.deleteLetter());
    expect(result.current.gameState.currentGuess).toBe("T");
  });

  it("does not add letter beyond word length (5 for easy)", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => {
      result.current.addLetter("T");
      result.current.addLetter("A");
      result.current.addLetter("N");
      result.current.addLetter("T");
      result.current.addLetter("E");
      result.current.addLetter("X"); // 6th letter, should be ignored
    });
    expect(Array.from(result.current.gameState.currentGuess)).toHaveLength(5);
  });

  it("does not add letter beyond word length (8 for normal)", () => {
    const { result } = renderHook(() => useGame("normal", "ABENDROT"));
    act(() => {
      for (const ch of "SCHULBUCHX") {
        result.current.addLetter(ch);
      }
    });
    expect(Array.from(result.current.gameState.currentGuess)).toHaveLength(8);
  });

  it("shows toast for too-short submission", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => {
      result.current.addLetter("T");
      result.current.submitGuess();
    });
    expect(result.current.toastMessage).toBe("Wort muss 5 Buchstaben haben.");
    expect(result.current.gameState.guesses).toHaveLength(0);
  });

  it("submits a valid guess and adds to guesses", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.guesses).toHaveLength(1);
    expect(result.current.gameState.currentGuess).toBe("");
    expect(result.current.gameState.attemptCount).toBe(1);
  });

  it("wins when guessing the correct word (easy)", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.addLetter("N"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.status).toBe("won");
  });

  it("wins when guessing the correct word (normal, 8 letters)", () => {
    const { result } = renderHook(() => useGame("normal", "ABENDROT"));
    for (const ch of "ABENDROT") {
      act(() => result.current.addLetter(ch));
    }
    act(() => result.current.submitGuess());
    expect(result.current.gameState.status).toBe("won");
  });

  it("loses after max attempts (easy: 6 attempts)", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // Use 6 different 5-letter words to avoid triggering duplicate validation
    const wrongGuesses = [
      ["B", "R", "O", "T", "E"],
      ["K", "R", "I", "S", "E"],
      ["L", "A", "M", "P", "E"],
      ["H", "U", "N", "D", "E"],
      ["V", "O", "G", "E", "L"],
      ["M", "U", "S", "I", "K"],
    ];
    for (const guess of wrongGuesses) {
      guess.forEach((l) => act(() => result.current.addLetter(l)));
      act(() => result.current.submitGuess());
    }
    expect(result.current.gameState.status).toBe("lost");
    expect(result.current.gameState.attemptCount).toBe(6);
  });

  it("does not accept input after game is won", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.addLetter("N"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.status).toBe("won");
    act(() => result.current.addLetter("X"));
    expect(result.current.gameState.currentGuess).toBe("");
  });

  it("shows toast 'Du hast dieses Wort bereits geraten.' when submitting the same word twice", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // First submission
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.guesses).toHaveLength(1);
    // Second submission of same word
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.toastMessage).toBe("Du hast dieses Wort bereits geraten.");
  });

  it("does not increment attemptCount or add a new row when submitting a duplicate", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // First submission
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.attemptCount).toBe(1);
    expect(result.current.gameState.guesses).toHaveLength(1);
    // Duplicate submission
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.attemptCount).toBe(1);
    expect(result.current.gameState.guesses).toHaveLength(1);
  });

  it("preserves currentGuess after a duplicate submission", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // First submission
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    // Enter the same word again
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    // Submit duplicate
    act(() => result.current.submitGuess());
    // currentGuess should still contain "BROTE" because dispatch was not called
    expect(result.current.gameState.currentGuess).toBe("BROTE");
  });

  it("duplicate check is case-insensitive", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // First submission uppercase
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.guesses).toHaveLength(1);
    // Second submission lowercase (addLetter converts to uppercase internally)
    act(() => result.current.addLetter("b"));
    act(() => result.current.addLetter("r"));
    act(() => result.current.addLetter("o"));
    act(() => result.current.addLetter("t"));
    act(() => result.current.addLetter("e"));
    act(() => result.current.submitGuess());
    expect(result.current.toastMessage).toBe("Du hast dieses Wort bereits geraten.");
    expect(result.current.gameState.guesses).toHaveLength(1);
  });

  it("sets inputError to true on a duplicate submission", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // First submission
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    // Duplicate submission
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.inputError).toBe(true);
  });

  // --- Dictionary validation tests ---

  it("shows toast 'Wort nicht im Wörterbuch' when submitting a word not in the dictionary", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // "BAUCH" is not in the mock easy word list
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.addLetter("U"));
    act(() => result.current.addLetter("C"));
    act(() => result.current.addLetter("H"));
    act(() => result.current.submitGuess());
    expect(result.current.toastMessage).toBe("Wort nicht im Wörterbuch");
  });

  it("does not consume a turn when submitting a word not in the dictionary", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.addLetter("U"));
    act(() => result.current.addLetter("C"));
    act(() => result.current.addLetter("H"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.attemptCount).toBe(0);
    expect(result.current.gameState.guesses).toHaveLength(0);
  });

  it("sets inputError to true when submitting a word not in the dictionary", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.addLetter("U"));
    act(() => result.current.addLetter("C"));
    act(() => result.current.addLetter("H"));
    act(() => result.current.submitGuess());
    expect(result.current.inputError).toBe(true);
  });

  it("preserves currentGuess after a dictionary rejection", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.addLetter("U"));
    act(() => result.current.addLetter("C"));
    act(() => result.current.addLetter("H"));
    act(() => result.current.submitGuess());
    // currentGuess must be retained so the player can correct without retyping
    expect(result.current.gameState.currentGuess).toBe("BAUCH");
  });

  it("shows the duplicate message (not the dictionary message) for a duplicate valid word", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // First submission of a valid word
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.guesses).toHaveLength(1);
    // Second submission of the same valid word (duplicate)
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    // Should trigger duplicate message, NOT the dictionary message
    expect(result.current.toastMessage).toBe("Du hast dieses Wort bereits geraten.");
    expect(result.current.toastMessage).not.toBe("Wort nicht im Wörterbuch");
  });

  // --- Reset game tests ---

  it("resets game state with resetGame and new target word", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // Play a guess first
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.guesses).toHaveLength(1);
    // Reset with a new word
    act(() => result.current.resetGame("BROTE"));
    expect(result.current.gameState.guesses).toHaveLength(0);
    expect(result.current.gameState.currentGuess).toBe("");
    expect(result.current.gameState.status).toBe("playing");
    expect(result.current.gameState.targetWord).toBe("BROTE");
    expect(result.current.gameState.attemptCount).toBe(0);
  });

  it("resetGame allows winning with the new target word after reset", () => {
    const { result } = renderHook(() => useGame("easy", "TANTE"));
    // Reset with BROTE as target
    act(() => result.current.resetGame("BROTE"));
    // Guess BROTE
    act(() => result.current.addLetter("B"));
    act(() => result.current.addLetter("R"));
    act(() => result.current.addLetter("O"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.status).toBe("won");
  });
});
