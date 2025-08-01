import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(() => <Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('applies default variant and size classes', () => {
    render(() => <Button>Default Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-500');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-4');
  });

  it('applies custom variant classes', () => {
    render(() => <Button variant="danger">Danger Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-danger-500');
    expect(button).toHaveClass('hover:bg-danger-600');
  });

  it('applies custom size classes', () => {
    render(() => <Button size="sm">Small Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('px-3');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Clickable</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(() => <Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('applies additional custom classes', () => {
    render(() => <Button class="custom-class">Custom Class Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders icon button with correct size', () => {
    render(() => (
      <Button size="icon" aria-label="Settings">
        ⚙️
      </Button>
    ));
    const button = screen.getByRole('button', { name: /settings/i });
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('w-10');
  });
});
