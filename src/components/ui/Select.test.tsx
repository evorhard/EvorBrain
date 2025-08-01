import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { Select } from './Select';

describe('Select Component', () => {
  it('should render basic select element', () => {
    render(() => (
      <Select>
        <option value="">Choose an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
  });

  it('should have default value', () => {
    render(() => (
      <Select value="2">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('2');
  });

  it('should handle onChange event', () => {
    const handleChange = vi.fn();
    
    render(() => (
      <Select onChange={handleChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].target.value).toBe('2');
  });

  it('should apply custom classes', () => {
    render(() => (
      <Select class="custom-select">
        <option value="1">Option 1</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select');
  });

  it('should apply default styles', () => {
    render(() => (
      <Select>
        <option value="1">Option 1</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('h-10');
    expect(select).toHaveClass('w-full');
    expect(select).toHaveClass('rounded-md');
    expect(select).toHaveClass('border');
    expect(select).toHaveClass('border-border');
    expect(select).toHaveClass('bg-surface');
  });

  it('should support disabled state', () => {
    render(() => (
      <Select disabled>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:cursor-not-allowed');
    expect(select).toHaveClass('disabled:opacity-50');
  });

  it('should support required attribute', () => {
    render(() => (
      <Select required>
        <option value="">Choose...</option>
        <option value="1">Option 1</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('required');
  });

  it('should accept id attribute', () => {
    render(() => (
      <Select id="my-select">
        <option value="1">Option 1</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('id', 'my-select');
  });

  it('should handle multiple options', () => {
    render(() => (
      <Select>
        <option value="">Select...</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>
    ));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue('');
    expect(options[1]).toHaveValue('low');
    expect(options[2]).toHaveValue('medium');
    expect(options[3]).toHaveValue('high');
  });

  it('should focus when clicked', () => {
    render(() => (
      <Select>
        <option value="1">Option 1</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    expect(select).toHaveFocus();
  });

  it('should handle optgroup', () => {
    render(() => (
      <Select>
        <optgroup label="Group 1">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </optgroup>
        <optgroup label="Group 2">
          <option value="3">Option 3</option>
          <option value="4">Option 4</option>
        </optgroup>
      </Select>
    ));

    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute('label', 'Group 1');
    expect(groups[1]).toHaveAttribute('label', 'Group 2');
  });

  it('should merge custom styles with default styles', () => {
    render(() => (
      <Select class="text-red-500 font-bold">
        <option value="1">Option 1</option>
      </Select>
    ));

    const select = screen.getByRole('combobox');
    // Should have both default and custom classes
    expect(select).toHaveClass('h-10'); // default
    expect(select).toHaveClass('text-red-500'); // custom
    expect(select).toHaveClass('font-bold'); // custom
  });
});