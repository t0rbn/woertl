import { describe, it, expect } from "vitest";
import { calculateKeyboardState } from "./calculateKeyboardState";
import type { TileState } from "@/types/gameTypes";

describe("calculateKeyboardState", () => {
  it("returns empty state for no guesses", () => {
    expect(calculateKeyboardState([])).toEqual({});
  });

  it("tracks a single guess correctly", () => {
    const guesses: TileState[][] = [
      [
        { letter: "T", feedback: "correct" },
        { letter: "A", feedback: "absent" },
        { letter: "N", feedback: "present" },
        { letter: "T", feedback: "correct" },
        { letter: "E", feedback: "correct" },
      ],
    ];
    const state = calculateKeyboardState(guesses);
    expect(state["T"]).toBe("correct");
    expect(state["A"]).toBe("absent");
    expect(state["N"]).toBe("present");
    expect(state["E"]).toBe("correct");
  });

  it("correct overrides present", () => {
    const guesses: TileState[][] = [
      [
        { letter: "A", feedback: "present" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
      [
        { letter: "A", feedback: "correct" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
    ];
    expect(calculateKeyboardState(guesses)["A"]).toBe("correct");
  });

  it("correct overrides absent", () => {
    const guesses: TileState[][] = [
      [
        { letter: "A", feedback: "absent" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
      [
        { letter: "A", feedback: "correct" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
    ];
    expect(calculateKeyboardState(guesses)["A"]).toBe("correct");
  });

  it("present overrides absent", () => {
    const guesses: TileState[][] = [
      [
        { letter: "A", feedback: "absent" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
      [
        { letter: "A", feedback: "present" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
    ];
    expect(calculateKeyboardState(guesses)["A"]).toBe("present");
  });

  it("absent does not override present", () => {
    const guesses: TileState[][] = [
      [
        { letter: "A", feedback: "present" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
      [
        { letter: "A", feedback: "absent" },
        { letter: "B", feedback: "absent" },
        { letter: "C", feedback: "absent" },
        { letter: "D", feedback: "absent" },
        { letter: "E", feedback: "absent" },
      ],
    ];
    expect(calculateKeyboardState(guesses)["A"]).toBe("present");
  });

  it("tracks umlaut keys correctly", () => {
    const guesses: TileState[][] = [
      [
        { letter: "Ä", feedback: "correct" },
        { letter: "Ö", feedback: "present" },
        { letter: "Ü", feedback: "absent" },
        { letter: "T", feedback: "correct" },
        { letter: "E", feedback: "correct" },
      ],
    ];
    const state = calculateKeyboardState(guesses);
    expect(state["Ä"]).toBe("correct");
    expect(state["Ö"]).toBe("present");
    expect(state["Ü"]).toBe("absent");
  });
});
