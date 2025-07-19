/**
 * Goal Model
 */

export interface Goal {
  id: string;
  lifeAreaId: string;
  name: string;
  description?: string;
  targetDate?: Date | string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoalDto {
  lifeAreaId: string;
  name: string;
  description?: string;
  targetDate?: Date | string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
}