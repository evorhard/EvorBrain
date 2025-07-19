/**
 * Main App Component
 * 
 * Root component with providers and routing
 */

import type React from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { DashboardPage } from '@/pages/dashboard';
import { ToastContainer } from '@/shared/ui';
import '../styles/App.css';

export const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white">
        {/* In the future, we'll add routing here */}
        <DashboardPage />
      </main>
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};