use anyhow::Result;
use sqlx::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    // Enable foreign key constraints
    sqlx::query("PRAGMA foreign_keys = ON")
        .execute(pool)
        .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS life_areas (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT,
            icon TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            archived_at TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS goals (
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
        )
        "#
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS projects (
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
        )
        "#
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS tasks (
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
        )
        "#
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS notes (
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
        )
        "#
    )
    .execute(pool)
    .await?;

    // Create indexes for foreign keys and commonly queried fields
    create_indexes(pool).await?;

    Ok(())
}

async fn create_indexes(pool: &SqlitePool) -> Result<()> {
    // Goals indexes
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_goals_life_area_id ON goals(life_area_id)")
        .execute(pool)
        .await?;
    
    // Projects indexes
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_projects_goal_id ON projects(goal_id)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)")
        .execute(pool)
        .await?;
    
    // Tasks indexes
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at)")
        .execute(pool)
        .await?;
    
    // Notes indexes
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_notes_task_id ON notes(task_id)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_notes_goal_id ON notes(goal_id)")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_notes_life_area_id ON notes(life_area_id)")
        .execute(pool)
        .await?;
    
    Ok(())
}