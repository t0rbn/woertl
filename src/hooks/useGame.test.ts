import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGame } from "./useGame";
import * as dictLoader from "@/lib/dictLoader";

// Mock dailyWord to return predictable words per level
vi.mock("@/lib/dailyWord", () => ({
  getDailyWord: (level: string) => {
    if (level === "easy") return "TANTE";
    if (level === "normal") return "ABENDROT"; // 8 letters
    if (level === "hard") return "ABENDSTUNDEN"; // 12 letters
    return "TANTE";
  },
}));

// Mock word lists so we don't rely on real data files
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
  isWordInSolutionPool: (word: string, level: string) => {
    const lists: Record<string, string[]> = {
      easy: ["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK"],
      normal: ["ABENDROT", "SCHULBUCH", "COMPUTER", "DIAGNOSE", "BIOLOGIE"],
      hard: ["ABENDSTUNDEN", "ZUSAMMENARBEIT", "ALLGEMEINGUT"],
    };
    const list = lists[level] ?? ["TANTE"];
    if (!list || list.length === 0) return true;
    return list.includes(word.toUpperCase());
  },
  isWordInValidationDict: (word: string, dict: Set<string>) => {
    return dict.has(word.toUpperCase());
  },
}));

// The validation dictionary for each level used in tests.
// These are the words that the mock loadValidationDict will return.
const MOCK_DICTS: Record<string, string[]> = {
  easy: ["TANTE", "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK", "BAUCH"],
  normal: ["ABENDROT", "SCHULBUCH", "COMPUTER", "DIAGNOSE", "BIOLOGIE"],
  hard: ["ABENDSTUNDEN", "ZUSAMMENARBEIT", "ALLGEMEINGUT"],
};

// Mock the dictLoader module so that loadValidationDict resolves immediately
// in tests without hitting the network.
vi.mock("@/lib/dictLoader", () => ({
  loadValidationDict: vi.fn(),
}));

// Helper: set a guess all at once using setGuess
function setWord(
  result: ReturnType<typeof renderHook<ReturnType<typeof useGame>, Parameters<typeof useGame>[0]>>["result"],
  word: string
) {
  act(() => result.current.setGuess(word));
}

