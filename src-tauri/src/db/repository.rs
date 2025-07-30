use anyhow::Result;
use sqlx::{SqlitePool, Transaction, Sqlite};
use std::sync::Arc;
use chrono::Utc;
use uuid::Uuid;

use super::models::{LifeArea, Task};

pub struct Repository {
    pool: Arc<SqlitePool>,
}

impl Repository {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        Self { pool }
    }

    // Transaction helper
    pub async fn begin_transaction(&self) -> Result<Transaction<'_, Sqlite>> {
        Ok(self.pool.begin().await?)
    }

    // Life Area operations
    pub async fn create_life_area(&self, name: String, description: Option<String>, color: Option<String>, icon: Option<String>) -> Result<LifeArea> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        
        sqlx::query(
            r#"
            INSERT INTO life_areas (id, name, description, color, icon, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            "#
        )
        .bind(&id)
        .bind(&name)
        .bind(&description)
        .bind(&color)
        .bind(&icon)
        .bind(&now)
        .bind(&now)
        .execute(&*self.pool)
        .await?;

        Ok(LifeArea {
            id,
            name,
            description,
            color,
            icon,
            created_at: now,
            updated_at: now,
            archived_at: None,
        })
    }

    pub async fn get_life_areas(&self) -> Result<Vec<LifeArea>> {
        let areas = sqlx::query_as::<_, LifeArea>(
            r#"
            SELECT id, name, description, color, icon, 
                   created_at, updated_at, archived_at
            FROM life_areas
            WHERE archived_at IS NULL
            ORDER BY created_at DESC
            "#
        )
        .fetch_all(&*self.pool)
        .await?;

        Ok(areas)
    }

    // Task operations with transactions
    pub async fn create_task_with_subtasks(
        &self, 
        task: Task, 
        subtasks: Vec<Task>
    ) -> Result<String> {
        let mut tx = self.begin_transaction().await?;
        
        // Insert main task
        sqlx::query(
            r#"
            INSERT INTO tasks (id, project_id, parent_task_id, title, description, priority, due_date, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#
        )
        .bind(&task.id)
        .bind(&task.project_id)
        .bind(&task.parent_task_id)
        .bind(&task.title)
        .bind(&task.description)
        .bind(task.priority.to_string())
        .bind(&task.due_date)
        .bind(&task.created_at)
        .bind(&task.updated_at)
        .execute(&mut *tx)
        .await?;

        // Insert subtasks
        for subtask in subtasks {
            sqlx::query(
                r#"
                INSERT INTO tasks (id, project_id, parent_task_id, title, description, priority, due_date, created_at, updated_at)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
                "#
            )
            .bind(&subtask.id)
            .bind(&subtask.project_id)
            .bind(&task.id) // Parent is the main task
            .bind(&subtask.title)
            .bind(&subtask.description)
            .bind(subtask.priority.to_string())
            .bind(&subtask.due_date)
            .bind(&subtask.created_at)
            .bind(&subtask.updated_at)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(task.id)
    }

    pub async fn complete_task(&self, task_id: &str) -> Result<()> {
        let now = Utc::now();
        
        sqlx::query(
            r#"
            UPDATE tasks 
            SET completed_at = ?1, updated_at = ?2
            WHERE id = ?3
            "#
        )
        .bind(&now)
        .bind(&now)
        .bind(task_id)
        .execute(&*self.pool)
        .await?;

        Ok(())
    }

    // Archive operations with cascading
    pub async fn archive_project_cascade(&self, project_id: &str) -> Result<()> {
        let mut tx = self.begin_transaction().await?;
        let now = Utc::now();
        
        // Archive the project
        sqlx::query("UPDATE projects SET archived_at = ?1, updated_at = ?2 WHERE id = ?3")
            .bind(&now)
            .bind(&now)
            .bind(project_id)
            .execute(&mut *tx)
            .await?;

        // Archive all tasks in the project
        sqlx::query("UPDATE tasks SET archived_at = ?1, updated_at = ?2 WHERE project_id = ?3")
            .bind(&now)
            .bind(&now)
            .bind(project_id)
            .execute(&mut *tx)
            .await?;

        // Archive all notes associated with the project
        sqlx::query("UPDATE notes SET archived_at = ?1, updated_at = ?2 WHERE project_id = ?3")
            .bind(&now)
            .bind(&now)
            .bind(project_id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }
}