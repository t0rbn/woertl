import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import GuessInput from "./GuessInput";

function renderInput(overrides: Partial<React.ComponentProps<typeof GuessInput>> = {}) {
  const ref = createRef<HTMLInputElement>();
  const props = {
    value: "",
    onLetterInput: vi.fn(),
    onDelete: vi.fn(),
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

  // --- Physical keyboard (keyDown) tests ---

  it("calls onLetterInput with uppercase letter on valid key press", () => {
    const onLetterInput = vi.fn();
    renderInput({ onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "t" });
    expect(onLetterInput).toHaveBeenCalledWith("T");
  });

  it("filters out non-alphabetic characters via keyDown", () => {
    const onLetterInput = vi.fn();
    renderInput({ onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "1" });
    fireEvent.keyDown(input, { key: " " });
    fireEvent.keyDown(input, { key: "!" });
    expect(onLetterInput).not.toHaveBeenCalled();
  });

  it("calls onDelete on Backspace via keyDown", () => {
    const onDelete = vi.fn();
    renderInput({ onDelete });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onDelete).toHaveBeenCalled();
  });

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

  it("does not call onLetterInput when value already has 5 characters (keyDown)", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TANTE", onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "x" });
    expect(onLetterInput).not.toHaveBeenCalled();
  });

  it("handles umlaut keys (ä) via keyDown", () => {
    const onLetterInput = vi.fn();
    renderInput({ onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.keyDown(input, { key: "ä" });
    expect(onLetterInput).toHaveBeenCalledWith("Ä");
  });

  // --- Virtual keyboard (onChange) tests ---

  it("calls onLetterInput when a letter is added via onChange (virtual keyboard)", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TA", onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAN" } });
    expect(onLetterInput).toHaveBeenCalledWith("N");
  });

  it("calls onDelete when value length decreases via onChange (virtual keyboard backspace)", () => {
    const onDelete = vi.fn();
    renderInput({ value: "TAN", onDelete });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TA" } });
    expect(onDelete).toHaveBeenCalled();
  });

  it("rejects non-alphabetic characters entered via onChange", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TA", onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TA1" } });
    expect(onLetterInput).not.toHaveBeenCalled();
  });

  it("uppercases letters added via onChange", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TA", onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAn" } });
    expect(onLetterInput).toHaveBeenCalledWith("N");
  });

  it("does not call onLetterInput via onChange when value is already at wordLength", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TANTE", wordLength: 5, onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TANTEX" } });
    expect(onLetterInput).not.toHaveBeenCalled();
  });

  it("accepts umlaut characters entered via onChange", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TA", onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAÄ" } });
    expect(onLetterInput).toHaveBeenCalledWith("Ä");
  });

  // --- Disabled state ---

  it("is disabled when disabled prop is true", () => {
    renderInput({ disabled: true });
    expect(screen.getByLabelText("Wort eingeben")).toBeDisabled();
  });

  it("does not call onLetterInput when disabled (onChange)", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TA", disabled: true, onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    fireEvent.change(input, { target: { value: "TAN" } });
    expect(onLetterInput).not.toHaveBeenCalled();
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
    const onLetterInput = vi.fn();
    renderInput({ value: "SCHULBUC", wordLength: 8, onLetterInput });
    const input = screen.getByLabelText("Wort eingeben");
    // With 8 chars already, adding more should not call onLetterInput
    fireEvent.keyDown(input, { key: "h" });
    expect(onLetterInput).not.toHaveBeenCalled();
  });

  it("calls onSubmit when wordLength is 8 and value has 8 characters", () => {
    const onSubmit = vi.fn();
    renderInput({ value: "SCHULBUC", wordLength: 8, onSubmit });
    const input = screen.getByLabelText("Wort eingeben");
    // Wait, we need exactly 8 chars - SCHULBUC is 8
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
});
