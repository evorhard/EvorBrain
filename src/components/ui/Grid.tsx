import type { Component, JSX } from 'solid-js';
import { splitProps } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
      none: 'grid-cols-none',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      7: 'gap-7',
      8: 'gap-8',
      9: 'gap-9',
      10: 'gap-10',
      11: 'gap-11',
      12: 'gap-12',
      14: 'gap-14',
      16: 'gap-16',
      20: 'gap-20',
      24: 'gap-24',
    },
  },
  defaultVariants: {
    cols: 12,
    gap: 4,
  },
});

export interface GridProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid: Component<GridProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'cols', 'gap']);

  return (
    <div
      class={gridVariants({
        cols: local.cols,
        gap: local.gap,
        class: local.class,
      })}
      {...others}
    />
  );
};

const gridItemVariants = cva('', {
  variants: {
    span: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      7: 'col-span-7',
      8: 'col-span-8',
      9: 'col-span-9',
      10: 'col-span-10',
      11: 'col-span-11',
      12: 'col-span-12',
      auto: 'col-auto',
      full: 'col-span-full',
    },
    start: {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
      7: 'col-start-7',
      8: 'col-start-8',
      9: 'col-start-9',
      10: 'col-start-10',
      11: 'col-start-11',
      12: 'col-start-12',
      13: 'col-start-13',
      auto: 'col-start-auto',
    },
    end: {
      1: 'col-end-1',
      2: 'col-end-2',
      3: 'col-end-3',
      4: 'col-end-4',
      5: 'col-end-5',
      6: 'col-end-6',
      7: 'col-end-7',
      8: 'col-end-8',
      9: 'col-end-9',
      10: 'col-end-10',
      11: 'col-end-11',
      12: 'col-end-12',
      13: 'col-end-13',
      auto: 'col-end-auto',
    },
  },
});

export interface GridItemProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {}

const GridItem: Component<GridItemProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'span', 'start', 'end']);

  return (
    <div
      class={gridItemVariants({
        span: local.span,
        start: local.start,
        end: local.end,
        class: local.class,
      })}
      {...others}
    />
  );
};

export { Grid, GridItem, gridVariants, gridItemVariants };
