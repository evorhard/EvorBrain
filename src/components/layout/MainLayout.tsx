import { createSignal, type Component, type JSX } from 'solid-js';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import MobileSidebar from './MobileSidebar';

interface MainLayoutProps {
  children: JSX.Element;
}

const MainLayout: Component<MainLayoutProps> = (props) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = createSignal(false);

  return (
    <div class="bg-background flex h-screen">
      <Sidebar />
      <MobileSidebar isOpen={isMobileSidebarOpen()} onClose={() => setIsMobileSidebarOpen(false)} />
      <div class="flex flex-1 flex-col overflow-hidden">
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <ContentArea>{props.children}</ContentArea>
      </div>
    </div>
  );
};

export default MainLayout;
