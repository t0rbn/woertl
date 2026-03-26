import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Keyboard from "./Keyboard";
import type { KeyState } from "@/types/gameTypes";

const emptyKeyState: KeyState = {};

describe("Keyboard", () => {
  it("renders all standard letter keys", () => {
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={() => {}} disabled={false} />);
    // Check a few representative keys
    expect(screen.getByLabelText("Q")).toBeInTheDocument();
    expect(screen.getByLabelText("A")).toBeInTheDocument();
    expect(screen.getByLabelText("M")).toBeInTheDocument();
    expect(screen.getByLabelText("Z")).toBeInTheDocument();
  });

  it("renders umlaut keys", () => {
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={() => {}} disabled={false} />);
    expect(screen.getByLabelText("Ä")).toBeInTheDocument();
    expect(screen.getByLabelText("Ö")).toBeInTheDocument();
    expect(screen.getByLabelText("Ü")).toBeInTheDocument();
  });

  it("renders ENTER and BACKSPACE keys", () => {
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={() => {}} disabled={false} />);
    expect(screen.getByLabelText("Eingabe")).toBeInTheDocument();
    expect(screen.getByLabelText("Löschen")).toBeInTheDocument();
  });

  it("calls onKeyPress with correct key value when a letter key is clicked", () => {
    const onKeyPress = vi.fn();
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={onKeyPress} disabled={false} />);
    fireEvent.click(screen.getByLabelText("T"));
    expect(onKeyPress).toHaveBeenCalledWith("T");
  });

  it("calls onKeyPress with ENTER when EINGABE key is clicked", () => {
    const onKeyPress = vi.fn();
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={onKeyPress} disabled={false} />);
    fireEvent.click(screen.getByLabelText("Eingabe"));
    expect(onKeyPress).toHaveBeenCalledWith("ENTER");
  });

  it("calls onKeyPress with BACKSPACE when delete key is clicked", () => {
    const onKeyPress = vi.fn();
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={onKeyPress} disabled={false} />);
    fireEvent.click(screen.getByLabelText("Löschen"));
    expect(onKeyPress).toHaveBeenCalledWith("BACKSPACE");
  });

  it("calls onKeyPress with Ä when umlaut key is clicked", () => {
    const onKeyPress = vi.fn();
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={onKeyPress} disabled={false} />);
    fireEvent.click(screen.getByLabelText("Ä"));
    expect(onKeyPress).toHaveBeenCalledWith("Ä");
  });

  it("disables all keys when disabled prop is true", () => {
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={() => {}} disabled={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("does not fire click when disabled", () => {
    const onKeyPress = vi.fn();
    render(<Keyboard keyboardState={emptyKeyState} onKeyPress={onKeyPress} disabled={true} />);
    fireEvent.click(screen.getByLabelText("T"));
    expect(onKeyPress).not.toHaveBeenCalled();
  });

  it("applies correct feedback class when key state is correct", () => {
    const keyState: KeyState = { T: "correct" };
    render(<Keyboard keyboardState={keyState} onKeyPress={() => {}} disabled={false} />);
    const tButton = screen.getByLabelText("T");
    expect(tButton.className).toContain("correct");
  });

  it("applies present feedback class when key state is present", () => {
    const keyState: KeyState = { A: "present" };
    render(<Keyboard keyboardState={keyState} onKeyPress={() => {}} disabled={false} />);
    const aButton = screen.getByLabelText("A");
    expect(aButton.className).toContain("present");
  });
});
