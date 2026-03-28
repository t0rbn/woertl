import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./page";

describe("Home page – integration", () => {
  it("does not render a header element", () => {
    render(<Home />);
    expect(document.querySelector("header")).toBeNull();
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

  it("renders the text input instead of keyboard", () => {
    render(<Home />);
    expect(screen.getByLabelText("Ratewort eingeben")).toBeInTheDocument();
    expect(screen.queryByLabelText("Tastatur")).not.toBeInTheDocument();
  });

  it("shows toast when submitting fewer than 5 letters", async () => {
    render(<Home />);
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "t" });
    fireEvent.keyDown(input, { key: "a" });
    fireEvent.keyDown(input, { key: "n" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Nicht genug Buchstaben")).toBeInTheDocument();
  });

  it("submits a full guess via input and shows feedback tiles", async () => {
    render(<Home />);
    const input = screen.getByLabelText("Ratewort eingeben");
    // Type BROTE (wrong guess)
    fireEvent.keyDown(input, { key: "b" });
    fireEvent.keyDown(input, { key: "r" });
    fireEvent.keyDown(input, { key: "o" });
    fireEvent.keyDown(input, { key: "t" });
    fireEvent.keyDown(input, { key: "e" });
    fireEvent.keyDown(input, { key: "Enter" });

    // After submission, tiles with feedback should appear
    expect(screen.getByLabelText("B, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("R, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("O, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("T, richtig")).toBeInTheDocument();
    expect(screen.getByLabelText("E, richtig")).toBeInTheDocument();
  });

  it("wins the game when guessing TANTE", async () => {
    render(<Home />);
    const input = screen.getByLabelText("Ratewort eingeben");
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(input, { key }));
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Gewonnen!")).toBeInTheDocument();
  });

  it("input is disabled after winning", async () => {
    render(<Home />);
    const input = screen.getByLabelText("Ratewort eingeben");
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(input, { key }));
    fireEvent.keyDown(input, { key: "Enter" });

    await screen.findByText("Gewonnen!");

    expect(input).toBeDisabled();
  });

  it("loses after 6 wrong guesses and shows lost banner with target word", async () => {
    render(<Home />);
    const input = screen.getByLabelText("Ratewort eingeben");
    // Use 6 different 5-letter words to avoid triggering duplicate validation
    const wrongGuesses = [
      ["b", "r", "o", "t", "e"],
      ["k", "r", "i", "s", "e"],
      ["l", "a", "m", "p", "e"],
      ["h", "u", "n", "d", "e"],
      ["v", "o", "g", "e", "l"],
      ["m", "u", "s", "i", "k"],
    ];
    for (const guess of wrongGuesses) {
      guess.forEach((key) => fireEvent.keyDown(input, { key }));
      fireEvent.keyDown(input, { key: "Enter" });
    }

    expect(await screen.findByText("Leider verloren!")).toBeInTheDocument();
    expect(screen.getByText("TANTE")).toBeInTheDocument();
  });
});
