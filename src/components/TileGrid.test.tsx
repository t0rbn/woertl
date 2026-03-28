import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TileGrid from "./TileGrid";
import type { TileState } from "@/types/gameTypes";

const emptyGuesses: TileState[][] = [];

describe("TileGrid", () => {
  it("renders 30 tiles total (6 rows x 5 columns) by default", () => {
    render(
      <TileGrid
        guesses={emptyGuesses}
        currentGuess=""
        currentRow={0}
        status="playing"
        shakeRow={false}
      />
    );
    // Each tile has an aria-label, count "leer" tiles
    const tiles = screen.getAllByLabelText(/leer|richtig|vorhanden|nicht im Wort|^[A-ZÄÖÜ]$/);
    expect(tiles).toHaveLength(30);
  });

  it("renders correct tile count for 8-column normal level (7 rows x 8 columns)", () => {
    render(
      <TileGrid
        guesses={emptyGuesses}
        currentGuess=""
        currentRow={0}
        status="playing"
        shakeRow={false}
        wordLength={8}
        totalRows={7}
      />
    );
    const tiles = screen.getAllByLabelText(/leer|richtig|vorhanden|nicht im Wort|^[A-ZÄÖÜ]$/);
    expect(tiles).toHaveLength(56); // 7 * 8
  });

  it("renders correct tile count for 12-column hard level (8 rows x 12 columns)", () => {
    render(
      <TileGrid
        guesses={emptyGuesses}
        currentGuess=""
        currentRow={0}
        status="playing"
        shakeRow={false}
        wordLength={12}
        totalRows={8}
      />
    );
    const tiles = screen.getAllByLabelText(/leer|richtig|vorhanden|nicht im Wort|^[A-ZÄÖÜ]$/);
    expect(tiles).toHaveLength(96); // 8 * 12
  });

  it("renders submitted row with feedback", () => {
    const guesses: TileState[][] = [
      [
        { letter: "T", feedback: "correct" },
        { letter: "A", feedback: "present" },
        { letter: "N", feedback: "absent" },
        { letter: "T", feedback: "correct" },
        { letter: "E", feedback: "correct" },
      ],
    ];
    render(
      <TileGrid
        guesses={guesses}
        currentGuess=""
        currentRow={1}
        status="playing"
        shakeRow={false}
      />
    );
    // T appears twice with "richtig" (pos 0 and pos 3), use getAllByLabelText
    expect(screen.getAllByLabelText("T, richtig")).toHaveLength(2);
    expect(screen.getByLabelText("A, vorhanden")).toBeInTheDocument();
    expect(screen.getByLabelText("N, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("E, richtig")).toBeInTheDocument();
  });

  it("shows current guess in active row", () => {
    render(
      <TileGrid
        guesses={emptyGuesses}
        currentGuess="TAN"
        currentRow={0}
        status="playing"
        shakeRow={false}
      />
    );
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("N")).toBeInTheDocument();
  });

  it("active row tiles have no feedback", () => {
    render(
      <TileGrid
        guesses={emptyGuesses}
        currentGuess="TANTE"
        currentRow={0}
        status="playing"
        shakeRow={false}
      />
    );
    // Active row letters should have aria-label as just the letter (no feedback text)
    // T appears twice in TANTE
    expect(screen.getAllByLabelText("T")).toHaveLength(2);
    expect(screen.getByLabelText("A")).toBeInTheDocument();
    expect(screen.getByLabelText("N")).toBeInTheDocument();
    expect(screen.getByLabelText("E")).toBeInTheDocument();
  });
});
