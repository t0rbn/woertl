import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LevelSelect from "./LevelSelect";

const allAvailable = {
  easy: "available" as const,
  normal: "available" as const,
  hard: "available" as const,
};

describe("LevelSelect", () => {
  it("renders three level cards", () => {
    render(
      <LevelSelect onSelectLevel={vi.fn()} levelStatuses={allAvailable} />
    );
    expect(screen.getByRole("button", { name: /Einfach/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Normal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schwer/i })).toBeInTheDocument();
  });

  it("shows 'Spielen' badge when level is available", () => {
    render(
      <LevelSelect onSelectLevel={vi.fn()} levelStatuses={allAvailable} />
    );
    const spielenBadges = screen.getAllByText("Spielen");
    expect(spielenBadges).toHaveLength(3);
  });

  it("shows 'Gewonnen' badge when level is won", () => {
    render(
      <LevelSelect
        onSelectLevel={vi.fn()}
        levelStatuses={{ easy: "won", normal: "available", hard: "available" }}
      />
    );
    expect(screen.getByText(/Gewonnen/)).toBeInTheDocument();
  });

  it("shows 'Verloren' badge when level is lost", () => {
    render(
      <LevelSelect
        onSelectLevel={vi.fn()}
        levelStatuses={{ easy: "lost", normal: "available", hard: "available" }}
      />
    );
    expect(screen.getByText("Verloren")).toBeInTheDocument();
  });

  it("calls onSelectLevel with correct level when card is clicked", () => {
    const onSelectLevel = vi.fn();
    render(
      <LevelSelect onSelectLevel={onSelectLevel} levelStatuses={allAvailable} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Einfach/i }));
    expect(onSelectLevel).toHaveBeenCalledWith("easy");
  });

  it("calls onSelectLevel with 'normal' when Normal card is clicked", () => {
    const onSelectLevel = vi.fn();
    render(
      <LevelSelect onSelectLevel={onSelectLevel} levelStatuses={allAvailable} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Normal/i }));
    expect(onSelectLevel).toHaveBeenCalledWith("normal");
  });

  it("calls onSelectLevel with 'hard' when Schwer card is clicked", () => {
    const onSelectLevel = vi.fn();
    render(
      <LevelSelect onSelectLevel={onSelectLevel} levelStatuses={allAvailable} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Schwer/i }));
    expect(onSelectLevel).toHaveBeenCalledWith("hard");
  });

  it("card triggers selection on Enter key press", () => {
    const onSelectLevel = vi.fn();
    render(
      <LevelSelect onSelectLevel={onSelectLevel} levelStatuses={allAvailable} />
    );
    const card = screen.getByRole("button", { name: /Einfach/i });
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onSelectLevel).toHaveBeenCalledWith("easy");
  });

  it("card triggers selection on Space key press", () => {
    const onSelectLevel = vi.fn();
    render(
      <LevelSelect onSelectLevel={onSelectLevel} levelStatuses={allAvailable} />
    );
    const card = screen.getByRole("button", { name: /Einfach/i });
    fireEvent.keyDown(card, { key: " " });
    expect(onSelectLevel).toHaveBeenCalledWith("easy");
  });

  it("shows 'Heute geschafft!' heading when all levels are completed", () => {
    render(
      <LevelSelect
        onSelectLevel={vi.fn()}
        levelStatuses={{ easy: "won", normal: "lost", hard: "won" }}
      />
    );
    expect(screen.getByText("Heute geschafft!")).toBeInTheDocument();
  });

  it("shows 'Schwierigkeitsgrad wählen' heading when not all levels are completed", () => {
    render(
      <LevelSelect onSelectLevel={vi.fn()} levelStatuses={allAvailable} />
    );
    expect(screen.getByText(/Schwierigkeitsgrad/)).toBeInTheDocument();
  });
});