describe("useGame", () => {
  beforeEach(() => {
    // Reset all mock call counts and restore default implementations.
    vi.mocked(dictLoader.loadValidationDict).mockReset();
    vi.mocked(dictLoader.loadValidationDict).mockImplementation((level: string) => {
      return Promise.resolve(new Set(MOCK_DICTS[level] ?? ["TANTE"]));
    });
  });

  it("initializes with correct initial state", () => {
    const { result } = renderHook(() => useGame("easy"));
    expect(result.current.gameState.status).toBe("playing");
    expect(result.current.gameState.currentGuess).toBe("");
    expect(result.current.gameState.guesses).toHaveLength(0);
    expect(result.current.gameState.attemptCount).toBe(0);
  });

  it("sets currentGuess via setGuess", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => result.current.setGuess("TA"));
    expect(result.current.gameState.currentGuess).toBe("TA");
  });

  it("setGuess converts to uppercase", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => result.current.setGuess("ta"));
    expect(result.current.gameState.currentGuess).toBe("TA");
  });

  it("setGuess filters out non-alphabetic characters", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => result.current.setGuess("T1A!N"));
    expect(result.current.gameState.currentGuess).toBe("TAN");
  });

  it("setGuess does not exceed word length (5 for easy)", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => result.current.setGuess("TANTEX")); // 6 chars
    // Should be rejected entirely since filtered length > wordLength
    expect(Array.from(result.current.gameState.currentGuess)).toHaveLength(0);
  });

  it("setGuess with exactly wordLength characters is accepted", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => result.current.setGuess("TANTE"));
    expect(result.current.gameState.currentGuess).toBe("TANTE");
  });

  it("setGuess with empty string clears the guess", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => result.current.setGuess("TA"));
    act(() => result.current.setGuess(""));
    expect(result.current.gameState.currentGuess).toBe("");
  });

  it("setGuess does not exceed word length (8 for normal)", () => {
    const { result } = renderHook(() => useGame("normal"));
    act(() => result.current.setGuess("SCHULBUCHX")); // 9 chars - rejected
    expect(result.current.gameState.currentGuess).toBe("");
  });

  it("setGuess with 8 chars accepted for normal level", () => {
    const { result } = renderHook(() => useGame("normal"));
    act(() => result.current.setGuess("SCHULBUCH".slice(0, 8)));
    expect(Array.from(result.current.gameState.currentGuess)).toHaveLength(8);
  });

  it("shows toast for too-short submission", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => {
      result.current.setGuess("T");
      result.current.submitGuess();
    });
    expect(result.current.toastMessage).toBe("Wort muss 5 Buchstaben haben.");
    expect(result.current.gameState.guesses).toHaveLength(0);
  });

  it("first guess triggers dictionary loading and guess is automatically submitted after load", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    // Wait for the guess to be automatically submitted after the dict loads.
    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    // The loading state should be done
    expect(result.current.isDictLoading).toBe(false);
  });

  it("after dictionary loads, the pending guess is validated and submitted", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    await waitFor(() => {
      expect(result.current.gameState.guesses).toHaveLength(1);
    });

    expect(result.current.gameState.attemptCount).toBe(1);
    expect(result.current.gameState.currentGuess).toBe("");
    expect(result.current.isDictLoading).toBe(false);
  });

  it("submits a valid guess and adds to guesses (after dict loads)", async () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    expect(result.current.gameState.guesses).toHaveLength(1);
    expect(result.current.gameState.currentGuess).toBe("");
    expect(result.current.gameState.attemptCount).toBe(1);
  });

  it("wins when guessing the correct word (easy)", async () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => setWord(result, "TANTE"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    expect(result.current.gameState.status).toBe("won");
  });

  it("wins when guessing the correct word (normal, 8 letters)", async () => {
    const { result } = renderHook(() => useGame("normal"));
    act(() => setWord(result, "ABENDROT"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    expect(result.current.gameState.status).toBe("won");
  });

  it("loses after max attempts (easy: 6 attempts)", async () => {
    const { result } = renderHook(() => useGame("easy"));
    const wrongGuesses = [
      "BROTE", "KRISE", "LAMPE", "HUNDE", "VOGEL", "MUSIK",
    ];

    // First guess triggers dict load; wait for it
    act(() => setWord(result, wrongGuesses[0]!));
    act(() => result.current.submitGuess());
    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    // Subsequent guesses – dict is now loaded
    for (let i = 1; i < wrongGuesses.length; i++) {
      act(() => setWord(result, wrongGuesses[i]!));
      act(() => result.current.submitGuess());
    }

    expect(result.current.gameState.status).toBe("lost");
    expect(result.current.gameState.attemptCount).toBe(6);
  });

  it("does not accept input after game is won", async () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => setWord(result, "TANTE"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.gameState.status).toBe("won"));

    act(() => result.current.setGuess("BROTE"));
    expect(result.current.gameState.currentGuess).toBe("");
  });

  it("shows toast 'Du hast dieses Wort bereits geraten.' when submitting the same word twice", async () => {
    const { result } = renderHook(() => useGame("easy"));

    // First submission
    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());
    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    // Second submission of same word
    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    expect(result.current.toastMessage).toBe("Du hast dieses Wort bereits geraten.");
  });

  it("does not increment attemptCount or add a new row when submitting a duplicate", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());
    await waitFor(() => expect(result.current.gameState.attemptCount).toBe(1));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    expect(result.current.gameState.attemptCount).toBe(1);
    expect(result.current.gameState.guesses).toHaveLength(1);
  });

  it("preserves currentGuess after a duplicate submission", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());
    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    expect(result.current.gameState.currentGuess).toBe("BROTE");
  });

  it("duplicate check is case-insensitive", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());
    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    // setGuess converts to uppercase internally
    act(() => setWord(result, "brote"));
    act(() => result.current.submitGuess());

    expect(result.current.toastMessage).toBe("Du hast dieses Wort bereits geraten.");
    expect(result.current.gameState.guesses).toHaveLength(1);
  });

  it("sets inputError to true on a duplicate submission", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());
    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    expect(result.current.inputError).toBe(true);
  });

  // --- Umlaut handling in setGuess ---

  it("setGuess handles umlaut characters (single unicode codepoints) correctly", () => {
    const { result } = renderHook(() => useGame("easy"));
    // ä, ö, ü, ß are single codepoints and should each count as one character
    act(() => result.current.setGuess("ÄÖÜSS"));
    expect(Array.from(result.current.gameState.currentGuess)).toHaveLength(5);
    expect(result.current.gameState.currentGuess).toBe("ÄÖÜSS");
  });

  it("setGuess with umlauts converts ä to Ä", () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => result.current.setGuess("äöü"));
    expect(result.current.gameState.currentGuess).toBe("ÄÖÜ");
  });

  // --- Dictionary validation tests ---

  it("shows toast 'Wort nicht im Wörterbuch' when submitting a word not in the validation dict", async () => {
    const { result } = renderHook(() => useGame("easy"));

    // "XYZQW" is not in the mock easy validation dict
    act(() => setWord(result, "XYZQW"));
    act(() => result.current.submitGuess());

    // Wait for dict to load and the rejection to be processed
    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    expect(result.current.toastMessage).toBe("Wort nicht im Wörterbuch");
  });

  it("does not consume a turn when submitting a word not in the validation dict", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "XYZQW"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    expect(result.current.gameState.attemptCount).toBe(0);
    expect(result.current.gameState.guesses).toHaveLength(0);
  });

  it("sets inputError to true when submitting a word not in the validation dict", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "XYZQW"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    expect(result.current.inputError).toBe(true);
  });

  it("preserves currentGuess after a dictionary rejection", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "XYZQW"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    // currentGuess must be retained so the player can correct without retyping
    expect(result.current.gameState.currentGuess).toBe("XYZQW");
  });

  it("shows the duplicate message (not the dictionary message) for a duplicate valid word", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());
    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    expect(result.current.toastMessage).toBe("Du hast dieses Wort bereits geraten.");
    expect(result.current.toastMessage).not.toBe("Wort nicht im Wörterbuch");
  });

  // --- New async dictionary loading behavior tests ---

  it("isDictLoading is false initially (idle)", () => {
    const { result } = renderHook(() => useGame("easy"));
    expect(result.current.isDictLoading).toBe(false);
  });

  it("isDictError is false initially", () => {
    const { result } = renderHook(() => useGame("easy"));
    expect(result.current.isDictError).toBe(false);
  });

  it("loading toast is shown and then cleared when dictionary loads successfully", async () => {
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    // After loading completes, the guess is submitted and the loading toast is gone.
    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    expect(result.current.toastMessage).not.toBe("Wortliste wird geladen...");
    expect(result.current.isDictLoading).toBe(false);
  });

  it("isDictError is true and error toast shown when dict fetch fails", async () => {
    vi.mocked(dictLoader.loadValidationDict).mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictError).toBe(true));

    expect(result.current.isDictLoading).toBe(false);
    expect(result.current.toastMessage).toBe("Fehler beim Laden. Bitte Seite neu laden.");
  });

  it("a word in the validation dict but not in the solution pool is accepted", async () => {
    // "BAUCH" is in the mock validation dict (MOCK_DICTS.easy) but not in
    // the mock solution pool (getWordList("easy")).
    const { result } = renderHook(() => useGame("easy"));

    act(() => setWord(result, "BAUCH"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.isDictLoading).toBe(false));

    // BAUCH is in the validation dict but NOT the solution pool – it should be accepted
    expect(result.current.gameState.guesses).toHaveLength(1);
    expect(result.current.gameState.attemptCount).toBe(1);
    expect(result.current.toastMessage).not.toBe("Wort nicht im Wörterbuch");
  });

  // --- Post-submission reset test ---

  it("currentGuess resets to empty string after SUBMIT_GUESS", async () => {
    const { result } = renderHook(() => useGame("easy"));
    act(() => setWord(result, "BROTE"));
    act(() => result.current.submitGuess());

    await waitFor(() => expect(result.current.gameState.guesses).toHaveLength(1));

    expect(result.current.gameState.currentGuess).toBe("");
  });
});
