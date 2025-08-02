use crate::db::models::Note;
use crate::AppState;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNoteRequest {
    pub task_id: Option<String>,
    pub project_id: Option<String>,
    pub goal_id: Option<String>,
    pub life_area_id: Option<String>,
    pub title: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNoteRequest {
    pub id: String,
    pub task_id: Option<String>,
    pub project_id: Option<String>,
    pub goal_id: Option<String>,
    pub life_area_id: Option<String>,
    pub title: String,
    pub content: String,
}

#[tauri::command]
pub async fn create_note(
    state: State<'_, AppState>,
    request: CreateNoteRequest,
) -> Result<Note, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    sqlx::query(
        r#"
        INSERT INTO notes (id, task_id, project_id, goal_id, life_area_id, title, content, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        "#
    )
    .bind(&id)
    .bind(&request.task_id)
    .bind(&request.project_id)
    .bind(&request.goal_id)
    .bind(&request.life_area_id)
    .bind(&request.title)
    .bind(&request.content)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_note(state, id).await
}

#[tauri::command]
pub async fn get_notes(state: State<'_, AppState>) -> Result<Vec<Note>, String> {
    sqlx::query_as::<_, Note>(
        r#"
        SELECT id, task_id, project_id, goal_id, life_area_id, title, content,
               created_at, updated_at, archived_at
        FROM notes
        WHERE archived_at IS NULL
        ORDER BY updated_at DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_notes_by_task(
    state: State<'_, AppState>,
    task_id: String,
) -> Result<Vec<Note>, String> {
    sqlx::query_as::<_, Note>(
        r#"
        SELECT id, task_id, project_id, goal_id, life_area_id, title, content,
               created_at, updated_at, archived_at
        FROM notes
        WHERE task_id = ?1 AND archived_at IS NULL
        ORDER BY created_at DESC
        "#
    )
    .bind(&task_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_notes_by_project(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<Note>, String> {
    sqlx::query_as::<_, Note>(
        r#"
        SELECT id, task_id, project_id, goal_id, life_area_id, title, content,
               created_at, updated_at, archived_at
        FROM notes
        WHERE project_id = ?1 AND archived_at IS NULL
        ORDER BY created_at DESC
        "#
    )
    .bind(&project_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_notes_by_goal(
    state: State<'_, AppState>,
    goal_id: String,
) -> Result<Vec<Note>, String> {
    sqlx::query_as::<_, Note>(
        r#"
        SELECT id, task_id, project_id, goal_id, life_area_id, title, content,
               created_at, updated_at, archived_at
        FROM notes
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
pub async fn get_notes_by_life_area(
    state: State<'_, AppState>,
    life_area_id: String,
) -> Result<Vec<Note>, String> {
    sqlx::query_as::<_, Note>(
        r#"
        SELECT id, task_id, project_id, goal_id, life_area_id, title, content,
               created_at, updated_at, archived_at
        FROM notes
        WHERE life_area_id = ?1 AND archived_at IS NULL
        ORDER BY created_at DESC
        "#
    )
    .bind(&life_area_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_note(state: State<'_, AppState>, id: String) -> Result<Note, String> {
    sqlx::query_as::<_, Note>(
        r#"
        SELECT id, task_id, project_id, goal_id, life_area_id, title, content,
               created_at, updated_at, archived_at
        FROM notes
        WHERE id = ?1
        "#
    )
    .bind(&id)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_note(
    state: State<'_, AppState>,
    request: UpdateNoteRequest,
) -> Result<Note, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE notes 
        SET task_id = ?1, project_id = ?2, goal_id = ?3, life_area_id = ?4, 
            title = ?5, content = ?6, updated_at = ?7
        WHERE id = ?8
        "#
    )
    .bind(&request.task_id)
    .bind(&request.project_id)
    .bind(&request.goal_id)
    .bind(&request.life_area_id)
    .bind(&request.title)
    .bind(&request.content)
    .bind(&now)
    .bind(&request.id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_note(state, request.id).await
}

#[tauri::command]
pub async fn delete_note(state: State<'_, AppState>, id: String) -> Result<(), String> {
    use crate::db::repository::Repository;
    
    let repo = Repository::new(state.db.clone());
    repo.archive_note(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn restore_note(state: State<'_, AppState>, id: String) -> Result<Note, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE notes 
        SET archived_at = NULL, updated_at = ?1
        WHERE id = ?2
        "#
    )
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_note(state, id).await
}

#[tauri::command]
pub async fn search_notes(
    state: State<'_, AppState>,
    query: String,
) -> Result<Vec<Note>, String> {
    let search_pattern = format!("%{}%", query);
    
    sqlx::query_as::<_, Note>(
        r#"
        SELECT id, task_id, project_id, goal_id, life_area_id, title, content,
               created_at, updated_at, archived_at
        FROM notes
        WHERE archived_at IS NULL
          AND (title LIKE ?1 OR content LIKE ?1)
        ORDER BY updated_at DESC
        LIMIT 50
        "#
    )
    .bind(&search_pattern)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}