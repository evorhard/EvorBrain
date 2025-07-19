/**
 * Life Area Model
 */

export interface LifeArea {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color code
  icon?: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLifeAreaDto {
  name: string;
  description?: string;
  color: string;
  icon?: string;
}