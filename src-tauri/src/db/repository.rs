use sqlx::{SqlitePool, Transaction, Sqlite};
use std::sync::Arc;
use chrono::Utc;
use uuid::Uuid;

use super::models::{LifeArea, Task};
use crate::error::{AppError, AppResult};

pub struct Repository {
    pool: Arc<SqlitePool>,
}

impl Repository {
    pub fn new(pool: Arc<SqlitePool>) -> Self {
        Self { pool }
    }

    // Transaction helper
    pub async fn begin_transaction(&self) -> AppResult<Transaction<'_, Sqlite>> {
        self.pool
            .begin()
            .await
            .map_err(|e| AppError::database_error("begin transaction", e))
    }

    // Life Area operations
    pub async fn create_life_area(&self, name: String, description: Option<String>, color: Option<String>, icon: Option<String>) -> AppResult<LifeArea> {
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

    pub async fn get_life_areas(&self) -> AppResult<Vec<LifeArea>> {
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
    
    pub async fn get_life_area(&self, id: &str) -> AppResult<LifeArea> {
        sqlx::query_as::<_, LifeArea>(
            r#"
            SELECT id, name, description, color, icon, 
                   created_at, updated_at, archived_at
            FROM life_areas
            WHERE id = ?1
            "#
        )
        .bind(id)
        .fetch_one(&*self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => AppError::not_found("Life area", id),
            _ => AppError::database_error("get life area", e),
        })
    }
    
    pub async fn update_life_area(
        &self, 
        id: &str, 
        name: String, 
        description: Option<String>, 
        color: Option<String>, 
        icon: Option<String>
    ) -> AppResult<LifeArea> {
        let now = Utc::now();
        
        sqlx::query(
            r#"
            UPDATE life_areas 
            SET name = ?1, description = ?2, color = ?3, icon = ?4, updated_at = ?5
            WHERE id = ?6 AND archived_at IS NULL
            "#
        )
        .bind(&name)
        .bind(&description)
        .bind(&color)
        .bind(&icon)
        .bind(&now)
        .bind(id)
        .execute(&*self.pool)
        .await
        .map_err(|e| AppError::database_error("update life area", e))?;
        
        self.get_life_area(id).await
    }
    
    pub async fn delete_life_area(&self, id: &str) -> AppResult<()> {
        let mut tx = self.begin_transaction().await?;
        let now = Utc::now();
        
        // Archive the life area
        let result = sqlx::query(
            r#"
            UPDATE life_areas 
            SET archived_at = ?1, updated_at = ?2
            WHERE id = ?3 AND archived_at IS NULL
            "#
        )
        .bind(&now)
        .bind(&now)
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::database_error("delete life area", e))?;
        
        if result.rows_affected() == 0 {
            return Err(AppError::not_found("Life area", id));
        }
        
        // Cascade archive to all goals in this life area
        sqlx::query(
            r#"
            UPDATE goals 
            SET archived_at = ?1, updated_at = ?2
            WHERE life_area_id = ?3 AND archived_at IS NULL
            "#
        )
        .bind(&now)
        .bind(&now)
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::database_error("cascade delete goals", e))?;
        
        // Cascade archive to all projects in goals of this life area
        sqlx::query(
            r#"
            UPDATE projects 
            SET archived_at = ?1, updated_at = ?2
            WHERE goal_id IN (
                SELECT id FROM goals WHERE life_area_id = ?3
            ) AND archived_at IS NULL
            "#
        )
        .bind(&now)
        .bind(&now)
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::database_error("cascade delete projects", e))?;
        
        // Cascade archive to all tasks in projects of goals in this life area
        sqlx::query(
            r#"
            UPDATE tasks 
            SET archived_at = ?1, updated_at = ?2
            WHERE project_id IN (
                SELECT p.id FROM projects p
                JOIN goals g ON p.goal_id = g.id
                WHERE g.life_area_id = ?3
            ) AND archived_at IS NULL
            "#
        )
        .bind(&now)
        .bind(&now)
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::database_error("cascade delete tasks", e))?;
        
        // Cascade archive to all notes associated with this life area
        sqlx::query(
            r#"
            UPDATE notes 
            SET archived_at = ?1, updated_at = ?2
            WHERE life_area_id = ?3 AND archived_at IS NULL
            "#
        )
        .bind(&now)
        .bind(&now)
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::database_error("cascade delete notes", e))?;
        
        tx.commit().await
            .map_err(|e| AppError::database_error("commit cascade delete", e))?;
        
        Ok(())
    }
    
    pub async fn restore_life_area(&self, id: &str) -> AppResult<LifeArea> {
        let now = Utc::now();
        
        let result = sqlx::query(
            r#"
            UPDATE life_areas 
            SET archived_at = NULL, updated_at = ?1
            WHERE id = ?2 AND archived_at IS NOT NULL
            "#
        )
        .bind(&now)
        .bind(id)
        .execute(&*self.pool)
        .await
        .map_err(|e| AppError::database_error("restore life area", e))?;
        
        if result.rows_affected() == 0 {
            return Err(AppError::not_found("Archived life area", id));
        }
        
        self.get_life_area(id).await
    }

    // Task operations with transactions
    pub async fn create_task_with_subtasks(
        &self, 
        task: Task, 
        subtasks: Vec<Task>
    ) -> AppResult<String> {
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

    pub async fn complete_task(&self, task_id: &str) -> AppResult<()> {
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
    pub async fn archive_project_cascade(&self, project_id: &str) -> AppResult<()> {
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

    // Archive operations for goals with cascading
    pub async fn archive_goal_cascade(&self, goal_id: &str) -> AppResult<()> {
        let mut tx = self.begin_transaction().await?;
        let now = Utc::now();
        
        // Archive the goal
        sqlx::query("UPDATE goals SET archived_at = ?1, updated_at = ?2 WHERE id = ?3")
            .bind(&now)
            .bind(&now)
            .bind(goal_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::database_error("archive goal", e))?;

        // Archive all projects in the goal
        sqlx::query("UPDATE projects SET archived_at = ?1, updated_at = ?2 WHERE goal_id = ?3 AND archived_at IS NULL")
            .bind(&now)
            .bind(&now)
            .bind(goal_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::database_error("cascade archive projects", e))?;

        // Archive all tasks in projects of this goal
        sqlx::query(
            r#"
            UPDATE tasks 
            SET archived_at = ?1, updated_at = ?2
            WHERE project_id IN (
                SELECT id FROM projects WHERE goal_id = ?3
            ) AND archived_at IS NULL
            "#
        )
        .bind(&now)
        .bind(&now)
        .bind(goal_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::database_error("cascade archive tasks", e))?;

        // Archive all notes associated with the goal
        sqlx::query("UPDATE notes SET archived_at = ?1, updated_at = ?2 WHERE goal_id = ?3 AND archived_at IS NULL")
            .bind(&now)
            .bind(&now)
            .bind(goal_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::database_error("cascade archive notes", e))?;

        tx.commit().await?;
        Ok(())
    }

    // Archive operations for tasks with cascading
    pub async fn archive_task_cascade(&self, task_id: &str) -> AppResult<()> {
        let mut tx = self.begin_transaction().await?;
        let now = Utc::now();
        
        // Archive the task
        sqlx::query("UPDATE tasks SET archived_at = ?1, updated_at = ?2 WHERE id = ?3")
            .bind(&now)
            .bind(&now)
            .bind(task_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::database_error("archive task", e))?;

        // Archive all subtasks
        sqlx::query("UPDATE tasks SET archived_at = ?1, updated_at = ?2 WHERE parent_task_id = ?3 AND archived_at IS NULL")
            .bind(&now)
            .bind(&now)
            .bind(task_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::database_error("cascade archive subtasks", e))?;

        // Archive all notes associated with the task
        sqlx::query("UPDATE notes SET archived_at = ?1, updated_at = ?2 WHERE task_id = ?3 AND archived_at IS NULL")
            .bind(&now)
            .bind(&now)
            .bind(task_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::database_error("cascade archive notes", e))?;

        tx.commit().await?;
        Ok(())
    }

    // Archive a note
    pub async fn archive_note(&self, note_id: &str) -> AppResult<()> {
        let now = Utc::now();
        
        sqlx::query("UPDATE notes SET archived_at = ?1, updated_at = ?2 WHERE id = ?3")
            .bind(&now)
            .bind(&now)
            .bind(note_id)
            .execute(&*self.pool)
            .await
            .map_err(|e| AppError::database_error("archive note", e))?;

        Ok(())
    }
}