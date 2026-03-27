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
    expect(screen.getByLabelText("Ratewort eingeben")).toBeInTheDocument();
  });

  it("calls onLetterInput with uppercase letter on valid key press", () => {
    const onLetterInput = vi.fn();
    renderInput({ onLetterInput });
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "t" });
    expect(onLetterInput).toHaveBeenCalledWith("T");
  });

  it("filters out non-alphabetic characters", () => {
    const onLetterInput = vi.fn();
    renderInput({ onLetterInput });
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "1" });
    fireEvent.keyDown(input, { key: " " });
    fireEvent.keyDown(input, { key: "!" });
    expect(onLetterInput).not.toHaveBeenCalled();
  });

  it("calls onDelete on Backspace", () => {
    const onDelete = vi.fn();
    renderInput({ onDelete });
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onDelete).toHaveBeenCalled();
  });

  it("calls onSubmit on Enter when value has 5 characters", () => {
    const onSubmit = vi.fn();
    renderInput({ value: "TANTE", onSubmit });
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();
  });

  it("calls onError on Enter when value has fewer than 5 characters", () => {
    const onError = vi.fn();
    renderInput({ value: "TAN", onError });
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onError).toHaveBeenCalled();
  });

  it("does not call onLetterInput when value already has 5 characters", () => {
    const onLetterInput = vi.fn();
    renderInput({ value: "TANTE", onLetterInput });
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "x" });
    expect(onLetterInput).not.toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    renderInput({ disabled: true });
    expect(screen.getByLabelText("Ratewort eingeben")).toBeDisabled();
  });

  it("applies error class when error prop is true", () => {
    renderInput({ error: true });
    const input = screen.getByLabelText("Ratewort eingeben");
    expect(input.className).toContain("error");
  });

  it("handles umlaut keys (ä)", () => {
    const onLetterInput = vi.fn();
    renderInput({ onLetterInput });
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "ä" });
    expect(onLetterInput).toHaveBeenCalledWith("Ä");
  });
});
