import { createSignal, onMount } from 'solid-js';
import { api } from '../lib/api';
import { EvorBrainError, ErrorCode } from '../types/errors';

export function LifeAreaTest() {
  const [status, setStatus] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');
  const [testLifeAreaId, setTestLifeAreaId] = createSignal<string | null>(null);

  const runTests = async () => {
    setStatus('Running Life Area CRUD tests...');
    setError('');
    
    try {
      // Test 1: Create Life Area
      setStatus('Test 1: Creating life area...');
      const created = await api.lifeArea.create({
        name: 'Test Life Area',
        description: 'This is a test life area',
        color: '#FF5733',
        icon: '🎯',
      });
      setTestLifeAreaId(created.id);
      console.log('Created:', created);
      
      // Test 2: Get All Life Areas
      setStatus('Test 2: Getting all life areas...');
      const allAreas = await api.lifeArea.getAll();
      console.log('All areas:', allAreas);
      
      // Test 3: Get Single Life Area
      setStatus('Test 3: Getting single life area...');
      const single = await api.lifeArea.get(created.id);
      console.log('Single area:', single);
      
      // Test 4: Update Life Area
      setStatus('Test 4: Updating life area...');
      const updated = await api.lifeArea.update({
        id: created.id,
        name: 'Updated Life Area',
        description: 'This description has been updated',
        color: '#3498DB',
        icon: '✅',
      });
      console.log('Updated:', updated);
      
      // Test 5: Delete (Archive) Life Area
      setStatus('Test 5: Deleting life area...');
      await api.lifeArea.delete(created.id);
      console.log('Deleted successfully');
      
      // Test 6: Try to get deleted life area (should still work but show archived)
      setStatus('Test 6: Getting deleted life area...');
      const archived = await api.lifeArea.get(created.id);
      console.log('Archived area:', archived);
      
      // Test 7: Restore Life Area
      setStatus('Test 7: Restoring life area...');
      const restored = await api.lifeArea.restore(created.id);
      console.log('Restored:', restored);
      
      // Test 8: Error handling - Invalid ID
      setStatus('Test 8: Testing error handling...');
      try {
        await api.lifeArea.get('invalid-uuid');
      } catch (e) {
        if (e instanceof EvorBrainError) {
          console.log('Expected error:', e.code, e.message);
        }
      }
      
      // Clean up
      await api.lifeArea.delete(created.id);
      
      setStatus('All tests completed successfully! ✅');
    } catch (e) {
      console.error('Test failed:', e);
      if (e instanceof EvorBrainError) {
        setError(`Error: ${e.code} - ${e.message}`);
      } else {
        setError(`Unknown error: ${e}`);
      }
    }
  };

  onMount(() => {
    runTests();
  });

  return (
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Life Area CRUD Test</h2>
      <div class="space-y-2">
        <p class="text-sm">Status: {status()}</p>
        {error() && (
          <p class="text-sm text-red-500">Error: {error()}</p>
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