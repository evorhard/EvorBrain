import { Component, For } from 'solid-js';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { responsive } from '../utils/responsive';

const ResponsiveDemo: Component = () => {
  const { currentBreakpoint, windowWidth, isMobile, isTablet, isTouch } = useBreakpoint();

  return (
    <div class="bg-background min-h-screen">
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
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div class="bg-surface rounded-lg p-4 text-center">
                  <p class="text-content-secondary text-sm">Current Breakpoint</p>
                  <p class="text-primary-500 text-2xl font-bold">{currentBreakpoint()}</p>
                </div>
                <div class="bg-surface rounded-lg p-4 text-center">
                  <p class="text-content-secondary text-sm">Window Width</p>
                  <p class="text-content text-2xl font-bold">{windowWidth()}px</p>
                </div>
                <div class="bg-surface rounded-lg p-4 text-center">
                  <p class="text-content-secondary text-sm">Device Type</p>
                  <p class="text-content text-lg font-semibold">
                    {isMobile() ? 'Mobile' : (isTablet() ? 'Tablet' : 'Desktop')}
                  </p>
                </div>
                <div class="bg-surface rounded-lg p-4 text-center">
                  <p class="text-content-secondary text-sm">Touch Device</p>
                  <p class="text-content text-lg font-semibold">{isTouch() ? 'Yes' : 'No'}</p>
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
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <For each={[1, 2, 3, 4, 5, 6, 7, 8]}>
                  {(i) => (
                    <div class="bg-primary-100 dark:bg-primary-900 rounded-lg p-4 text-center">
                      <p class="text-primary-700 dark:text-primary-300 font-medium">Item {i}</p>
                    </div>
                  )}
                </For>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Typography</CardTitle>
              <CardDescription>Text sizes scale appropriately across devices</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <h1 class={responsive.heading.h1}>Heading 1</h1>
              <h2 class={responsive.heading.h2}>Heading 2</h2>
              <h3 class={responsive.heading.h3}>Heading 3</h3>
              <p class={responsive.text.base}>
                This is body text that scales from base size on mobile to larger on desktop.
              </p>
              <p class={responsive.text.sm}>This is smaller text that also scales responsively.</p>
            </CardContent>
          </Card>

          {/* Responsive Spacing */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Spacing</CardTitle>
              <CardDescription>Padding and margins adjust based on screen size</CardDescription>
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
              <CardDescription>Elements show/hide based on screen size</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div
                class={`bg-danger-100 dark:bg-danger-900 rounded p-4 ${responsive.display.mobileOnly}`}
              >
                <p class="text-danger-700 dark:text-danger-300 font-medium">
                  Mobile Only (Hidden on tablet and desktop)
                </p>
              </div>
              <div
                class={`bg-warning-100 dark:bg-warning-900 rounded p-4 ${responsive.display.tabletOnly}`}
              >
                <p class="text-warning-700 dark:text-warning-300 font-medium">
                  Tablet Only (Hidden on mobile and desktop)
                </p>
              </div>
              <div
                class={`bg-success-100 dark:bg-success-900 rounded p-4 ${responsive.display.desktopOnly}`}
              >
                <p class="text-success-700 dark:text-success-300 font-medium">
                  Desktop Only (Hidden on mobile and tablet)
                </p>
              </div>
              <div class="bg-primary-100 dark:bg-primary-900 rounded p-4">
                <p class="text-primary-700 dark:text-primary-300 font-medium">Always Visible</p>
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
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="space-y-4 lg:col-span-2">
                  <div class="bg-surface-100 dark:bg-surface-200 rounded-lg p-4">
                    <h4 class="text-content mb-2 font-semibold">Main Content Area</h4>
                    <p class="text-content-secondary text-sm">
                      This area takes up 2/3 of the width on desktop and full width on mobile.
                    </p>
                  </div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="bg-surface-100 dark:bg-surface-200 rounded-lg p-4">
                      <h5 class="text-content mb-1 font-medium">Feature 1</h5>
                      <p class="text-content-secondary text-sm">Half width on tablet+</p>
                    </div>
                    <div class="bg-surface-100 dark:bg-surface-200 rounded-lg p-4">
                      <h5 class="text-content mb-1 font-medium">Feature 2</h5>
                      <p class="text-content-secondary text-sm">Half width on tablet+</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="bg-surface-100 dark:bg-surface-200 rounded-lg p-4">
                    <h4 class="text-content mb-2 font-semibold">Sidebar</h4>
                    <p class="text-content-secondary text-sm">
                      This sidebar moves below content on mobile and tablet.
                    </p>
                  </div>
                  <div class="bg-surface-100 dark:bg-surface-200 rounded-lg p-4">
                    <h5 class="text-content mb-1 font-medium">Widget</h5>
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
              <CardDescription>Available breakpoints in the design system</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-border border-b">
                      <th class="text-content px-4 py-2 text-left font-medium">Breakpoint</th>
                      <th class="text-content px-4 py-2 text-left font-medium">Min Width</th>
                      <th class="text-content px-4 py-2 text-left font-medium">CSS Class</th>
                      <th class="text-content px-4 py-2 text-left font-medium">Devices</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-border border-b">
                      <td class="text-content px-4 py-2">xs</td>
                      <td class="text-content-secondary px-4 py-2">475px</td>
                      <td class="bg-surface-100 dark:bg-surface-200 rounded px-4 py-2 font-mono text-xs">
                        xs:
                      </td>
                      <td class="text-content-secondary px-4 py-2">Large phones</td>
                    </tr>
                    <tr class="border-border border-b">
                      <td class="text-content px-4 py-2">sm</td>
                      <td class="text-content-secondary px-4 py-2">640px</td>
                      <td class="bg-surface-100 dark:bg-surface-200 rounded px-4 py-2 font-mono text-xs">
                        sm:
                      </td>
                      <td class="text-content-secondary px-4 py-2">Small tablets</td>
                    </tr>
                    <tr class="border-border border-b">
                      <td class="text-content px-4 py-2">md</td>
                      <td class="text-content-secondary px-4 py-2">768px</td>
                      <td class="bg-surface-100 dark:bg-surface-200 rounded px-4 py-2 font-mono text-xs">
                        md:
                      </td>
                      <td class="text-content-secondary px-4 py-2">Tablets</td>
                    </tr>
                    <tr class="border-border border-b">
                      <td class="text-content px-4 py-2">lg</td>
                      <td class="text-content-secondary px-4 py-2">1024px</td>
                      <td class="bg-surface-100 dark:bg-surface-200 rounded px-4 py-2 font-mono text-xs">
                        lg:
                      </td>
                      <td class="text-content-secondary px-4 py-2">Small laptops</td>
                    </tr>
                    <tr class="border-border border-b">
                      <td class="text-content px-4 py-2">xl</td>
                      <td class="text-content-secondary px-4 py-2">1280px</td>
                      <td class="bg-surface-100 dark:bg-surface-200 rounded px-4 py-2 font-mono text-xs">
                        xl:
                      </td>
                      <td class="text-content-secondary px-4 py-2">Desktops</td>
                    </tr>
                    <tr class="border-border border-b">
                      <td class="text-content px-4 py-2">2xl</td>
                      <td class="text-content-secondary px-4 py-2">1536px</td>
                      <td class="bg-surface-100 dark:bg-surface-200 rounded px-4 py-2 font-mono text-xs">
                        2xl:
                      </td>
                      <td class="text-content-secondary px-4 py-2">Large desktops</td>
                    </tr>
                    <tr>
                      <td class="text-content px-4 py-2">3xl</td>
                      <td class="text-content-secondary px-4 py-2">1920px</td>
                      <td class="bg-surface-100 dark:bg-surface-200 rounded px-4 py-2 font-mono text-xs">
                        3xl:
                      </td>
                      <td class="text-content-secondary px-4 py-2">Full HD+</td>
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
