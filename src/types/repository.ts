// Repository command types

export interface TransactionResult {
  success: boolean;
  message: string;
  affected_rows?: number;
}

export enum EntityType {
  LifeArea = 'life_area',
  Goal = 'goal',
  Project = 'project',
  Task = 'task',
  Note = 'note',
}

export interface BatchDeleteRequest {
  entity_type: EntityType;
  ids: string[];
}

export interface DatabaseStats {
  life_areas_count: number;
  goals_count: number;
  projects_count: number;
  tasks_count: number;
  notes_count: number;
  archived_items_count: number;
}

export interface CleanupOptions {
  delete_archived_older_than_days?: number;
  vacuum_database: boolean;
}

export enum ExportFormat {
  Json = 'json',
  // Future: CSV = "csv", Markdown = "markdown"
}

export interface ExportRequest {
  include_archived: boolean;
  format: ExportFormat;
}

export interface ExportResult {
  data: Record<string, unknown>;
  item_count: number;
  export_date: string; // ISO 8601 datetime
}
