import type { Component, JSX } from 'solid-js';

interface ContentAreaProps {
  children: JSX.Element;
}

const ContentArea: Component<ContentAreaProps> = (props) => (
  <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto max-w-7xl px-4 py-6">{props.children}</div>
  </main>
);

export default ContentArea;
