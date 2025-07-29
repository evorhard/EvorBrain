import { createSignal, onMount, onCleanup } from "solid-js";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const breakpoints: Record<Breakpoint, number> = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 1920,
};

export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = createSignal<Breakpoint>("xs");
  const [windowWidth, setWindowWidth] = createSignal(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  const getBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpoints["3xl"]) return "3xl";
    if (width >= breakpoints["2xl"]) return "2xl";
    if (width >= breakpoints.xl) return "xl";
    if (width >= breakpoints.lg) return "lg";
    if (width >= breakpoints.md) return "md";
    if (width >= breakpoints.sm) return "sm";
    return "xs";
  };

  const isAbove = (breakpoint: Breakpoint): boolean => {
    return windowWidth() >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint): boolean => {
    return windowWidth() < breakpoints[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return windowWidth() >= breakpoints[min] && windowWidth() < breakpoints[max];
  };

  const isMobile = (): boolean => {
    return windowWidth() < breakpoints.md;
  };

  const isTablet = (): boolean => {
    return windowWidth() >= breakpoints.md && windowWidth() < breakpoints.lg;
  };

  const isDesktop = (): boolean => {
    return windowWidth() >= breakpoints.lg;
  };

  const isTouch = (): boolean => {
    if (typeof window === "undefined") return false;
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches)
    );
  };

  onMount(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setCurrentBreakpoint(getBreakpoint(width));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
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