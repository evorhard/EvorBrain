import { createSignal, onMount } from 'solid-js';
import { api } from '../lib/api';
import { EntityType, ExportFormat } from '../types/repository';

export function RepositoryTest() {
  const [status, setStatus] = createSignal<string>('');
  const [stats, setStats] = createSignal<string>('');
  
  const runTests = async () => {
    setStatus('Running Repository command tests...');
    
    try {
      // Test 1: Check repository health
      setStatus('Test 1: Checking repository health...');
      const health = await api.repository.checkHealth();
      console.log('Health check:', health);
      
      // Test 2: Get database statistics
      setStatus('Test 2: Getting database statistics...');
      const dbStats = await api.repository.getStats();
      console.log('Database stats:', dbStats);
      setStats(JSON.stringify(dbStats, null, 2));
      
      // Test 3: Export data
      setStatus('Test 3: Exporting data...');
      const exportResult = await api.repository.exportData({
        include_archived: true,
        format: ExportFormat.Json,
      });
      console.log('Export result:', {
        item_count: exportResult.item_count,
        export_date: exportResult.export_date,
        data_keys: Object.keys(exportResult.data),
      });
      
      // Test 4: Cleanup database (dry run - don't actually delete)
      setStatus('Test 4: Testing cleanup (dry run)...');
      const cleanup = await api.repository.cleanup({
        vacuum_database: true,
        delete_archived_older_than_days: undefined, // Don't delete anything
      });
      console.log('Cleanup result:', cleanup);
      
      setStatus('All repository tests completed successfully! ✅');
    } catch (error) {
      console.error('Repository test failed:', error);
      setStatus(`Error: ${error}`);
    }
  };
  
  onMount(() => {
    runTests();
  });
  
  return (
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Repository Commands Test</h2>
      <div class="space-y-2">
        <p class="text-sm">Status: {status()}</p>
        {stats() && (
          <div class="mt-4">
            <h3 class="font-semibold mb-2">Database Statistics:</h3>
            <pre class="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
              {stats()}
            </pre>
          </div>
        )}
      </div>
      <button 
        onClick={runTests}
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Tests Again
      </button>
    </div>
  );
}