/**
 * Dashboard Page
 * 
 * Main dashboard view
 */

import type React from 'react';
import { LifeAreasList } from '@/features/life-areas';
import { GoalsList } from '@/features/goals';
import { useLifeAreasStore } from '@/features/life-areas/model/store';

export const DashboardPage: React.FC = () => {
  const selectedLifeAreaId = useLifeAreasStore(state => state.selectedLifeAreaId);
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome to EvorBrain!</h1>
      <p className="text-gray-600 mb-8">Your offline-first personal productivity system.</p>
      
      <div className="space-y-6">
        {/* Life Areas Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <LifeAreasList />
        </div>
        
        {/* Goals Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <GoalsList {...(selectedLifeAreaId && { lifeAreaId: selectedLifeAreaId })} />
        </div>
        
        {/* Future dashboard widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
            <p className="text-gray-500">Your projects will appear here once you create goals.</p>
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