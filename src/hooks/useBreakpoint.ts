import { createSignal, onMount, onCleanup } from 'solid-js';

/**
 * Available breakpoint sizes matching Tailwind CSS breakpoints
 * @typedef {'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'} Breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Breakpoint pixel values
 * @constant
 */
const breakpoints: Record<Breakpoint, number> = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
};

/**
 * Hook for responsive design utilities and breakpoint detection
 * @returns An object containing:
 *   - currentBreakpoint: Signal<Breakpoint> - The current breakpoint
 *   - windowWidth: Signal<number> - The current window width
 *   - isAbove: (breakpoint: Breakpoint) => boolean - Check if viewport is above a breakpoint
 *   - isBelow: (breakpoint: Breakpoint) => boolean - Check if viewport is below a breakpoint
 *   - isBetween: (min: Breakpoint, max: Breakpoint) => boolean - Check if viewport is between breakpoints
 *   - isMobile: () => boolean - Check if viewport is mobile size (< md)
 *   - isTablet: () => boolean - Check if viewport is tablet size (md to lg)
 *   - isDesktop: () => boolean - Check if viewport is desktop size (>= lg)
 *   - isTouch: () => boolean - Check if device has touch capability
 *   - breakpoints: Record<Breakpoint, number> - Breakpoint pixel values
 * @example
 * ```typescript
 * const { isMobile, isAbove, currentBreakpoint } = useBreakpoint();
 * 
 * if (isMobile()) {
 *   // Mobile layout
 * }
 * 
 * if (isAbove('lg')) {
 *   // Large screen layout
 * }
 * ```
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = createSignal<Breakpoint>('xs');
  const [windowWidth, setWindowWidth] = createSignal(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  const getBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpoints['3xl']) return '3xl';
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const isAbove = (breakpoint: Breakpoint): boolean => windowWidth() >= breakpoints[breakpoint];

  const isBelow = (breakpoint: Breakpoint): boolean => windowWidth() < breakpoints[breakpoint];

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean =>
    windowWidth() >= breakpoints[min] && windowWidth() < breakpoints[max];

  const isMobile = (): boolean => windowWidth() < breakpoints.md;

  const isTablet = (): boolean => windowWidth() >= breakpoints.md && windowWidth() < breakpoints.lg;

  const isDesktop = (): boolean => windowWidth() >= breakpoints.lg;

  const isTouch = (): boolean => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches)
    );
  };

  onMount(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setCurrentBreakpoint(getBreakpoint(width));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
    });
  });

  return {
    currentBreakpoint,
    windowWidth,
    isAbove,
    isBelow,
    isBetween,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    breakpoints,
  };
}
