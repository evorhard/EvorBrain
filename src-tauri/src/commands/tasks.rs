use crate::db::models::{Task, TaskPriority};
use crate::db::repository::Repository;
use crate::AppState;
use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub project_id: Option<String>,
    pub parent_task_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub priority: Option<TaskPriority>,
    pub due_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTaskWithSubtasksRequest {
    pub task: CreateTaskRequest,
    pub subtasks: Vec<CreateTaskRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTaskRequest {
    pub id: String,
    pub project_id: Option<String>,
    pub parent_task_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub priority: TaskPriority,
    pub due_date: Option<DateTime<Utc>>,
}

#[tauri::command]
pub async fn create_task(
    state: State<'_, AppState>,
    request: CreateTaskRequest,
) -> Result<Task, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let priority = request.priority.unwrap_or_default();
    
    sqlx::query(
        r#"
        INSERT INTO tasks (id, project_id, parent_task_id, title, description, priority, due_date, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        "#
    )
    .bind(&id)
    .bind(&request.project_id)
    .bind(&request.parent_task_id)
    .bind(&request.title)
    .bind(&request.description)
    .bind(priority.to_string())
    .bind(&request.due_date)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_task(state, id).await
}

#[tauri::command]
pub async fn create_task_with_subtasks(
    state: State<'_, AppState>,
    request: CreateTaskWithSubtasksRequest,
) -> Result<Task, String> {
    let repo = Repository::new(state.db.clone());
    
    // Create main task
    let main_task = Task {
        id: Uuid::new_v4().to_string(),
        project_id: request.task.project_id,
        parent_task_id: request.task.parent_task_id,
        title: request.task.title,
        description: request.task.description,
        priority: request.task.priority.unwrap_or_default(),
        due_date: request.task.due_date,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        completed_at: None,
        archived_at: None,
    };
    
    // Create subtasks
    let subtasks: Vec<Task> = request.subtasks.into_iter().map(|req| Task {
        id: Uuid::new_v4().to_string(),
        project_id: req.project_id.or(main_task.project_id.clone()),
        parent_task_id: Some(main_task.id.clone()),
        title: req.title,
        description: req.description,
        priority: req.priority.unwrap_or_default(),
        due_date: req.due_date,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        completed_at: None,
        archived_at: None,
    }).collect();
    
    let task_id = repo.create_task_with_subtasks(main_task.clone(), subtasks)
        .await
        .map_err(|e| e.to_string())?;
    
    get_task(state, task_id).await
}

#[tauri::command]
pub async fn get_tasks(state: State<'_, AppState>) -> Result<Vec<Task>, String> {
    sqlx::query_as::<_, Task>(
        r#"
        SELECT id, project_id, parent_task_id, title, description, priority, due_date,
               created_at, updated_at, completed_at, archived_at
        FROM tasks
        WHERE archived_at IS NULL
        ORDER BY 
            CASE priority 
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END,
            due_date ASC NULLS LAST,
            created_at DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_tasks_by_project(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<Vec<Task>, String> {
    sqlx::query_as::<_, Task>(
        r#"
        SELECT id, project_id, parent_task_id, title, description, priority, due_date,
               created_at, updated_at, completed_at, archived_at
        FROM tasks
        WHERE project_id = ?1 AND archived_at IS NULL
        ORDER BY 
            CASE priority 
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END,
            due_date ASC NULLS LAST,
            created_at DESC
        "#
    )
    .bind(&project_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_subtasks(
    state: State<'_, AppState>,
    parent_task_id: String,
) -> Result<Vec<Task>, String> {
    sqlx::query_as::<_, Task>(
        r#"
        SELECT id, project_id, parent_task_id, title, description, priority, due_date,
               created_at, updated_at, completed_at, archived_at
        FROM tasks
        WHERE parent_task_id = ?1 AND archived_at IS NULL
        ORDER BY created_at ASC
        "#
    )
    .bind(&parent_task_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_task(state: State<'_, AppState>, id: String) -> Result<Task, String> {
    sqlx::query_as::<_, Task>(
        r#"
        SELECT id, project_id, parent_task_id, title, description, priority, due_date,
               created_at, updated_at, completed_at, archived_at
        FROM tasks
        WHERE id = ?1
        "#
    )
    .bind(&id)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_task(
    state: State<'_, AppState>,
    request: UpdateTaskRequest,
) -> Result<Task, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE tasks 
        SET project_id = ?1, parent_task_id = ?2, title = ?3, description = ?4, 
            priority = ?5, due_date = ?6, updated_at = ?7
        WHERE id = ?8
        "#
    )
    .bind(&request.project_id)
    .bind(&request.parent_task_id)
    .bind(&request.title)
    .bind(&request.description)
    .bind(request.priority.to_string())
    .bind(&request.due_date)
    .bind(&now)
    .bind(&request.id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_task(state, request.id).await
}

#[tauri::command]
pub async fn complete_task(state: State<'_, AppState>, id: String) -> Result<Task, String> {
    let repo = Repository::new(state.db.clone());
    repo.complete_task(&id)
        .await
        .map_err(|e| e.to_string())?;
    
    get_task(state, id).await
}

#[tauri::command]
pub async fn uncomplete_task(state: State<'_, AppState>, id: String) -> Result<Task, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE tasks 
        SET completed_at = NULL, updated_at = ?1
        WHERE id = ?2
        "#
    )
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_task(state, id).await
}

#[tauri::command]
pub async fn delete_task(state: State<'_, AppState>, id: String) -> Result<(), String> {
    use crate::db::repository::Repository;
    
    let repo = Repository::new(state.db.clone());
    repo.archive_task_cascade(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn restore_task(state: State<'_, AppState>, id: String) -> Result<Task, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE tasks 
        SET archived_at = NULL, updated_at = ?1
        WHERE id = ?2
        "#
    )
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_task(state, id).await
}

#[tauri::command]
pub async fn get_todays_tasks(state: State<'_, AppState>) -> Result<Vec<Task>, String> {
    let today_start = Utc::now().date_naive().and_hms_opt(0, 0, 0).unwrap().and_utc();
    let today_end = Utc::now().date_naive().and_hms_opt(23, 59, 59).unwrap().and_utc();
    
    sqlx::query_as::<_, Task>(
        r#"
        SELECT id, project_id, parent_task_id, title, description, priority, due_date,
               created_at, updated_at, completed_at, archived_at
        FROM tasks
        WHERE archived_at IS NULL
          AND completed_at IS NULL
          AND (
              (due_date >= ?1 AND due_date <= ?2)
              OR priority = 'urgent'
          )
        ORDER BY 
            CASE priority 
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END,
            due_date ASC NULLS LAST
        "#
    )
    .bind(&today_start)
    .bind(&today_end)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}