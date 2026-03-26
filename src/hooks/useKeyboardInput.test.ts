import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useKeyboardInput } from "./useKeyboardInput";

describe("useKeyboardInput", () => {
  it("calls addLetter when a letter key is pressed during playing", () => {
    const addLetter = vi.fn();
    const deleteLetter = vi.fn();
    const submitGuess = vi.fn();

    renderHook(() =>
      useKeyboardInput({ status: "playing", addLetter, deleteLetter, submitGuess })
    );

    fireEvent.keyDown(document, { key: "t" });
    expect(addLetter).toHaveBeenCalledWith("T");
  });

  it("calls deleteLetter on Backspace", () => {
    const addLetter = vi.fn();
    const deleteLetter = vi.fn();
    const submitGuess = vi.fn();

    renderHook(() =>
      useKeyboardInput({ status: "playing", addLetter, deleteLetter, submitGuess })
    );

    fireEvent.keyDown(document, { key: "Backspace" });
    expect(deleteLetter).toHaveBeenCalled();
  });

  it("calls submitGuess on Enter", () => {
    const addLetter = vi.fn();
    const deleteLetter = vi.fn();
    const submitGuess = vi.fn();

    renderHook(() =>
      useKeyboardInput({ status: "playing", addLetter, deleteLetter, submitGuess })
    );

    fireEvent.keyDown(document, { key: "Enter" });
    expect(submitGuess).toHaveBeenCalled();
  });

  it("does not call callbacks when game is not playing (won)", () => {
    const addLetter = vi.fn();
    const deleteLetter = vi.fn();
    const submitGuess = vi.fn();

    renderHook(() =>
      useKeyboardInput({ status: "won", addLetter, deleteLetter, submitGuess })
    );

    fireEvent.keyDown(document, { key: "t" });
    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.keyDown(document, { key: "Backspace" });
    expect(addLetter).not.toHaveBeenCalled();
    expect(deleteLetter).not.toHaveBeenCalled();
    expect(submitGuess).not.toHaveBeenCalled();
  });

  it("does not call callbacks when game is lost", () => {
    const addLetter = vi.fn();
    const deleteLetter = vi.fn();
    const submitGuess = vi.fn();

    renderHook(() =>
      useKeyboardInput({ status: "lost", addLetter, deleteLetter, submitGuess })
    );

    fireEvent.keyDown(document, { key: "t" });
    expect(addLetter).not.toHaveBeenCalled();
  });

  it("handles umlaut keys (ä)", () => {
    const addLetter = vi.fn();
    const deleteLetter = vi.fn();
    const submitGuess = vi.fn();

    renderHook(() =>
      useKeyboardInput({ status: "playing", addLetter, deleteLetter, submitGuess })
    );

    fireEvent.keyDown(document, { key: "ä" });
    expect(addLetter).toHaveBeenCalledWith("Ä");
  });

  it("ignores non-letter keys", () => {
    const addLetter = vi.fn();
    const deleteLetter = vi.fn();
    const submitGuess = vi.fn();

    renderHook(() =>
      useKeyboardInput({ status: "playing", addLetter, deleteLetter, submitGuess })
    );

    fireEvent.keyDown(document, { key: "1" });
    fireEvent.keyDown(document, { key: "Shift" });
    fireEvent.keyDown(document, { key: " " });
    expect(addLetter).not.toHaveBeenCalled();
    expect(deleteLetter).not.toHaveBeenCalled();
    expect(submitGuess).not.toHaveBeenCalled();
  });
});
