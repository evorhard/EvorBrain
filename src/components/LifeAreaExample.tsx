import { createSignal, For, Show, onMount } from 'solid-js';
import { api, ApiError } from '../lib/api';
import type { LifeArea } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

export function LifeAreaExample() {
  const [lifeAreas, setLifeAreas] = createSignal<LifeArea[]>([]);
  const [newAreaName, setNewAreaName] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Load life areas on mount
  onMount(async () => {
    await loadLifeAreas();
  });

  const loadLifeAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const areas = await api.lifeArea.getAll();
      setLifeAreas(areas);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load life areas');
    } finally {
      setLoading(false);
    }
  };

  const createLifeArea = async () => {
    const name = newAreaName().trim();
    if (!name) return;

    try {
      setLoading(true);
      setError(null);
      const newArea = await api.lifeArea.create({ name });
      setLifeAreas([newArea, ...lifeAreas()]);
      setNewAreaName('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create life area');
    } finally {
      setLoading(false);
    }
  };

  const deleteLifeArea = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.lifeArea.delete(id);
      setLifeAreas(lifeAreas().filter(area => area.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete life area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-foreground">Life Areas Example</h2>
      
      <Show when={error()}>
        <div class="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded">
          {error()}
        </div>
      </Show>

      <Card class="p-4">
        <div class="flex gap-2">
          <Input
            type="text"
            placeholder="Enter life area name..."
            value={newAreaName()}
            onInput={(e) => setNewAreaName(e.currentTarget.value)}
            onKeyPress={(e) => e.key === 'Enter' && createLifeArea()}
            disabled={loading()}
          />
          <Button 
            onClick={createLifeArea} 
            disabled={loading() || !newAreaName().trim()}
          >
            Add Area
          </Button>
        </div>
      </Card>

      <div class="space-y-2">
        <Show when={loading() && lifeAreas().length === 0}>
          <p class="text-muted-foreground">Loading life areas...</p>
        </Show>
        
        <Show when={!loading() && lifeAreas().length === 0}>
          <p class="text-muted-foreground">No life areas yet. Create your first one!</p>
        </Show>

        <For each={lifeAreas()}>
          {(area) => (
            <Card class="p-4 flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-foreground">{area.name}</h3>
                <Show when={area.description}>
                  <p class="text-sm text-muted-foreground">{area.description}</p>
                </Show>
                <p class="text-xs text-muted-foreground mt-1">
                  Created: {new Date(area.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => deleteLifeArea(area.id)}
                disabled={loading()}
              >
                Archive
              </Button>
            </Card>
          )}
        </For>
      </div>
    </div>
  );
}