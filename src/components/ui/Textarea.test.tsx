import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { Textarea } from './Textarea';

describe('Textarea Component', () => {
  it('should render basic textarea', () => {
    render(() => <Textarea placeholder="Enter text" />);

    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should render textarea with label', () => {
    render(() => <Textarea label="Description" placeholder="Enter description" />);

    const label = screen.getByText('Description');
    const textarea = screen.getByLabelText('Description');

    expect(label).toBeInTheDocument();
    expect(textarea).toBeInTheDocument();
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('should apply default styles', () => {
    render(() => <Textarea />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('min-h-[80px]');
    expect(textarea).toHaveClass('border-border');
    expect(textarea).toHaveClass('bg-surface');
    expect(textarea).toHaveClass('resize-none');
  });

  it('should show error state with error message', () => {
    render(() => <Textarea error="This field is required" />);

    const textarea = screen.getByRole('textbox');
    const errorMessage = screen.getByText('This field is required');

    expect(textarea).toHaveClass('border-danger-500');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-danger-500');
  });

  it('should show helper text', () => {
    render(() => <Textarea helperText="Maximum 500 characters" />);

    const helperText = screen.getByText('Maximum 500 characters');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-content-secondary');
  });

  it('should prioritize error over helper text', () => {
    render(() => <Textarea error="Error message" helperText="Helper text" />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('should handle input events', () => {
    const handleInput = vi.fn();
    render(() => <Textarea onInput={handleInput} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.input(textarea, { target: { value: 'New text' } });

    expect(handleInput).toHaveBeenCalled();
  });

  it('should support custom rows', () => {
    render(() => <Textarea rows={5} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('should be disabled when disabled prop is true', () => {
    render(() => <Textarea disabled placeholder="Disabled textarea" />);

    const textarea = screen.getByPlaceholderText('Disabled textarea');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:cursor-not-allowed');
    expect(textarea).toHaveClass('disabled:opacity-50');
  });

  it('should apply custom classes', () => {
    render(() => <Textarea class="custom-class h-32" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
    expect(textarea).toHaveClass('h-32');
  });

  it('should use provided id or generate one', () => {
    const { unmount } = render(() => <Textarea id="custom-id" label="Test" />);
    let textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id', 'custom-id');
    unmount();

    render(() => <Textarea label="Test" />);
    textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id');
    expect(textarea.getAttribute('id')).toMatch(/^textarea-/);
  });

  it('should associate error/helper text with textarea via aria-describedby', () => {
    render(() => <Textarea error="Error text" />);

    const textarea = screen.getByRole('textbox');
    const describedBy = textarea.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const errorElement = document.getElementById(describedBy);
      expect(errorElement).toHaveTextContent('Error text');
    }
  });

  it('should accept standard textarea attributes', () => {
    render(() => (
      <Textarea
        maxLength={500}
        minLength={10}
        required
        readOnly
        name="description"
        value="Initial value"
      />
    ));

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxLength', '500');
    expect(textarea).toHaveAttribute('minLength', '10');
    expect(textarea).toHaveAttribute('required');
    expect(textarea).toHaveAttribute('readOnly');
    expect(textarea).toHaveAttribute('name', 'description');
    expect(textarea.value).toBe('Initial value');
  });

  it('should handle onChange event', () => {
    const handleChange = vi.fn();
    render(() => <Textarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Changed text' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should support controlled value', () => {
    let value = 'Initial';
    const setValue = (newValue: string) => {
      value = newValue;
    };

    const { rerender } = render(() => (
      <Textarea value={value} onInput={(e) => setValue(e.currentTarget.value)} />
    ));

    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe('Initial');

    fireEvent.input(textarea, { target: { value: 'Updated' } });
    value = 'Updated';
    rerender(() => <Textarea value={value} onInput={(e) => setValue(e.currentTarget.value)} />);

    expect(textarea.value).toBe('Updated');
  });

  it('should have proper hover styles', () => {
    render(() => <Textarea />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('hover:border-border-strong');
  });

  it('should apply error variant hover styles', () => {
    render(() => <Textarea error="Error" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('hover:border-danger-600');
  });
});
