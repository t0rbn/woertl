import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./page";

// Mock randomWord to return predictable words
vi.mock("@/lib/randomWord", () => ({
  getRandomWord: (level: string, lastWord?: string) => {
    if (level === "easy") {
      // Return a different word if lastWord is TANTE, to test consecutive-repeat avoidance
      if (lastWord === "TANTE") return "BROTE";
      return "TANTE";
    }
    if (level === "normal") return "ABENDROT"; // 8 letters
    if (level === "hard") return "ABENDSTUNDEN"; // 12 letters
    return "TANTE";
  },
}));

// Mock wordList for validation
vi.mock("@/lib/wordList", () => ({
  getWordList: (level: string) => {
    if (level === "easy") return ["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK"];
    if (level === "normal") return ["ABENDROT", "SCHULBUCH", "COMPUTER", "DIAGNOSE", "BIOLOGIE"];
    if (level === "hard") return ["ABENDSTUNDEN", "ZUSAMMENARBEIT", "ALLGEMEINGUT"];
    return ["TANTE"];
  },
  isWordInList: (word: string, level: string) => {
    const lists: Record<string, string[]> = {
      easy: ["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK"],
      normal: ["ABENDROT", "SCHULBUCH", "COMPUTER", "DIAGNOSE", "BIOLOGIE"],
      hard: ["ABENDSTUNDEN", "ZUSAMMENARBEIT", "ALLGEMEINGUT"],
    };
    const list = lists[level] ?? ["TANTE"];
    if (!list || list.length === 0) return true;
    return list.includes(word.toUpperCase());
  },
}));

// Helper: navigate to game screen by clicking Easy level card
function selectEasyLevel() {
  fireEvent.click(screen.getByRole("button", { name: /Einfach/i }));
}

describe("Home page – integration", () => {
  it("renders the level selection screen on load", () => {
    render(<Home />);
    expect(screen.getByText(/Schwierigkeitsgrad wählen/)).toBeInTheDocument();
  });

  it("renders three level cards on the level selection screen", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /Einfach/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schwer/i })).toBeInTheDocument();
  });

  it("always shows 'Spielen' badge (no status badges)", () => {
    render(<Home />);
    const spielenBadges = screen.getAllByText("Spielen");
    expect(spielenBadges).toHaveLength(3);
  });

  it("navigates to game screen when a level is selected", () => {
    render(<Home />);
    selectEasyLevel();
    expect(screen.getByLabelText("Spielfeld")).toBeInTheDocument();
  });

  it("renders the game grid (30 tiles) after selecting easy level", () => {
    render(<Home />);
    selectEasyLevel();
    // 6 rows x 5 tiles = 30 tiles; query within the grid container
    const grid = screen.getByLabelText("Spielfeld");
    const rows = grid.querySelectorAll("[aria-label]");
    // Exclude the polite live region (which has aria-live)
    const tiles = Array.from(rows).filter((el) => !el.hasAttribute("aria-live") && !el.hasAttribute("aria-atomic"));
    expect(tiles).toHaveLength(30);
  });

  it("renders the text input after selecting a level", () => {
    render(<Home />);
    selectEasyLevel();
    expect(screen.getByLabelText("Ratewort eingeben")).toBeInTheDocument();
    expect(screen.queryByLabelText("Tastatur")).not.toBeInTheDocument();
  });

  it("shows toast when submitting fewer than 5 letters", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Ratewort eingeben");
    fireEvent.keyDown(input, { key: "t" });
    fireEvent.keyDown(input, { key: "a" });
    fireEvent.keyDown(input, { key: "n" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Wort muss 5 Buchstaben haben.")).toBeInTheDocument();
  });

  it("submits a full guess via input and shows feedback tiles", async () => {
    render(<Home />);
    selectEasyLevel();
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

  it("wins the game when guessing TANTE and shows result dialog", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Ratewort eingeben");
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(input, { key }));
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Gewonnen!")).toBeInTheDocument();
  });

  it("input is disabled after winning", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Ratewort eingeben");
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(input, { key }));
    fireEvent.keyDown(input, { key: "Enter" });

    await screen.findByText("Gewonnen!");

    expect(input).toBeDisabled();
  });

  it("loses after 6 wrong guesses and shows result dialog with target word", async () => {
    render(<Home />);
    selectEasyLevel();
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

  it("back button returns to level selection screen", async () => {
    render(<Home />);
    selectEasyLevel();
    expect(screen.getByLabelText("Spielfeld")).toBeInTheDocument();
    const backBtn = screen.getByRole("button", { name: /Zurück zur Levelauswahl/ });
    fireEvent.click(backBtn);
    expect(screen.getByText(/Schwierigkeitsgrad wählen/)).toBeInTheDocument();
  });

  it("result dialog 'Stufenauswahl' returns to level select", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Ratewort eingeben");
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(input, { key }));
    fireEvent.keyDown(input, { key: "Enter" });

    // Wait for result dialog
    const stufenBtn = await screen.findByText("Stufenauswahl");
    fireEvent.click(stufenBtn);

    expect(screen.getByText(/Schwierigkeitsgrad wählen/)).toBeInTheDocument();
  });

  it("result dialog 'Schwerer spielen' switches to harder level", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Ratewort eingeben");
    const letters = ["t", "a", "n", "t", "e"];
    letters.forEach((key) => fireEvent.keyDown(input, { key }));
    fireEvent.keyDown(input, { key: "Enter" });

    // Wait for result dialog and click switch level
    const harderBtn = await screen.findByText("Schwerer spielen");
    fireEvent.click(harderBtn);

    // Should now be in game screen with Normal level
    expect(screen.getByText(/Normal/)).toBeInTheDocument();
  });
});
