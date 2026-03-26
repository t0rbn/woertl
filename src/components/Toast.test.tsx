import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Toast from "./Toast";

describe("Toast", () => {
  it("renders message when provided", () => {
    render(<Toast message="Nicht genug Buchstaben" />);
    expect(screen.getByText("Nicht genug Buchstaben")).toBeInTheDocument();
  });

  it("does not render when message is null", () => {
    const { container } = render(<Toast message={null} />);
    expect(container.firstChild).toBeNull();
  });
});
