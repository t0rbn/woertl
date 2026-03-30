import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ResultDialog from "./ResultDialog";

const defaultProps = {
  status: "won" as const,
  targetWord: "TANTE",
  attemptCount: 3,
  maxAttempts: 6,
  currentLevel: "easy" as const,
  onPlayAgain: vi.fn(),
  onChangeLevel: vi.fn(),
  onBackToLevelSelect: vi.fn(),
};

describe("ResultDialog", () => {
  it("has role=dialog and aria-modal=true", () => {
    render(<ResultDialog {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby pointing to result title", () => {
    render(<ResultDialog {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    const labelledById = dialog.getAttribute("aria-labelledby");
    expect(labelledById).toBeTruthy();
    const titleEl = document.getElementById(labelledById!);
    expect(titleEl).toBeInTheDocument();
    expect(titleEl?.textContent).toBe("Gewonnen!");
  });

  it("shows 'Gewonnen!' heading on win", () => {
    render(<ResultDialog {...defaultProps} />);
    expect(screen.getByText("Gewonnen!")).toBeInTheDocument();
  });

  it("shows 'Leider verloren!' heading on loss", () => {
    render(<ResultDialog {...defaultProps} status="lost" />);
    expect(screen.getByText("Leider verloren!")).toBeInTheDocument();
  });

  it("always shows the target word in both win and loss states", () => {
    const { rerender } = render(<ResultDialog {...defaultProps} status="won" />);
    expect(screen.getByText("TANTE")).toBeInTheDocument();

    rerender(<ResultDialog {...defaultProps} status="lost" />);
    expect(screen.getByText("TANTE")).toBeInTheDocument();
  });

  it("shows 'Das Wort war:' label", () => {
    render(<ResultDialog {...defaultProps} />);
    expect(screen.getByText("Das Wort war:")).toBeInTheDocument();
  });

  it("shows attempt count on win", () => {
    render(<ResultDialog {...defaultProps} attemptCount={3} maxAttempts={6} />);
    expect(screen.getByText("Versuch 3 von 6")).toBeInTheDocument();
  });

  it("shows max attempts message on loss", () => {
    render(<ResultDialog {...defaultProps} status="lost" maxAttempts={6} />);
    expect(screen.getByText("Alle 6 Versuche aufgebraucht")).toBeInTheDocument();
  });

  it("shows 'Schwerer spielen' as primary button when won and not on hard", () => {
    render(<ResultDialog {...defaultProps} status="won" currentLevel="easy" />);
    expect(screen.getByText("Schwerer spielen")).toBeInTheDocument();
  });

  it("shows 'Leichter spielen' as primary button when lost and not on easy", () => {
    render(<ResultDialog {...defaultProps} status="lost" currentLevel="hard" />);
    expect(screen.getByText("Leichter spielen")).toBeInTheDocument();
  });

  it("does not show 'Schwerer spielen' when already on hard level and won", () => {
    render(<ResultDialog {...defaultProps} status="won" currentLevel="hard" />);
    expect(screen.queryByText("Schwerer spielen")).not.toBeInTheDocument();
  });

  it("does not show 'Leichter spielen' when already on easy level and lost", () => {
    render(<ResultDialog {...defaultProps} status="lost" currentLevel="easy" />);
    expect(screen.queryByText("Leichter spielen")).not.toBeInTheDocument();
  });

  it("shows 'Nochmal spielen' button always", () => {
    const { rerender } = render(<ResultDialog {...defaultProps} status="won" currentLevel="easy" />);
    expect(screen.getByText("Nochmal spielen")).toBeInTheDocument();

    rerender(<ResultDialog {...defaultProps} status="lost" currentLevel="easy" />);
    expect(screen.getByText("Nochmal spielen")).toBeInTheDocument();
  });

  it("shows 'Stufenauswahl' ghost button always", () => {
    const { rerender } = render(<ResultDialog {...defaultProps} status="won" />);
    expect(screen.getByText("Stufenauswahl")).toBeInTheDocument();

    rerender(<ResultDialog {...defaultProps} status="lost" />);
    expect(screen.getByText("Stufenauswahl")).toBeInTheDocument();
  });

  it("calls onPlayAgain when 'Nochmal spielen' is clicked", () => {
    const onPlayAgain = vi.fn();
    render(<ResultDialog {...defaultProps} onPlayAgain={onPlayAgain} />);
    fireEvent.click(screen.getByText("Nochmal spielen"));
    expect(onPlayAgain).toHaveBeenCalledOnce();
  });

  it("calls onChangeLevel with next harder level when 'Schwerer spielen' is clicked", () => {
    const onChangeLevel = vi.fn();
    render(
      <ResultDialog
        {...defaultProps}
        status="won"
        currentLevel="easy"
        onChangeLevel={onChangeLevel}
      />
    );
    fireEvent.click(screen.getByText("Schwerer spielen"));
    expect(onChangeLevel).toHaveBeenCalledWith("normal");
  });

  it("calls onChangeLevel with next easier level when 'Leichter spielen' is clicked", () => {
    const onChangeLevel = vi.fn();
    render(
      <ResultDialog
        {...defaultProps}
        status="lost"
        currentLevel="hard"
        onChangeLevel={onChangeLevel}
      />
    );
    fireEvent.click(screen.getByText("Leichter spielen"));
    expect(onChangeLevel).toHaveBeenCalledWith("normal");
  });

  it("calls onBackToLevelSelect when 'Stufenauswahl' is clicked", () => {
    const onBackToLevelSelect = vi.fn();
    render(<ResultDialog {...defaultProps} onBackToLevelSelect={onBackToLevelSelect} />);
    fireEvent.click(screen.getByText("Stufenauswahl"));
    expect(onBackToLevelSelect).toHaveBeenCalledOnce();
  });

  it("primary button has aria-label", () => {
    render(<ResultDialog {...defaultProps} status="won" currentLevel="easy" />);
    const primaryBtn = screen.getByText("Schwerer spielen").closest("button");
    expect(primaryBtn).toHaveAttribute("aria-label");
  });

  it("ghost button has aria-label 'Zur Stufenauswahl zurückkehren'", () => {
    render(<ResultDialog {...defaultProps} />);
    const ghostBtn = screen.getByText("Stufenauswahl").closest("button");
    expect(ghostBtn).toHaveAttribute("aria-label", "Zur Stufenauswahl zurückkehren");
  });

  it("primary button receives focus on mount", () => {
    render(<ResultDialog {...defaultProps} status="won" currentLevel="easy" />);
    const primaryBtn = screen.getByText("Schwerer spielen").closest("button");
    expect(document.activeElement).toBe(primaryBtn);
  });

  it("primary button receives focus when on hard (won) - Nochmal spielen is primary", () => {
    render(<ResultDialog {...defaultProps} status="won" currentLevel="hard" />);
    // On hard + won, Nochmal spielen is the only/primary button
    const primaryBtn = screen.getByText("Nochmal spielen").closest("button");
    expect(document.activeElement).toBe(primaryBtn);
  });
});
