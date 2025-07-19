/**
 * Life Areas API
 * 
 * Tauri commands for life area management
 */

import { invokeCommand } from '@/shared/api';
import type { LifeArea, CreateLifeAreaDto } from '@/entities/life-area';

export const lifeAreasApi = {
  getAll: () => 
    invokeCommand<LifeArea[]>('get_life_areas'),
    
  getById: (id: string) => 
    invokeCommand<LifeArea>('get_life_area', { id }),
    
  create: (lifeArea: CreateLifeAreaDto) => 
    invokeCommand<LifeArea>('create_life_area', { dto: lifeArea }),
    
  update: (id: string, updates: Partial<LifeArea>) => 
    invokeCommand<LifeArea>('update_life_area', { id, dto: updates }),
    
  delete: (id: string) => 
    invokeCommand<void>('delete_life_area', { id }),
    
  updateOrder: (id: string, orderIndex: number) =>
    invokeCommand<LifeArea>('update_life_area', { id, dto: { orderIndex } })
};