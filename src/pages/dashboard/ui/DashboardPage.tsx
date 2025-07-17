/**
 * Dashboard Page
 * 
 * Main dashboard view
 */

import { useState, type FormEvent } from 'react';
import type React from 'react';
import { invoke } from '@tauri-apps/api/core';

export const DashboardPage: React.FC = () => {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet(): Promise<void> {
    try {
      const message = await invoke<string>("greet", { name });
      setGreetMsg(message);
    } catch (error) {
      console.error("Failed to greet:", error);
      setGreetMsg("Failed to connect to the backend. Please ensure the app is running properly.");
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void greet();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome to EvorBrain!</h1>
      <p className="text-gray-600 mb-8">Your offline-first personal productivity system.</p>
      
      {/* Greeting Section */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Try the Greeting Feature</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            id="greet-input"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
            value={name}
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Greet
          </button>
        </form>
        
        {greetMsg && (
          <p className="mt-4 text-center text-gray-700 bg-gray-100 p-3 rounded-md">
            {greetMsg}
          </p>
        )}
      </div>

      {/* Database Test Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Database Test</h2>
        <button
          onClick={async () => {
            try {
              const result = await invoke<string>("test_database");
              alert(result);
            } catch (error) {
              alert(`Database test failed: ${error}`);
            }
          }}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          Test Database Connection
        </button>
      </div>
      
      {/* Future dashboard widgets will be added here */}
      <div className="mt-8 text-gray-500">
        <p>More dashboard features coming soon...</p>
      </div>
    </div>
  );
};