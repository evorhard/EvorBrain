-- Initial database schema for EvorBrain

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Life Areas table
CREATE TABLE life_areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
    id TEXT PRIMARY KEY,
    life_area_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT CHECK(status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (life_area_id) REFERENCES life_areas(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    status TEXT CHECK(status IN ('planning', 'active', 'completed', 'on_hold', 'cancelled')) DEFAULT 'planning',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK(status IN ('todo', 'in_progress', 'completed', 'cancelled')) DEFAULT 'todo',
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    recurrence_rule TEXT, -- iCal RRULE format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Tags table (for future expansion)
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task tags junction table
CREATE TABLE task_tags (
    task_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_goals_life_area ON goals(life_area_id);
CREATE INDEX idx_projects_goal ON projects(goal_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Triggers to update the updated_at timestamp
CREATE TRIGGER update_life_areas_timestamp 
    AFTER UPDATE ON life_areas
    FOR EACH ROW
    BEGIN
        UPDATE life_areas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_goals_timestamp 
    AFTER UPDATE ON goals
    FOR EACH ROW
    BEGIN
        UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_projects_timestamp 
    AFTER UPDATE ON projects
    FOR EACH ROW
    BEGIN
        UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_tasks_timestamp 
    AFTER UPDATE ON tasks
    FOR EACH ROW
    BEGIN
        UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;