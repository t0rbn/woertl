import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultBanner from "./ResultBanner";

describe("ResultBanner", () => {
  it("does not render during playing state", () => {
    const { container } = render(
      <ResultBanner status="playing" targetWord="TANTE" attemptCount={3} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows win message with attempt count", () => {
    render(<ResultBanner status="won" targetWord="TANTE" attemptCount={3} />);
    expect(screen.getByText("Gewonnen!")).toBeInTheDocument();
    expect(screen.getByText("Versuch 3 von 6")).toBeInTheDocument();
  });

  it("shows lose message with revealed word", () => {
    render(<ResultBanner status="lost" targetWord="TANTE" attemptCount={6} />);
    expect(screen.getByText("Leider verloren!")).toBeInTheDocument();
    expect(screen.getByText("TANTE")).toBeInTheDocument();
  });

  it("lose message contains 'Das Wort war:'", () => {
    render(<ResultBanner status="lost" targetWord="TANTE" attemptCount={6} />);
    expect(screen.getByRole("status")).toHaveTextContent("Das Wort war:");
  });
});
