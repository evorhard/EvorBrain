import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the Tauri invoke function before importing App
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import App from "./App";
import { invoke } from "@tauri-apps/api/core";

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe("App Integration Tests", () => {
  beforeEach(() => {
    // Clear mock before each test
    mockInvoke.mockClear();
  });

  it("renders all expected elements", () => {
    render(<App />);
    
    // Check for title
    expect(screen.getByText("Welcome to EvorBrain!")).toBeInTheDocument();
    
    // Check for subtitle
    expect(screen.getByText("Your offline-first personal productivity system.")).toBeInTheDocument();
    
    // Check for input field
    const input = screen.getByPlaceholderText("Enter a name...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "greet-input");
    
    // Check for button
    const button = screen.getByRole("button", { name: /greet/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "submit");
  });

  it("updates input value when typing", async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const input = screen.getByPlaceholderText("Enter a name...");
    
    await user.type(input, "EvorBrain User");
    
    expect(input).toHaveValue("EvorBrain User");
  });

  it("calls greet command when form is submitted", async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Mock the invoke response
    mockInvoke.mockResolvedValue("Hello, Test User! You've been greeted from Rust!");
    
    const input = screen.getByPlaceholderText("Enter a name...");
    const button = screen.getByRole("button", { name: /greet/i });
    
    // Type a name
    await user.type(input, "Test User");
    
    // Submit the form
    await user.click(button);
    
    // Verify invoke was called with correct parameters
    expect(mockInvoke).toHaveBeenCalledWith("greet", { name: "Test User" });
    expect(mockInvoke).toHaveBeenCalledTimes(1);
    
    // Wait for the greeting message to appear
    await waitFor(() => {
      expect(screen.getByText("Hello, Test User! You've been greeted from Rust!")).toBeInTheDocument();
    });
  });

  it("handles form submission with Enter key", async () => {
    const user = userEvent.setup();
    render(<App />);
    
    mockInvoke.mockResolvedValue("Hello, Enter Key! You've been greeted from Rust!");
    
    const input = screen.getByPlaceholderText("Enter a name...");
    
    // Type a name and press Enter
    await user.type(input, "Enter Key{Enter}");
    
    // Verify invoke was called
    expect(mockInvoke).toHaveBeenCalledWith("greet", { name: "Enter Key" });
    
    // Wait for the greeting message
    await waitFor(() => {
      expect(screen.getByText("Hello, Enter Key! You've been greeted from Rust!")).toBeInTheDocument();
    });
  });

  it("handles empty name submission", async () => {
    const user = userEvent.setup();
    render(<App />);
    
    mockInvoke.mockResolvedValue("Hello, ! You've been greeted from Rust!");
    
    const button = screen.getByRole("button", { name: /greet/i });
    
    // Click button without entering a name
    await user.click(button);
    
    // Verify invoke was called with empty name
    expect(mockInvoke).toHaveBeenCalledWith("greet", { name: "" });
    
    // Wait for the greeting message
    await waitFor(() => {
      expect(screen.getByText("Hello, ! You've been greeted from Rust!")).toBeInTheDocument();
    });
  });

  it("handles multiple greetings", async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const input = screen.getByPlaceholderText("Enter a name...");
    const button = screen.getByRole("button", { name: /greet/i });
    
    // First greeting
    mockInvoke.mockResolvedValue("Hello, First! You've been greeted from Rust!");
    await user.type(input, "First");
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Hello, First! You've been greeted from Rust!")).toBeInTheDocument();
    });
    
    // Clear and second greeting
    await user.clear(input);
    mockInvoke.mockResolvedValue("Hello, Second! You've been greeted from Rust!");
    await user.type(input, "Second");
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("Hello, Second! You've been greeted from Rust!")).toBeInTheDocument();
    });
    
    // Verify invoke was called twice
    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });

  it("handles invoke errors gracefully", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    
    render(<App />);
    
    // Mock invoke to reject
    mockInvoke.mockRejectedValue(new Error("Tauri command failed"));
    
    const input = screen.getByPlaceholderText("Enter a name...");
    const button = screen.getByRole("button", { name: /greet/i });
    
    await user.type(input, "Error Test");
    await user.click(button);
    
    // The app should handle the error gracefully
    await waitFor(() => {
      expect(screen.getByText("Failed to connect to the backend. Please ensure the app is running properly.")).toBeInTheDocument();
    });
    
    // Verify console.error was called
    expect(consoleError).toHaveBeenCalledWith("Failed to greet:", expect.any(Error));
    
    // The app should still be functional
    expect(screen.getByText("Welcome to EvorBrain!")).toBeInTheDocument();
    
    // Restore console.error
    consoleError.mockRestore();
  });
});