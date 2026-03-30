import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { createRef } from "react";
import GuessInput from "./GuessInput";

function renderInput(overrides: Partial<React.ComponentProps<typeof GuessInput>> = {}) {
  const ref = createRef<HTMLInputElement>();
  const props = {
    value: "",
    onGuessChange: vi.fn(),
    onSubmit: vi.fn(),
    onError: vi.fn(),
    disabled: false,
    error: false,
    wordLength: 5,
    ...overrides,
  };
  render(<GuessInput ref={ref} {...props} />);
  return { ref, ...props };
}

describe("GuessInput", () => {
  it("renders with correct placeholder", () => {
    renderInput();
    expect(screen.getByPlaceholderText("Wort eingeben...")).toBeInTheDocument();
  });

  it("renders with correct aria-label", () => {
    renderInput();
    expect(screen.getByLabelText("Wort eingeben")).toBeInTheDocument();
  });

  // --- onChange-driven input (primary flow) ---

  it("calls onGuessChange with uppercase letter when letter is added via onChange", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TA", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAN" } });
    expect(onGuessChange).toHaveBeenCalledWith("TAN");
  });

  it("calls onGuessChange with filtered value when deletion occurs via onChange", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TA" } });
    expect(onGuessChange).toHaveBeenCalledWith("TA");
  });

  it("filters out non-alphabetic characters via onChange", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TA", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TA1" } });
    // "1" is filtered, so only "TA" remains
    expect(onGuessChange).toHaveBeenCalledWith("TA");
  });

  it("uppercases letters added via onChange", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TA", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAn" } });
    expect(onGuessChange).toHaveBeenCalledWith("TAN");
  });

  it("enforces word length limit via onChange", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TANTE", wordLength: 5, onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TANTEX" } });
    // "X" is the 6th char; limited to 5
    expect(onGuessChange).toHaveBeenCalledWith("TANTE");
  });

  it("accepts umlaut characters entered via onChange", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TA", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAÄ" } });
    expect(onGuessChange).toHaveBeenCalledWith("TAÄ");
  });

  it("calls onGuessChange with empty string when value is cleared via onChange", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "" } });
    expect(onGuessChange).toHaveBeenCalledWith("");
  });

  // --- Submit behavior ---

  it("calls onSubmit on Enter when value has 5 characters", () => {
    const onSubmit = vi.fn();
    renderInput({ value: "TANTE", onSubmit });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();
  });

  it("calls onError on Enter when value has fewer than 5 characters", () => {
    const onError = vi.fn();
    renderInput({ value: "TAN", onError });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onError).toHaveBeenCalled();
  });

  // --- Navigation keys pass through (no preventDefault) ---

  it("does not call onGuessChange on ArrowLeft key", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "ArrowLeft" });
    // onGuessChange should not be called for navigation
    expect(onGuessChange).not.toHaveBeenCalled();
  });

  it("does not call onGuessChange on ArrowRight key", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(onGuessChange).not.toHaveBeenCalled();
  });

  it("does not call onGuessChange on Home key", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "Home" });
    expect(onGuessChange).not.toHaveBeenCalled();
  });

  it("does not call onGuessChange on End key", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "End" });
    expect(onGuessChange).not.toHaveBeenCalled();
  });

  it("allows Delete key to pass through (forward-delete handled by onChange)", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    // Delete key should not be blocked; it'll trigger onChange if there's content after caret
    const event = fireEvent.keyDown(input, { key: "Delete" });
    // The key event should not be prevented (defaultPrevented is false)
    expect(event).toBe(true); // fireEvent returns true when event was not prevented
  });

  it("allows Backspace key to pass through (handled by onChange)", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TAN", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    const event = fireEvent.keyDown(input, { key: "Backspace" });
    // Should not be prevented
    expect(event).toBe(true);
  });

  // --- Non-alphabetic key blocking ---

  it("does not call onGuessChange on numeric key press (blocked by keyDown)", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TA", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "1" });
    expect(onGuessChange).not.toHaveBeenCalled();
  });

  it("does not call onGuessChange on space key press (blocked by keyDown)", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TA", onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: " " });
    expect(onGuessChange).not.toHaveBeenCalled();
  });

  // --- Disabled state ---

  it("is disabled when disabled prop is true", () => {
    renderInput({ disabled: true });
    expect(screen.getByLabelText("Wort eingeben")).toBeDisabled();
  });

  it("does not call onGuessChange when disabled (onChange)", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "TA", disabled: true, onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAN" } });
    expect(onGuessChange).not.toHaveBeenCalled();
  });

  // --- Appearance ---

  it("applies error class when error prop is true", () => {
    renderInput({ error: true });
    const input = screen.getByLabelText("Wort eingeben");
    expect(input.className).toContain("error");
  });

  it("renders submit button labeled Wort abschicken", () => {
    renderInput();
    expect(screen.getByRole("button", { name: "Wort abschicken" })).toBeInTheDocument();
  });

  it("calls onSubmit when button is clicked with 5 characters", () => {
    const onSubmit = vi.fn();
    renderInput({ value: "TANTE", onSubmit });
    fireEvent.click(screen.getByRole("button", { name: "Wort abschicken" }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("calls onError when button is clicked with fewer than 5 characters", () => {
    const onError = vi.fn();
    renderInput({ value: "TAN", onError });
    fireEvent.click(screen.getByRole("button", { name: "Wort abschicken" }));
    expect(onError).toHaveBeenCalled();
  });

  it("submit button is disabled when disabled prop is true", () => {
    renderInput({ disabled: true });
    expect(screen.getByRole("button", { name: "Wort abschicken" })).toBeDisabled();
  });

  it("accepts up to wordLength characters when wordLength is 8", () => {
    const onGuessChange = vi.fn();
    renderInput({ value: "SCHULBUC", wordLength: 8, onGuessChange });
    const input = screen.getByLabelText("Wort eingeben");
    // With 8 chars already, adding one more should limit to 8
    fireEvent.change(input, { target: { value: "SCHULBUCH" } });
    expect(onGuessChange).toHaveBeenCalledWith("SCHULBUC");
  });

  it("calls onSubmit when wordLength is 8 and value has 8 characters", () => {
    const onSubmit = vi.fn();
    renderInput({ value: "SCHULBUC", wordLength: 8, onSubmit });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows error message when error prop is true", () => {
    renderInput({ error: true });
    expect(screen.getByText("Nicht im Wörterbuch")).toBeInTheDocument();
  });

  it("does not show error message when error prop is false", () => {
    renderInput({ error: false });
    expect(screen.queryByText("Nicht im Wörterbuch")).not.toBeInTheDocument();
  });

  // --- Input attributes ---

  it("has inputMode=text attribute for appropriate mobile keyboard", () => {
    renderInput();
    const input = screen.getByLabelText("Wort eingeben");
    expect(input).toHaveAttribute("inputmode", "text");
  });

  it("has autocomplete=off", () => {
    renderInput();
    const input = screen.getByLabelText("Wort eingeben");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  it("has autocapitalize=characters", () => {
    renderInput();
    const input = screen.getByLabelText("Wort eingeben");
    expect(input).toHaveAttribute("autocapitalize", "characters");
  });

  it("is not readonly", () => {
    renderInput();
    const input = screen.getByLabelText("Wort eingeben");
    expect(input).not.toHaveAttribute("readonly");
  });

  // --- Caret position restoration ---

  it("calls onGuessChange with correctly filtered value when typing at mid-caret position", () => {
    // Simulates what happens when the user inserts a character in the middle of the input.
    // The native input produces a new full string value; we verify onGuessChange gets the right filtered value.
    const onGuessChange = vi.fn();
    renderInput({ value: "TAE", onGuessChange });

    const input = screen.getByLabelText("Wort eingeben");

    // Simulate caret placed at position 2 (between A and E), then user types "N"
    // resulting in "TANE" from the native input at selectionStart=3.
    // We use fireEvent.change with an init object that overrides selectionStart on the target.
    fireEvent.change(input, { target: { value: "TANE", selectionStart: 3, selectionEnd: 3 } });

    // onGuessChange should be called with "TANE" (all valid letters, already uppercase)
    expect(onGuessChange).toHaveBeenCalledWith("TANE");
  });

  // --- Post-submission reset ---

  it("caret is at position 0 after value prop changes to empty string", () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(
      <GuessInput
        ref={ref}
        value="TANTE"
        onGuessChange={vi.fn()}
        onSubmit={vi.fn()}
        onError={vi.fn()}
        disabled={false}
        error={false}
        wordLength={5}
      />
    );

    // Simulate submission: value becomes empty
    rerender(
      <GuessInput
        ref={ref}
        value=""
        onGuessChange={vi.fn()}
        onSubmit={vi.fn()}
        onError={vi.fn()}
        disabled={false}
        error={false}
        wordLength={5}
      />
    );

    // Caret should be at position 0
    expect(ref.current?.selectionStart).toBe(0);
  });
});
