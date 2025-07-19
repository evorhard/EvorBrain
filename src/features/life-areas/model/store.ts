/**
 * Life Areas Store
 * 
 * State management for life areas
 */

import React from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { LifeArea, CreateLifeAreaDto } from '@/entities/life-area';
import { lifeAreasApi } from '../api';
import { toast } from '@/shared/ui/toast';
import { lifeAreasLogger } from '@/shared/lib/logger';

interface LifeAreasState {
  lifeAreas: Map<string, LifeArea>;
  selectedLifeAreaId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadLifeAreas: () => Promise<void>;
  createLifeArea: (dto: CreateLifeAreaDto) => Promise<LifeArea | null>;
  updateLifeArea: (id: string, updates: Partial<LifeArea>) => Promise<void>;
  deleteLifeArea: (id: string) => Promise<void>;
  selectLifeArea: (id: string | null) => void;
  reorderLifeAreas: (draggedId: string, targetId: string) => Promise<void>;
}

export const useLifeAreasStore = create<LifeAreasState>()(
  devtools(
    persist(
      immer((set, get) => ({
        lifeAreas: new Map(),
        selectedLifeAreaId: null,
        isLoading: false,
        error: null,

        loadLifeAreas: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const lifeAreas = await lifeAreasApi.getAll();
            set((state) => {
              state.lifeAreas = new Map(
                lifeAreas
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((la) => [la.id, la])
              );
              state.isLoading = false;
            });
          } catch (error) {
            lifeAreasLogger.error('Failed to load life areas:', error);
            set((state) => {
              state.error = 'Failed to load life areas';
              state.isLoading = false;
            });
            // Don't show toast in development - we're using mock data
            // In production, this would be a real error worth showing
            if (!import.meta.env.DEV) {
              toast.error('Failed to load life areas');
            }
          }
        },

        createLifeArea: async (dto) => {
          try {
            const lifeArea = await lifeAreasApi.create(dto);
            set((state) => {
              state.lifeAreas.set(lifeArea.id, lifeArea);
            });
            toast.success(`Life area "${lifeArea.name}" created`);
            return lifeArea;
          } catch (error) {
            lifeAreasLogger.error('Failed to create life area:', error);
            toast.error('Failed to create life area');
            return null;
          }
        },

        updateLifeArea: async (id, updates) => {
          const originalLifeArea = get().lifeAreas.get(id);
          if (!originalLifeArea) return;

          // Optimistic update
          set((state) => {
            const lifeArea = state.lifeAreas.get(id);
            if (lifeArea) {
              Object.assign(lifeArea, updates);
            }
          });

          try {
            const updatedLifeArea = await lifeAreasApi.update(id, updates);
            set((state) => {
              state.lifeAreas.set(id, updatedLifeArea);
            });
            toast.success('Life area updated');
          } catch (error) {
            // Revert optimistic update
            set((state) => {
              state.lifeAreas.set(id, originalLifeArea);
            });
            lifeAreasLogger.error('Failed to update life area:', error);
            toast.error('Failed to update life area');
          }
        },

        deleteLifeArea: async (id) => {
          const lifeArea = get().lifeAreas.get(id);
          if (!lifeArea) return;

          try {
            await lifeAreasApi.delete(id);
            set((state) => {
              state.lifeAreas.delete(id);
              if (state.selectedLifeAreaId === id) {
                state.selectedLifeAreaId = null;
              }
            });
            toast.success(`Life area "${lifeArea.name}" deleted`);
          } catch (error) {
            lifeAreasLogger.error('Failed to delete life area:', error);
            toast.error('Failed to delete life area');
          }
        },

        selectLifeArea: (id) => {
          set((state) => {
            state.selectedLifeAreaId = id;
          });
        },

        reorderLifeAreas: async (draggedId, targetId) => {
          const lifeAreasArray = Array.from(get().lifeAreas.values())
            .sort((a, b) => a.sortOrder - b.sortOrder);
          
          const draggedIndex = lifeAreasArray.findIndex(la => la.id === draggedId);
          const targetIndex = lifeAreasArray.findIndex(la => la.id === targetId);
          
          if (draggedIndex === -1 || targetIndex === -1) return;

          // Reorder array
          const [draggedItem] = lifeAreasArray.splice(draggedIndex, 1);
          if (draggedItem) {
            lifeAreasArray.splice(targetIndex, 0, draggedItem);
          }

          // Update sort orders
          const updates = lifeAreasArray.map((la, index) => ({
            id: la.id,
            sortOrder: index
          }));

          // Optimistic update
          set((state) => {
            updates.forEach(({ id, sortOrder }) => {
              const lifeArea = state.lifeAreas.get(id);
              if (lifeArea) {
                lifeArea.sortOrder = sortOrder;
              }
            });
          });

          try {
            // Update in backend
            await Promise.all(
              updates.map(({ id, sortOrder }) =>
                lifeAreasApi.updateOrder(id, sortOrder)
              )
            );
          } catch (error) {
            // Reload on error
            void get().loadLifeAreas();
            lifeAreasLogger.error('Failed to reorder life areas:', error);
            toast.error('Failed to reorder life areas');
          }
        }
      })),
      {
        name: 'life-areas-storage',
        partialize: (state) => ({ 
          selectedLifeAreaId: state.selectedLifeAreaId 
        }),
      }
    )
  )
);

// Hooks for common selectors
export const useLifeAreasList = (): LifeArea[] => {
  const lifeAreas = useLifeAreasStore((state) => state.lifeAreas);
  
  // Use React.useMemo to cache the sorted array
  return React.useMemo(() => {
    return Array.from(lifeAreas.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [lifeAreas]);
};

export const useSelectedLifeArea = (): LifeArea | null => {
  const lifeArea = useLifeAreasStore(
    (state) => state.selectedLifeAreaId 
      ? state.lifeAreas.get(state.selectedLifeAreaId) 
      : null
  );
  return lifeArea ?? null;
};