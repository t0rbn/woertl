import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("renders the wörtl title", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("wörtl");
  });

  it("renders the welcome subtitle in German", () => {
    render(<Home />);
    expect(screen.getByText(/Willkommen bei wörtl/i)).toBeInTheDocument();
  });
});
