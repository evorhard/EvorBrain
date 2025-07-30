-- Drop indexes first
DROP INDEX IF EXISTS idx_project_tags_tag_id;
DROP INDEX IF EXISTS idx_project_tags_project_id;
DROP INDEX IF EXISTS idx_task_tags_tag_id;
DROP INDEX IF EXISTS idx_task_tags_task_id;

-- Drop junction tables
DROP TABLE IF EXISTS project_tags;
DROP TABLE IF EXISTS task_tags;

-- Drop tags table
DROP TABLE IF EXISTS tags;