import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders basic input', () => {
    render(() => <Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders input with label', () => {
    render(() => <Input label="Email Address" type="email" />);
    const label = screen.getByText('Email Address');
    const input = screen.getByLabelText('Email Address');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('applies default variant and size classes', () => {
    render(() => <Input />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('border-border');
    expect(input).toHaveClass('h-10');
  });

  it('applies custom size classes', () => {
    render(() => <Input size="sm" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('h-9');
    expect(input).toHaveClass('text-xs');
  });

  it('shows error state with error message', () => {
    render(() => <Input error="Email is required" />);
    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByText('Email is required');

    expect(input).toHaveClass('border-danger-500');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-danger-500');
  });

  it('shows helper text', () => {
    render(() => <Input helperText="Enter your email address" />);
    const helperText = screen.getByText('Enter your email address');

    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-content-secondary');
  });

  it('handles input changes', () => {
    const handleInput = vi.fn();
    render(() => <Input onInput={handleInput} />);

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'test@example.com' } });

    expect(handleInput).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(() => <Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');

    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('applies custom classes', () => {
    render(() => <Input class="custom-input-class" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('custom-input-class');
  });

  it('uses provided id or generates one', () => {
    const { unmount } = render(() => <Input id="custom-id" label="Test Label" />);
    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
    unmount();

    render(() => <Input label="Test Label" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id');
    expect(input.getAttribute('id')).toMatch(/^input-/);
  });

  it('associates error message with input via aria-describedby', () => {
    render(() => <Input error="Invalid input" />);
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const errorElement = document.getElementById(describedBy);
      expect(errorElement).toHaveTextContent('Invalid input');
    }
  });

  it('accepts all standard input attributes', () => {
    render(() => (
      <Input type="email" maxLength={20} minLength={8} required autoComplete="email" name="email" />
    ));

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('maxLength', '20');
    expect(input).toHaveAttribute('minLength', '8');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('autoComplete', 'email');
    expect(input).toHaveAttribute('name', 'email');
  });
});
