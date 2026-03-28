import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGame } from "./useGame";

describe("useGame", () => {
  it("initializes with correct initial state", () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.gameState.status).toBe("playing");
    expect(result.current.gameState.currentGuess).toBe("");
    expect(result.current.gameState.guesses).toHaveLength(0);
    expect(result.current.gameState.attemptCount).toBe(0);
  });

  it("adds letters to currentGuess", () => {
    const { result } = renderHook(() => useGame());
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("A"));
    expect(result.current.gameState.currentGuess).toBe("TA");
  });

  it("deletes last letter from currentGuess", () => {
    const { result } = renderHook(() => useGame());
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.deleteLetter());
    expect(result.current.gameState.currentGuess).toBe("T");
  });

  it("does not add letter beyond word length (5)", () => {
    const { result } = renderHook(() => useGame());
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

  it("shows toast for too-short submission", () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.addLetter("T");
      result.current.submitGuess();
    });
    expect(result.current.toastMessage).toBe("Nicht genug Buchstaben");
    expect(result.current.gameState.guesses).toHaveLength(0);
  });

  it("submits a valid guess and adds to guesses", () => {
    const { result } = renderHook(() => useGame());
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

  it("wins when guessing the correct word", () => {
    const { result } = renderHook(() => useGame());
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("A"));
    act(() => result.current.addLetter("N"));
    act(() => result.current.addLetter("T"));
    act(() => result.current.addLetter("E"));
    act(() => result.current.submitGuess());
    expect(result.current.gameState.status).toBe("won");
  });

  it("loses after 6 failed attempts", () => {
    const { result } = renderHook(() => useGame());
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
    const { result } = renderHook(() => useGame());
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
    const { result } = renderHook(() => useGame());
    // First submission - add letters individually then submit
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
    const { result } = renderHook(() => useGame());
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
    const { result } = renderHook(() => useGame());
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
    const { result } = renderHook(() => useGame());
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

  it("sets duplicateError to true on a duplicate submission", () => {
    const { result } = renderHook(() => useGame());
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
    expect(result.current.duplicateError).toBe(true);
  });
});
