import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { Label } from './Label';

describe('Label Component', () => {
  it('should render label with text', () => {
    render(() => <Label>Form Label</Label>);
    
    const label = screen.getByText('Form Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('should apply default styles', () => {
    render(() => <Label>Default Label</Label>);
    
    const label = screen.getByText('Default Label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
    expect(label).toHaveClass('leading-none');
    expect(label).toHaveClass('text-content');
  });

  it('should apply error styles when error prop is true', () => {
    render(() => <Label error>Error Label</Label>);
    
    const label = screen.getByText('Error Label');
    expect(label).toHaveClass('text-danger-500');
    expect(label).not.toHaveClass('text-content');
  });

  it('should apply custom classes', () => {
    render(() => <Label class="custom-class mb-4">Custom Label</Label>);
    
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-class');
    expect(label).toHaveClass('mb-4');
    // Should still have default classes
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });

  it('should support htmlFor attribute', () => {
    render(() => <Label for="input-id">Label for Input</Label>);
    
    const label = screen.getByText('Label for Input');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('should handle peer-disabled styles', () => {
    render(() => <Label>Peer Disabled Label</Label>);
    
    const label = screen.getByText('Peer Disabled Label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    expect(label).toHaveClass('peer-disabled:opacity-70');
  });

  it('should render with children elements', () => {
    render(() => (
      <Label>
        <span>Text</span>
        <span class="required">*</span>
      </Label>
    ));
    
    const label = screen.getByText((content, element) => element?.tagName === 'LABEL' && element.textContent === 'Text*');
    expect(label).toBeInTheDocument();
    expect(label.querySelector('span')).toBeInTheDocument();
    expect(label.querySelector('.required')).toBeInTheDocument();
  });

  it('should pass through other HTML attributes', () => {
    render(() => (
      <Label 
        id="custom-label"
        data-testid="label-test"
        title="Label title"
      >
        Attribute Test
      </Label>
    ));
    
    const label = screen.getByText('Attribute Test');
    expect(label).toHaveAttribute('id', 'custom-label');
    expect(label).toHaveAttribute('data-testid', 'label-test');
    expect(label).toHaveAttribute('title', 'Label title');
  });

  it('should handle click events', () => {
    let clicked = false;
    render(() => (
      <Label onClick={() => { clicked = true; }}>
        Clickable Label
      </Label>
    ));
    
    const label = screen.getByText('Clickable Label');
    label.click();
    expect(clicked).toBe(true);
  });

  it('should work with form inputs', () => {
    render(() => (
      <div>
        <Label for="test-input">Input Label</Label>
        <input id="test-input" type="text" />
      </div>
    ));
    
    const label = screen.getByText('Input Label');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('should toggle between error and default styles', () => {
    let isError = false;
    const { rerender } = render(() => <Label error={isError}>Dynamic Label</Label>);
    
    let label = screen.getByText('Dynamic Label');
    expect(label).toHaveClass('text-content');
    expect(label).not.toHaveClass('text-danger-500');
    
    isError = true;
    rerender(() => <Label error={isError}>Dynamic Label</Label>);
    
    label = screen.getByText('Dynamic Label');
    expect(label).toHaveClass('text-danger-500');
    expect(label).not.toHaveClass('text-content');
  });
});