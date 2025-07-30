-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Life Areas table
CREATE TABLE life_areas (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
    id TEXT PRIMARY KEY NOT NULL,
    life_area_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    archived_at TIMESTAMP,
    FOREIGN KEY (life_area_id) REFERENCES life_areas(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY NOT NULL,
    goal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'onhold', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    archived_at TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT,
    parent_task_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    archived_at TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE notes (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT,
    project_id TEXT,
    goal_id TEXT,
    life_area_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    FOREIGN KEY (life_area_id) REFERENCES life_areas(id) ON DELETE CASCADE
);

-- Indexes for Goals
CREATE INDEX idx_goals_life_area_id ON goals(life_area_id);

-- Indexes for Projects
CREATE INDEX idx_projects_goal_id ON projects(goal_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Indexes for Tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);

-- Indexes for Notes
CREATE INDEX idx_notes_task_id ON notes(task_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_goal_id ON notes(goal_id);
CREATE INDEX idx_notes_life_area_id ON notes(life_area_id);