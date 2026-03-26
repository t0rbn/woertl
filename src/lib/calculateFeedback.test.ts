import { describe, it, expect } from "vitest";
import { calculateFeedback } from "./calculateFeedback";

describe("calculateFeedback", () => {
  it("all correct", () => {
    expect(calculateFeedback("TANTE", "TANTE")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("all absent", () => {
    expect(calculateFeedback("BBBBB", "TANTE")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("mixed feedback", () => {
    // T(correct), A(correct), N(absent), T(absent?), E(correct)
    // TANFE vs TANTE: T correct, A correct, N correct, F absent, E correct
    const result = calculateFeedback("TANFE", "TANTE");
    expect(result).toEqual(["correct", "correct", "correct", "absent", "correct"]);
  });

  it("present letter (wrong position)", () => {
    // ANNTE guess, TANTE target
    // A-N-N-T-E vs T-A-N-T-E
    // Pass 1 exact: pos2 N==N correct, pos3 T==T correct, pos4 E==E correct
    // Pass 2: A(0): A in target at pos1 (unused) -> present; N(1): N in target... pos2 used -> no other N -> absent
    const result = calculateFeedback("ANNTE", "TANTE");
    expect(result[0]).toBe("present"); // A present
    expect(result[1]).toBe("absent"); // N absent (N already used as correct)
    expect(result[2]).toBe("correct"); // N correct
    expect(result[3]).toBe("correct"); // T correct
    expect(result[4]).toBe("correct"); // E correct
  });

  it("duplicate letters in guess - only one should be marked present/correct", () => {
    // AAAAA vs TANTE: only one A is in target, rest should be absent
    const result = calculateFeedback("AAAAA", "TANTE");
    const presentOrCorrectCount = result.filter(
      (f) => f === "present" || f === "correct"
    ).length;
    expect(presentOrCorrectCount).toBe(1);
    expect(result[1]).toBe("correct"); // A at pos 1 matches
  });

  it("duplicate letters in target", () => {
    // EETEE vs TENTE (T-E-N-T-E): E appears twice in target
    const result = calculateFeedback("EETEE", "TENTE");
    // E(0): not T, E in target at pos1 -> present
    // E(1): not E... wait pos1 in target is E -> correct
    // T(2): not N, T in target at pos0 -> present
    // E(3): not T, E in target at pos4 (pos1 already used) -> present
    // E(4): correct (pos4 is E)
    // Actually need to recalculate:
    // TENTE target: T(0) E(1) N(2) T(3) E(4)
    // EETEE guess: E(0) E(1) T(2) E(3) E(4)
    // Pass1 exact: E(1)==E(1) correct, E(4)==E(4) correct
    // Pass2: E(0): E in target... pos1 used, pos4 used -> no -> absent; T(2): T in target at pos0 (unused) -> present; E(3): E in target... all E positions used -> absent
    expect(result[0]).toBe("absent");
    expect(result[1]).toBe("correct");
    expect(result[2]).toBe("present");
    expect(result[3]).toBe("absent");
    expect(result[4]).toBe("correct");
  });

  it("umlauts in guess treated as single characters", () => {
    // Ä, Ö, Ü each as single letter
    const result = calculateFeedback("ÄÖÜTE", "ÄÖÜTE");
    expect(result).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("umlauts present in wrong position", () => {
    // EÄÖÜT vs TÄÖÜE: T present, Ä correct, Ö correct, Ü correct, E present
    const result = calculateFeedback("EÄÖÜT", "TÄÖÜE");
    expect(result[0]).toBe("present"); // E present
    expect(result[1]).toBe("correct"); // Ä correct
    expect(result[2]).toBe("correct"); // Ö correct
    expect(result[3]).toBe("correct"); // Ü correct
    expect(result[4]).toBe("present"); // T present
  });

  it("is case-insensitive", () => {
    const resultUpper = calculateFeedback("TANTE", "TANTE");
    const resultLower = calculateFeedback("tante", "tante");
    const resultMixed = calculateFeedback("TaNtE", "tAnTe");
    expect(resultUpper).toEqual(resultLower);
    expect(resultUpper).toEqual(resultMixed);
  });
});
