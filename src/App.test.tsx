import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "@/app";

describe("App", () => {
  it("renders the main layout", () => {
    render(<App />);
    // Check for main layout structure
    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
  });

  it("renders EvorBrain title in sidebar", () => {
    render(<App />);
    expect(screen.getByText("EvorBrain")).toBeInTheDocument();
  });

  it("renders Dashboard page", () => {
    render(<App />);
    // Check for the dashboard heading (h2)
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to EvorBrain - Your Personal Productivity System")
    ).toBeInTheDocument();
  });
});
