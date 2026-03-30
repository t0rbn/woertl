import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "./page";

// Mock dailyWord to return predictable words
vi.mock("@/lib/dailyWord", () => ({
  getDailyWord: (level: string) => {
    if (level === "easy") return "TANTE";
    if (level === "normal") return "SCHULBCH"; // 8 letters placeholder
    if (level === "hard") return "ZUSAMMENABT"; // 11 letters placeholder
    return "TANTE";
  },
}));

// Mock dictLoader so that loadValidationDict resolves immediately with all
// test words in the dictionary. Without this mock, the async fetch would hang
// in the test environment.
vi.mock("@/lib/dictLoader", () => ({
  loadValidationDict: vi.fn((_level: string) => {
    return Promise.resolve(
      new Set([
        "TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK",
        "ABENDROT", "SCHULBCH", "COMPUTER", "DIAGNOSE", "BIOLOGIE",
        "ABENDSTUNDEN", "ALLGEMEINGUT",
      ])
    );
  }),
}));

// Helper: navigate to game screen by clicking Easy level card
function selectEasyLevel() {
  fireEvent.click(screen.getByRole("button", { name: /Einfach/i }));
}

// Helper: simulate typing a word into the input via onChange events,
// building up the value character by character.
function typeWordViaChange(input: HTMLElement, word: string) {
  let current = "";
  for (const ch of word) {
    current += ch;
    fireEvent.change(input, { target: { value: current } });
  }
}

describe("Home page – integration", () => {
  it("renders the level selection screen on load", () => {
    render(<Home />);
    expect(screen.getByText("Level wählen")).toBeInTheDocument();
  });

  it("renders three level cards on the level selection screen", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /Einfach/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schwer/i })).toBeInTheDocument();
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
    // Every tile is a div inside the grid
    const rows = grid.querySelectorAll("[aria-label]");
    // Exclude the polite live region (which has aria-live)
    const tiles = Array.from(rows).filter((el) => !el.hasAttribute("aria-live") && !el.hasAttribute("aria-atomic"));
    expect(tiles).toHaveLength(30);
  });

  it("renders the text input after selecting a level", () => {
    render(<Home />);
    selectEasyLevel();
    expect(screen.getByLabelText("Wort eingeben")).toBeInTheDocument();
    expect(screen.queryByLabelText("Tastatur")).not.toBeInTheDocument();
  });

  it("shows toast when submitting fewer than 5 letters", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Wort eingeben");
    // Type only 3 letters via onChange
    typeWordViaChange(input, "tan");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Wort muss 5 Buchstaben haben.")).toBeInTheDocument();
  });

  it("submits a full guess via input and shows feedback tiles", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Wort eingeben");
    // Type BROTE (wrong guess) via onChange
    typeWordViaChange(input, "brote");
    fireEvent.keyDown(input, { key: "Enter" });

    // After submission, tiles with feedback should appear.
    // The first guess triggers async dict loading; use findByLabelText to wait.
    expect(await screen.findByLabelText("B, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("R, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("O, nicht im Wort")).toBeInTheDocument();
    expect(screen.getByLabelText("T, richtig")).toBeInTheDocument();
    expect(screen.getByLabelText("E, richtig")).toBeInTheDocument();
  });

  it("wins the game when guessing TANTE", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Wort eingeben");
    typeWordViaChange(input, "tante");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Richtig! Du hast das Wort erraten.")).toBeInTheDocument();
  });

  it("input is disabled after winning", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Wort eingeben");
    typeWordViaChange(input, "tante");
    fireEvent.keyDown(input, { key: "Enter" });

    await screen.findByText("Richtig! Du hast das Wort erraten.");

    expect(input).toBeDisabled();
  });

  it("loses after 6 wrong guesses and shows lost banner with target word", async () => {
    render(<Home />);
    selectEasyLevel();
    const input = screen.getByLabelText("Wort eingeben");
    // Use 6 different 5-letter words to avoid triggering duplicate validation
    const wrongGuesses = ["brote", "krise", "lampe", "hunde", "vogel", "musik"];

    // First guess triggers async dict loading; wait for it to complete
    const [firstGuess, ...restGuesses] = wrongGuesses;
    typeWordViaChange(input, firstGuess!);
    fireEvent.keyDown(input, { key: "Enter" });
    // Wait for the dict to load and the first guess to be submitted
    await screen.findByLabelText("B, nicht im Wort");

    // Remaining guesses – dict is now loaded
    for (const guess of restGuesses) {
      // After each submission the input value is cleared; type the next word
      typeWordViaChange(input, guess);
      fireEvent.keyDown(input, { key: "Enter" });
    }

    expect(await screen.findByText("Schade!")).toBeInTheDocument();
    expect(screen.getByText("TANTE")).toBeInTheDocument();
  });

  it("back button returns to level selection screen", async () => {
    render(<Home />);
    selectEasyLevel();
    expect(screen.getByLabelText("Spielfeld")).toBeInTheDocument();
    const backBtn = screen.getByRole("button", { name: /Zurück zur Levelauswahl/ });
    fireEvent.click(backBtn);
    expect(screen.getByText("Level wählen")).toBeInTheDocument();
  });
});
