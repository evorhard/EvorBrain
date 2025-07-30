-- Drop indexes first
DROP INDEX IF EXISTS idx_notes_life_area_id;
DROP INDEX IF EXISTS idx_notes_goal_id;
DROP INDEX IF EXISTS idx_notes_project_id;
DROP INDEX IF EXISTS idx_notes_task_id;

DROP INDEX IF EXISTS idx_tasks_completed_at;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_parent_task_id;
DROP INDEX IF EXISTS idx_tasks_project_id;

DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_goal_id;

DROP INDEX IF EXISTS idx_goals_life_area_id;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS life_areas;