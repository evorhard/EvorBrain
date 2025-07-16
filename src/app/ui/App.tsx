/**
 * Main App Component
 * 
 * Root component with providers and routing
 */

import React from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { DashboardPage } from '@/pages/dashboard';
import '../styles/App.css';

export const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* In the future, we'll add routing here */}
        <DashboardPage />
      </main>
    </div>
  );
};