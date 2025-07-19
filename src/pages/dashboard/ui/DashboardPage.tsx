/**
 * Dashboard Page
 * 
 * Main dashboard view
 */

import type React from 'react';
import { LifeAreasList } from '@/features/life-areas';

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome to EvorBrain!</h1>
      <p className="text-gray-600 mb-8">Your offline-first personal productivity system.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Life Areas Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <LifeAreasList />
        </div>
        
        {/* Future dashboard widgets */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Goals</h2>
            <p className="text-gray-500">Goals will appear here once you create life areas.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
            <p className="text-gray-500">Your tasks for today will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};