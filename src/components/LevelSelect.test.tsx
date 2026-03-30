import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LevelSelect from "./LevelSelect";

describe("LevelSelect", () => {
  it("renders three level cards", () => {
    render(<LevelSelect onSelectLevel={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Einfach/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schwer/i })).toBeInTheDocument();
  });

  it("always shows 'Spielen' badge for all levels", () => {
    render(<LevelSelect onSelectLevel={vi.fn()} />);
    const spielenBadges = screen.getAllByText("Spielen");
    expect(spielenBadges).toHaveLength(3);
  });

  it("always shows 'Schwierigkeitsgrad wählen' heading", () => {
    render(<LevelSelect onSelectLevel={vi.fn()} />);
    expect(screen.getByText(/Schwierigkeitsgrad wählen/)).toBeInTheDocument();
  });

  it("calls onSelectLevel with 'easy' when Einfach card is clicked", () => {
    const onSelectLevel = vi.fn();
    render(<LevelSelect onSelectLevel={onSelectLevel} />);
    fireEvent.click(screen.getByRole("button", { name: /Einfach/i }));
    expect(onSelectLevel).toHaveBeenCalledWith("easy");
  });

  it("calls onSelectLevel with 'normal' when Normal card is clicked", () => {
    const onSelectLevel = vi.fn();
    render(<LevelSelect onSelectLevel={onSelectLevel} />);
    fireEvent.click(screen.getByRole("button", { name: /Normal/i }));
    expect(onSelectLevel).toHaveBeenCalledWith("normal");
  });

  it("calls onSelectLevel with 'hard' when Schwer card is clicked", () => {
    const onSelectLevel = vi.fn();
    render(<LevelSelect onSelectLevel={onSelectLevel} />);
    fireEvent.click(screen.getByRole("button", { name: /Schwer/i }));
    expect(onSelectLevel).toHaveBeenCalledWith("hard");
  });

  it("card triggers selection on Enter key press", () => {
    const onSelectLevel = vi.fn();
    render(<LevelSelect onSelectLevel={onSelectLevel} />);
    const card = screen.getByRole("button", { name: /Einfach/i });
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onSelectLevel).toHaveBeenCalledWith("easy");
  });

  it("card triggers selection on Space key press", () => {
    const onSelectLevel = vi.fn();
    render(<LevelSelect onSelectLevel={onSelectLevel} />);
    const card = screen.getByRole("button", { name: /Einfach/i });
    fireEvent.keyDown(card, { key: " " });
    expect(onSelectLevel).toHaveBeenCalledWith("easy");
  });
});
