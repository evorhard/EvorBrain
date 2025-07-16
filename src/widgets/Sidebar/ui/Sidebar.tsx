/**
 * Sidebar Widget
 * 
 * Main navigation sidebar for the application
 */

import React from 'react';
import { cn } from '@/shared/lib';

export const Sidebar: React.FC = () => {
  return (
    <aside className={cn(
      'w-64 h-full bg-gray-50 border-r border-gray-200',
      'flex flex-col'
    )}>
      <div className="p-4">
        <h1 className="text-xl font-bold">EvorBrain</h1>
      </div>
      
      <nav className="flex-1 p-4">
        {/* Navigation items will go here */}
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-200">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/tasks" className="block px-3 py-2 rounded hover:bg-gray-200">
              Tasks
            </a>
          </li>
          <li>
            <a href="/calendar" className="block px-3 py-2 rounded hover:bg-gray-200">
              Calendar
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};