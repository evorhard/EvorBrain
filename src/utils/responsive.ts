// Responsive utility classes for common patterns

export const responsive = {
  // Padding utilities
  padding: {
    none: 'p-0',
    xs: 'p-2 sm:p-3 md:p-4',
    sm: 'p-3 sm:p-4 md:p-5',
    md: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8',
    xl: 'p-6 sm:p-8 md:p-10',
  },

  // Margin utilities
  margin: {
    none: 'm-0',
    xs: 'm-2 sm:m-3 md:m-4',
    sm: 'm-3 sm:m-4 md:m-5',
    md: 'm-4 sm:m-5 md:m-6',
    lg: 'm-5 sm:m-6 md:m-8',
    xl: 'm-6 sm:m-8 md:m-10',
  },

  // Gap utilities
  gap: {
    none: 'gap-0',
    xs: 'gap-2 sm:gap-3 md:gap-4',
    sm: 'gap-3 sm:gap-4 md:gap-5',
    md: 'gap-4 sm:gap-5 md:gap-6',
    lg: 'gap-5 sm:gap-6 md:gap-8',
    xl: 'gap-6 sm:gap-8 md:gap-10',
  },

  // Text size utilities
  text: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl md:text-2xl',
    xl: 'text-xl sm:text-2xl md:text-3xl',
    '2xl': 'text-2xl sm:text-3xl md:text-4xl',
    '3xl': 'text-3xl sm:text-4xl md:text-5xl',
    '4xl': 'text-4xl sm:text-5xl md:text-6xl',
  },

  // Heading utilities
  heading: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl font-medium',
    h5: 'text-sm sm:text-base md:text-lg font-medium',
    h6: 'text-sm sm:text-base font-medium',
  },

  // Container widths
  container: {
    xs: 'max-w-xs mx-auto px-4',
    sm: 'max-w-sm mx-auto px-4',
    md: 'max-w-md mx-auto px-4',
    lg: 'max-w-lg mx-auto px-4',
    xl: 'max-w-xl mx-auto px-4',
    '2xl': 'max-w-2xl mx-auto px-4',
    '3xl': 'max-w-3xl mx-auto px-4',
    '4xl': 'max-w-4xl mx-auto px-4',
    '5xl': 'max-w-5xl mx-auto px-4',
    '6xl': 'max-w-6xl mx-auto px-4',
    '7xl': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full px-4 sm:px-6 lg:px-8',
  },

  // Grid columns
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    cols5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    cols6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    cols12: 'grid-cols-4 sm:grid-cols-8 lg:grid-cols-12',
  },

  // Flex layouts
  flex: {
    row: 'flex flex-row',
    col: 'flex flex-col',
    wrap: 'flex flex-wrap',
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    around: 'flex items-center justify-around',
    evenly: 'flex items-center justify-evenly',
    start: 'flex items-start',
    end: 'flex items-end',
  },

  // Display utilities
  display: {
    hiddenMobile: 'hidden sm:block',
    hiddenTablet: 'hidden md:block',
    hiddenDesktop: 'hidden lg:block',
    mobileOnly: 'block sm:hidden',
    tabletOnly: 'hidden sm:block md:hidden',
    desktopOnly: 'hidden lg:block',
  },

  // Aspect ratios
  aspect: {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  },
};

// Helper function to combine responsive classes
export function clx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
