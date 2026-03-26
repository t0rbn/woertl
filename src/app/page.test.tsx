import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Home from "./page";

describe("Home page – integration", () => {
  it("renders the game title", () => {
    render(<Home />);
    expect(screen.getByText("woertl")).toBeInTheDocument();
  });

  it("renders the game grid (30 tiles)", () => {
    render(<Home />);
    // 6 rows x 5 tiles = 30 tiles; query within the grid container
    const grid = screen.getByLabelText("Spielfeld");
    // Every tile is a div inside the grid
    const rows = grid.querySelectorAll("[aria-label]");
    // Exclude the polite live region (which has aria-live)
    const tiles = Array.from(rows).filter((el) => !el.hasAttribute("aria-live") && !el.hasAttribute("aria-atomic"));
    expect(tiles).toHaveLength(30);
  });

  it("renders keyboard", () => {
    render(<Home />);
    expect(screen.getByLabelText("Tastatur")).toBeInTheDocument();
  });

  it("shows toast when submitting fewer than 5 letters", async () => {
    render(<Home />);
    // Type only 3 letters then submit
    fireEvent.keyDown(document, { key: "t" });
    fireEvent.keyDown(document, { key: "a" });
    fireEvent.keyDown(document, { key: "n" });
    fireEvent.keyDown(document, { key: "Enter" });

    expect(await screen.findByText("Nicht genug Buchstaben")).toBeInTheDocument();
  });

  it("submits a full guess via physical keyboard and shows feedback tiles", async () => {
    render(<Home />);
    // Type BROTE (wrong guess)
    // BROTE vs TANTE: B absent, R absent, O absent, T correct (pos3), E correct (pos4)
    fireEvent.keyDown(document, { key: "b" });
    fireEvent.keyDown(document, { key: "r" });
    fireEvent.keyDown(document, { key: "o" });
    fireEvent.keyDown(document, { key: "t" });
    fireEvent.keyDown(document, { key: "e" });
    fireEvent.keyDown(document, { key: "Enter" });

    // After submission, tiles with feedback should appear
    expect(screen.getByLabelText("B, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("R, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("O, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("T, richtig")).toBeInTheDocument();
    expect(screen.getByLabelText("E, richtig")).toBeInTheDocument();
  });

  it("wins the game when guessing TANTE", async () => {
    render(<Home />);
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(document, { key }));
    fireEvent.keyDown(document, { key: "Enter" });

    expect(await screen.findByText("Gewonnen!")).toBeInTheDocument();
  });

  it("keyboard is disabled after winning", async () => {
    render(<Home />);
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(document, { key }));
    fireEvent.keyDown(document, { key: "Enter" });

    await screen.findByText("Gewonnen!");

    const buttons = screen.getAllByRole("button");
    // Keyboard buttons (not icon buttons) should be disabled
    const keyboardButtons = buttons.filter((b) =>
      b.className.includes("key")
    );
    keyboardButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("loses after 6 wrong guesses and shows lost banner with target word", async () => {
    render(<Home />);
    const wrongGuess = ["b", "r", "o", "t", "e"];
    for (let i = 0; i < 6; i++) {
      wrongGuess.forEach((key) => fireEvent.keyDown(document, { key }));
      fireEvent.keyDown(document, { key: "Enter" });
    }

    expect(await screen.findByText("Leider verloren!")).toBeInTheDocument();
    expect(screen.getByText("TANTE")).toBeInTheDocument();
  });
});
