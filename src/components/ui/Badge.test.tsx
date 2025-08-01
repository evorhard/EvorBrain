/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Badge } from './Badge';

describe('Badge', () => {
  /**
   * Test default rendering and basic functionality
   */
  describe('Rendering', () => {
    it('should render with minimum props', () => {
      const { getByText } = render(() => <Badge>New</Badge>);
      expect(getByText('New')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      const { getByText } = render(() => <Badge>123</Badge>);
      const badge = getByText('123');
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('SPAN');
    });

    it('should apply default styles', () => {
      const { getByText } = render(() => <Badge>Default</Badge>);
      const badge = getByText('Default');
      expect(badge).toHaveClass('bg-surface-200', 'text-content-primary');
    });
  });

  /**
   * Test component props and their effects
   */
  describe('Props', () => {
    describe('variant', () => {
      it('should apply primary variant styles', () => {
        const { getByText } = render(() => <Badge variant="primary">Primary</Badge>);
        expect(getByText('Primary')).toHaveClass('bg-primary-500', 'text-white');
      });

      it('should apply success variant styles', () => {
        const { getByText } = render(() => <Badge variant="success">Success</Badge>);
        expect(getByText('Success')).toHaveClass('bg-green-500', 'text-white');
      });

      it('should apply warning variant styles', () => {
        const { getByText } = render(() => <Badge variant="warning">Warning</Badge>);
        expect(getByText('Warning')).toHaveClass('bg-yellow-500', 'text-white');
      });

      it('should apply danger variant styles', () => {
        const { getByText } = render(() => <Badge variant="danger">Danger</Badge>);
        expect(getByText('Danger')).toHaveClass('bg-red-500', 'text-white');
      });

      it('should apply info variant styles', () => {
        const { getByText } = render(() => <Badge variant="info">Info</Badge>);
        expect(getByText('Info')).toHaveClass('bg-blue-500', 'text-white');
      });
    });

    describe('size', () => {
      it('should apply small size styles', () => {
        const { getByText } = render(() => <Badge size="small">S</Badge>);
        expect(getByText('S')).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
      });

      it('should apply medium size styles by default', () => {
        const { getByText } = render(() => <Badge>M</Badge>);
        expect(getByText('M')).toHaveClass('px-2', 'py-0.5', 'text-xs');
      });

      it('should apply large size styles', () => {
        const { getByText } = render(() => <Badge size="large">L</Badge>);
        expect(getByText('L')).toHaveClass('px-2.5', 'py-1', 'text-sm');
      });
    });

    describe('dot', () => {
      it('should render as dot indicator when dot prop is true', () => {
        const { container } = render(() => <Badge dot>Hidden</Badge>);
        const badge = container.querySelector('span');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('w-2.5', 'h-2.5');
        expect(badge).not.toHaveTextContent('Hidden');
      });

      it('should apply correct dot size for small', () => {
        const { container } = render(() => (
          <Badge dot size="small">
            Text
          </Badge>
        ));
        const badge = container.querySelector('span');
        expect(badge).toHaveClass('w-2', 'h-2');
      });

      it('should apply correct dot size for large', () => {
        const { container } = render(() => (
          <Badge dot size="large">
            Text
          </Badge>
        ));
        const badge = container.querySelector('span');
        expect(badge).toHaveClass('w-3', 'h-3');
      });
    });

    describe('outline', () => {
      it('should apply outline styles for default variant', () => {
        const { getByText } = render(() => <Badge outline>Outline</Badge>);
        expect(getByText('Outline')).toHaveClass(
          'border',
          'border-surface-300',
          'text-content-primary',
          'bg-surface-50',
        );
      });

      it('should apply outline styles for primary variant', () => {
        const { getByText } = render(() => (
          <Badge variant="primary" outline>
            Primary Outline
          </Badge>
        ));
        expect(getByText('Primary Outline')).toHaveClass(
          'border',
          'border-primary-500',
          'text-primary-600',
          'bg-primary-50',
        );
      });
    });

    describe('rounded', () => {
      it('should have rounded corners by default', () => {
        const { getByText } = render(() => <Badge>Rounded</Badge>);
        expect(getByText('Rounded')).toHaveClass('rounded-full');
      });

      it('should have square corners when rounded is false', () => {
        const { getByText } = render(() => <Badge rounded={false}>Square</Badge>);
        expect(getByText('Square')).toHaveClass('rounded');
        expect(getByText('Square')).not.toHaveClass('rounded-full');
      });
    });

    describe('class', () => {
      it('should apply custom CSS classes', () => {
        const { getByText } = render(() => <Badge class="custom-class ml-2">Custom</Badge>);
        expect(getByText('Custom')).toHaveClass('custom-class', 'ml-2');
      });
    });
  });

  /**
   * Test accessibility requirements
   */
  describe('Accessibility', () => {
    it('should render as a span element', () => {
      const { getByText } = render(() => <Badge>Accessible</Badge>);
      expect(getByText('Accessible').tagName).toBe('SPAN');
    });

    it('should support aria-label', () => {
      const { container } = render(() => (
        <Badge dot aria-label="User is online">
          Status
        </Badge>
      ));
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('aria-label', 'User is online');
    });

    it('should pass through additional aria attributes', () => {
      const { getByText } = render(() => <Badge aria-describedby="description">Described</Badge>);
      expect(getByText('Described')).toHaveAttribute('aria-describedby', 'description');
    });
  });

  /**
   * Test edge cases and complex scenarios
   */
  describe('Edge Cases', () => {
    it('should handle numeric children', () => {
      const { getByText } = render(() => <Badge>{42}</Badge>);
      expect(getByText('42')).toBeInTheDocument();
    });

    it('should handle JSX children', () => {
      const { container } = render(() => (
        <Badge>
          <span class="icon">→</span>
          <span>Next</span>
        </Badge>
      ));
      expect(container.querySelector('.icon')).toBeInTheDocument();
      expect(container).toHaveTextContent('→Next');
    });

    it('should combine multiple style modifiers correctly', () => {
      const { getByText } = render(() => (
        <Badge variant="danger" size="large" outline rounded={false} class="absolute">
          Complex
        </Badge>
      ));
      const badge = getByText('Complex');
      expect(badge).toHaveClass(
        'border',
        'border-red-500',
        'text-red-700',
        'bg-red-50',
        'px-2.5',
        'py-1',
        'text-sm',
        'rounded',
        'absolute',
      );
    });
  });
});
