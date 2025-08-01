import { createSignal } from 'solid-js';
import { invoke } from '@tauri-apps/api/core';

export function MigrationTester() {
  const [status, setStatus] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await invoke<string>('get_migration_status');
      setStatus(result);
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runMigrations = async () => {
    setLoading(true);
    try {
      const result = await invoke<string>('run_migrations');
      setStatus(result);
      await checkStatus();
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const rollbackAll = async () => {
    setLoading(true);
    try {
      const result = await invoke<string>('rollback_migration', {
        targetVersion: 0,
      });
      setStatus(result);
      await checkStatus();
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const resetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database?')) return;

    setLoading(true);
    try {
      const result = await invoke<string>('reset_database');
      setStatus(result);
      await checkStatus();
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-4 p-4">
      <h2 class="text-xl font-bold">Migration Tester</h2>

      <div class="flex gap-2">
        <button
          onClick={checkStatus}
          disabled={loading()}
          class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Check Status
        </button>
        <button
          onClick={runMigrations}
          disabled={loading()}
          class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
        >
          Run Migrations
        </button>
        <button
          onClick={rollbackAll}
          disabled={loading()}
          class="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 disabled:opacity-50"
        >
          Rollback All
        </button>
        <button
          onClick={resetDatabase}
          disabled={loading()}
          class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
        >
          Reset Database
        </button>
      </div>

      {status() && (
        <pre class="overflow-auto rounded bg-gray-100 p-4 whitespace-pre-wrap">{status()}</pre>
      )}
    </div>
  );
}
