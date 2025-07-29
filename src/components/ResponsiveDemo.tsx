import { Component, Show } from "solid-js";
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { responsive } from "../utils/responsive";

const ResponsiveDemo: Component = () => {
  const {
    currentBreakpoint,
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
  } = useBreakpoint();

  return (
    <div class="min-h-screen bg-background">
      <Container class="py-4 sm:py-6 lg:py-8">
        <div class="space-y-6">
          {/* Breakpoint Info Card */}
          <Card class="bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800">
            <CardHeader>
              <CardTitle class="text-primary-700 dark:text-primary-300">
                Current Breakpoint Information
              </CardTitle>
              <CardDescription class="text-primary-600 dark:text-primary-400">
                Resize your browser to see responsive changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="text-center p-4 bg-surface rounded-lg">
                  <p class="text-sm text-content-secondary">Current Breakpoint</p>
                  <p class="text-2xl font-bold text-primary-500">{currentBreakpoint()}</p>
                </div>
                <div class="text-center p-4 bg-surface rounded-lg">
                  <p class="text-sm text-content-secondary">Window Width</p>
                  <p class="text-2xl font-bold text-content">{windowWidth()}px</p>
                </div>
                <div class="text-center p-4 bg-surface rounded-lg">
                  <p class="text-sm text-content-secondary">Device Type</p>
                  <p class="text-lg font-semibold text-content">
                    {isMobile() ? "Mobile" : isTablet() ? "Tablet" : "Desktop"}
                  </p>
                </div>
                <div class="text-center p-4 bg-surface rounded-lg">
                  <p class="text-sm text-content-secondary">Touch Device</p>
                  <p class="text-lg font-semibold text-content">{isTouch() ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Grid Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Grid System</CardTitle>
              <CardDescription>
                Grid adapts from 1 column on mobile to 4 columns on desktop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div class="bg-primary-100 dark:bg-primary-900 p-4 rounded-lg text-center">
                    <p class="text-primary-700 dark:text-primary-300 font-medium">Item {i}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Responsive Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Typography</CardTitle>
              <CardDescription>
                Text sizes scale appropriately across devices
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <h1 class={responsive.heading.h1}>Heading 1</h1>
              <h2 class={responsive.heading.h2}>Heading 2</h2>
              <h3 class={responsive.heading.h3}>Heading 3</h3>
              <p class={responsive.text.base}>
                This is body text that scales from base size on mobile to larger on desktop.
              </p>
              <p class={responsive.text.sm}>
                This is smaller text that also scales responsively.
              </p>
            </CardContent>
          </Card>

          {/* Responsive Spacing */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Spacing</CardTitle>
              <CardDescription>
                Padding and margins adjust based on screen size
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class={`bg-accent-100 dark:bg-accent-900 rounded ${responsive.padding.xs}`}>
                  <p class="text-accent-700 dark:text-accent-300">Extra Small Padding</p>
                </div>
                <div class={`bg-accent-100 dark:bg-accent-900 rounded ${responsive.padding.sm}`}>
                  <p class="text-accent-700 dark:text-accent-300">Small Padding</p>
                </div>
                <div class={`bg-accent-100 dark:bg-accent-900 rounded ${responsive.padding.md}`}>
                  <p class="text-accent-700 dark:text-accent-300">Medium Padding</p>
                </div>
                <div class={`bg-accent-100 dark:bg-accent-900 rounded ${responsive.padding.lg}`}>
                  <p class="text-accent-700 dark:text-accent-300">Large Padding</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visibility Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Visibility</CardTitle>
              <CardDescription>
                Elements show/hide based on screen size
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class={`p-4 bg-danger-100 dark:bg-danger-900 rounded ${responsive.display.mobileOnly}`}>
                <p class="text-danger-700 dark:text-danger-300 font-medium">
                  Mobile Only (Hidden on tablet and desktop)
                </p>
              </div>
              <div class={`p-4 bg-warning-100 dark:bg-warning-900 rounded ${responsive.display.tabletOnly}`}>
                <p class="text-warning-700 dark:text-warning-300 font-medium">
                  Tablet Only (Hidden on mobile and desktop)
                </p>
              </div>
              <div class={`p-4 bg-success-100 dark:bg-success-900 rounded ${responsive.display.desktopOnly}`}>
                <p class="text-success-700 dark:text-success-300 font-medium">
                  Desktop Only (Hidden on mobile and tablet)
                </p>
              </div>
              <div class="p-4 bg-primary-100 dark:bg-primary-900 rounded">
                <p class="text-primary-700 dark:text-primary-300 font-medium">
                  Always Visible
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Layout Example */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Layout Example</CardTitle>
              <CardDescription>
                Complex layout that adapts to different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="lg:col-span-2 space-y-4">
                  <div class="bg-surface-100 dark:bg-surface-200 p-4 rounded-lg">
                    <h4 class="font-semibold text-content mb-2">Main Content Area</h4>
                    <p class="text-content-secondary text-sm">
                      This area takes up 2/3 of the width on desktop and full width on mobile.
                    </p>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-surface-100 dark:bg-surface-200 p-4 rounded-lg">
                      <h5 class="font-medium text-content mb-1">Feature 1</h5>
                      <p class="text-content-secondary text-sm">Half width on tablet+</p>
                    </div>
                    <div class="bg-surface-100 dark:bg-surface-200 p-4 rounded-lg">
                      <h5 class="font-medium text-content mb-1">Feature 2</h5>
                      <p class="text-content-secondary text-sm">Half width on tablet+</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="bg-surface-100 dark:bg-surface-200 p-4 rounded-lg">
                    <h4 class="font-semibold text-content mb-2">Sidebar</h4>
                    <p class="text-content-secondary text-sm">
                      This sidebar moves below content on mobile and tablet.
                    </p>
                  </div>
                  <div class="bg-surface-100 dark:bg-surface-200 p-4 rounded-lg">
                    <h5 class="font-medium text-content mb-1">Widget</h5>
                    <p class="text-content-secondary text-sm">Additional information</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Utilities Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Breakpoint Reference</CardTitle>
              <CardDescription>
                Available breakpoints in the design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="text-left py-2 px-4 font-medium text-content">Breakpoint</th>
                      <th class="text-left py-2 px-4 font-medium text-content">Min Width</th>
                      <th class="text-left py-2 px-4 font-medium text-content">CSS Class</th>
                      <th class="text-left py-2 px-4 font-medium text-content">Devices</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-border">
                      <td class="py-2 px-4 text-content">xs</td>
                      <td class="py-2 px-4 text-content-secondary">475px</td>
                      <td class="py-2 px-4 font-mono text-xs bg-surface-100 dark:bg-surface-200 rounded">xs:</td>
                      <td class="py-2 px-4 text-content-secondary">Large phones</td>
                    </tr>
                    <tr class="border-b border-border">
                      <td class="py-2 px-4 text-content">sm</td>
                      <td class="py-2 px-4 text-content-secondary">640px</td>
                      <td class="py-2 px-4 font-mono text-xs bg-surface-100 dark:bg-surface-200 rounded">sm:</td>
                      <td class="py-2 px-4 text-content-secondary">Small tablets</td>
                    </tr>
                    <tr class="border-b border-border">
                      <td class="py-2 px-4 text-content">md</td>
                      <td class="py-2 px-4 text-content-secondary">768px</td>
                      <td class="py-2 px-4 font-mono text-xs bg-surface-100 dark:bg-surface-200 rounded">md:</td>
                      <td class="py-2 px-4 text-content-secondary">Tablets</td>
                    </tr>
                    <tr class="border-b border-border">
                      <td class="py-2 px-4 text-content">lg</td>
                      <td class="py-2 px-4 text-content-secondary">1024px</td>
                      <td class="py-2 px-4 font-mono text-xs bg-surface-100 dark:bg-surface-200 rounded">lg:</td>
                      <td class="py-2 px-4 text-content-secondary">Small laptops</td>
                    </tr>
                    <tr class="border-b border-border">
                      <td class="py-2 px-4 text-content">xl</td>
                      <td class="py-2 px-4 text-content-secondary">1280px</td>
                      <td class="py-2 px-4 font-mono text-xs bg-surface-100 dark:bg-surface-200 rounded">xl:</td>
                      <td class="py-2 px-4 text-content-secondary">Desktops</td>
                    </tr>
                    <tr class="border-b border-border">
                      <td class="py-2 px-4 text-content">2xl</td>
                      <td class="py-2 px-4 text-content-secondary">1536px</td>
                      <td class="py-2 px-4 font-mono text-xs bg-surface-100 dark:bg-surface-200 rounded">2xl:</td>
                      <td class="py-2 px-4 text-content-secondary">Large desktops</td>
                    </tr>
                    <tr>
                      <td class="py-2 px-4 text-content">3xl</td>
                      <td class="py-2 px-4 text-content-secondary">1920px</td>
                      <td class="py-2 px-4 font-mono text-xs bg-surface-100 dark:bg-surface-200 rounded">3xl:</td>
                      <td class="py-2 px-4 text-content-secondary">Full HD+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default ResponsiveDemo;