use crate::db::models::{Project, ProjectStatus};
use crate::db::repository::Repository;
use crate::AppState;
use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub goal_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: Option<ProjectStatus>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProjectRequest {
    pub id: String,
    pub goal_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: ProjectStatus,
}

#[tauri::command]
pub async fn create_project(
    state: State<'_, AppState>,
    request: CreateProjectRequest,
) -> Result<Project, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let status = request.status.unwrap_or(ProjectStatus::Planning);
    
    sqlx::query(
        r#"
        INSERT INTO projects (id, goal_id, title, description, status, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#
    )
    .bind(&id)
    .bind(&request.goal_id)
    .bind(&request.title)
    .bind(&request.description)
    .bind(status.to_string())
    .bind(&now)
    .bind(&now)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_project(state, id).await
}

#[tauri::command]
pub async fn get_projects(state: State<'_, AppState>) -> Result<Vec<Project>, String> {
    sqlx::query_as::<_, Project>(
        r#"
        SELECT id, goal_id, title, description, status,
               created_at, updated_at, completed_at, archived_at
        FROM projects
        WHERE archived_at IS NULL
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_projects_by_goal(
    state: State<'_, AppState>,
    goal_id: String,
) -> Result<Vec<Project>, String> {
    sqlx::query_as::<_, Project>(
        r#"
        SELECT id, goal_id, title, description, status,
               created_at, updated_at, completed_at, archived_at
        FROM projects
        WHERE goal_id = ?1 AND archived_at IS NULL
        ORDER BY created_at DESC
        "#
    )
    .bind(&goal_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_project(state: State<'_, AppState>, id: String) -> Result<Project, String> {
    sqlx::query_as::<_, Project>(
        r#"
        SELECT id, goal_id, title, description, status,
               created_at, updated_at, completed_at, archived_at
        FROM projects
        WHERE id = ?1
        "#
    )
    .bind(&id)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_project(
    state: State<'_, AppState>,
    request: UpdateProjectRequest,
) -> Result<Project, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE projects 
        SET goal_id = ?1, title = ?2, description = ?3, status = ?4, updated_at = ?5
        WHERE id = ?6
        "#
    )
    .bind(&request.goal_id)
    .bind(&request.title)
    .bind(&request.description)
    .bind(request.status.to_string())
    .bind(&now)
    .bind(&request.id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_project(state, request.id).await
}

#[tauri::command]
pub async fn update_project_status(
    state: State<'_, AppState>,
    id: String,
    status: ProjectStatus,
) -> Result<Project, String> {
    let now = Utc::now();
    let mut completed_at: Option<DateTime<Utc>> = None;
    
    if status == ProjectStatus::Completed {
        completed_at = Some(now);
    }
    
    sqlx::query(
        r#"
        UPDATE projects 
        SET status = ?1, completed_at = ?2, updated_at = ?3
        WHERE id = ?4
        "#
    )
    .bind(status.to_string())
    .bind(&completed_at)
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_project(state, id).await
}

#[tauri::command]
pub async fn delete_project(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let repo = Repository::new(state.db.clone());
    repo.archive_project_cascade(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn restore_project(state: State<'_, AppState>, id: String) -> Result<Project, String> {
    let now = Utc::now();
    
    // Restore the project
    sqlx::query(
        r#"
        UPDATE projects 
        SET archived_at = NULL, updated_at = ?1
        WHERE id = ?2
        "#
    )
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    // Optionally restore associated tasks and notes
    // This could be a separate command if you want more control
    
    get_project(state, id).await
}