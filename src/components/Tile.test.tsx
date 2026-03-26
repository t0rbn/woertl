import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Tile from "./Tile";

describe("Tile", () => {
  it("renders the letter", () => {
    render(<Tile letter="T" feedback={null} isActiveRow={false} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders empty tile with aria-label 'leer'", () => {
    render(<Tile letter="" feedback={null} isActiveRow={false} />);
    expect(screen.getByLabelText("leer")).toBeInTheDocument();
  });

  it("has correct aria-label for correct feedback", () => {
    render(<Tile letter="T" feedback="correct" isActiveRow={false} />);
    expect(screen.getByLabelText("T, richtig")).toBeInTheDocument();
  });

  it("has correct aria-label for present feedback", () => {
    render(<Tile letter="A" feedback="present" isActiveRow={false} />);
    expect(screen.getByLabelText("A, vorhanden")).toBeInTheDocument();
  });

  it("has correct aria-label for absent feedback", () => {
    render(<Tile letter="N" feedback="absent" isActiveRow={false} />);
    expect(screen.getByLabelText("N, nicht im Wort")).toBeInTheDocument();
  });

  it("applies correct CSS class for correct feedback", () => {
    const { container } = render(<Tile letter="T" feedback="correct" isActiveRow={false} />);
    expect(container.firstChild).toHaveAttribute("data-feedback", "correct");
  });

  it("applies correct CSS class for present feedback", () => {
    const { container } = render(<Tile letter="A" feedback="present" isActiveRow={false} />);
    expect(container.firstChild).toHaveAttribute("data-feedback", "present");
  });

  it("applies correct CSS class for absent feedback", () => {
    const { container } = render(<Tile letter="N" feedback="absent" isActiveRow={false} />);
    expect(container.firstChild).toHaveAttribute("data-feedback", "absent");
  });

  it("has no data-feedback when feedback is null", () => {
    const { container } = render(<Tile letter="T" feedback={null} isActiveRow={false} />);
    expect(container.firstChild).not.toHaveAttribute("data-feedback");
  });
});
