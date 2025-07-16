/**
 * Project Model
 */

export interface Project {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  progress: number; // 0-100, calculated from tasks
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  goalId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}