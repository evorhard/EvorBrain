import { createSignal, onMount, onCleanup, type ParentComponent } from 'solid-js';
import { Card } from './Card';
import { Button } from './Button';

interface ErrorBoundaryProps {
  fallback?: (error: Error, reset: () => void) => unknown;
  onError?: (error: Error) => void;
}

export const ErrorBoundary: ParentComponent<ErrorBoundaryProps> = (props) => {
  const [error, setError] = createSignal<Error | null>(null);

  const reset = () => {
    setError(null);
  };

  // Handle errors in effects and async operations
  const handleError = (error: Error) => {
    console.error('[ErrorBoundary] Caught error:', error);
    setError(error);
    props.onError?.(error);
  };

  onMount(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(`Unhandled promise rejection: ${event.reason}`));
    };

    // Global error handler for JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(new Error(`Global error: ${event.message}`));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    onCleanup(() => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    });
  });

  return (
    <>
      {error() ? (
        props.fallback ? (
          <>{props.fallback(error()!, reset)}</>
        ) : (
          <Card class="border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <svg
                  class="h-5 w-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">
                  Something went wrong
                </h3>
              </div>
              <p class="text-red-700 dark:text-red-300">{error()!.message}</p>
              <div class="flex gap-2">
                <Button variant="secondary" size="sm" onClick={reset}>
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.error('Full error details:', error());
                  }}
                >
                  Log Details
                </Button>
              </div>
            </div>
          </Card>
        )
      ) : (
        props.children
      )}
    </>
  );
};
