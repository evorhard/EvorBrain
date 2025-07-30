import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

export function MigrationTester() {
  const [status, setStatus] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await invoke<string>("get_migration_status");
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
      const result = await invoke<string>("run_migrations");
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
      const result = await invoke<string>("rollback_migration", {
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
    if (!confirm("Are you sure you want to reset the database?")) return;
    
    setLoading(true);
    try {
      const result = await invoke<string>("reset_database");
      setStatus(result);
      await checkStatus();
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">Migration Tester</h2>
      
      <div class="flex gap-2">
        <button
          onClick={checkStatus}
          disabled={loading()}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Check Status
        </button>
        <button
          onClick={runMigrations}
          disabled={loading()}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Run Migrations
        </button>
        <button
          onClick={rollbackAll}
          disabled={loading()}
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Rollback All
        </button>
        <button
          onClick={resetDatabase}
          disabled={loading()}
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Reset Database
        </button>
      </div>

      {status() && (
        <pre class="p-4 bg-gray-100 rounded overflow-auto whitespace-pre-wrap">
          {status()}
        </pre>
      )}
    </div>
  );
}