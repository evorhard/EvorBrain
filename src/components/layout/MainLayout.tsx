import { Component, JSX, createSignal } from "solid-js";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ContentArea from "./ContentArea";
import MobileSidebar from "./MobileSidebar";

interface MainLayoutProps {
  children: JSX.Element;
}

const MainLayout: Component<MainLayoutProps> = (props) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = createSignal(false);

  return (
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <MobileSidebar 
        isOpen={isMobileSidebarOpen()} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div class="flex-1 flex flex-col overflow-hidden">
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <ContentArea>{props.children}</ContentArea>
      </div>
    </div>
  );
};

export default MainLayout;