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
    const wrongGuess = ["B", "R", "O", "T", "E"];
    for (let i = 0; i < 6; i++) {
      wrongGuess.forEach((l) => act(() => result.current.addLetter(l)));
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
});
