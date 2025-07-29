import { Component, JSX } from "solid-js";

interface ContentAreaProps {
  children: JSX.Element;
}

const ContentArea: Component<ContentAreaProps> = (props) => {
  return (
    <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4 py-6 max-w-7xl">
        {props.children}
      </div>
    </main>
  );
};

export default ContentArea;