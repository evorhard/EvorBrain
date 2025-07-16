import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders welcome message", () => {
    render(<App />);
    expect(screen.getByText("Welcome to EvorBrain!")).toBeInTheDocument();
  });

  it("renders productivity system description", () => {
    render(<App />);
    expect(
      screen.getByText("Your offline-first personal productivity system.")
    ).toBeInTheDocument();
  });

  it("renders input field", () => {
    render(<App />);
    const input = screen.getByPlaceholderText("Enter a name...");
    expect(input).toBeInTheDocument();
  });

  it("renders greet button", () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /greet/i });
    expect(button).toBeInTheDocument();
  });
});
