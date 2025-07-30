use crate::db::models::Goal;
use crate::AppState;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateGoalRequest {
    pub life_area_id: String,
    pub title: String,
    pub description: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateGoalRequest {
    pub id: String,
    pub life_area_id: String,
    pub title: String,
    pub description: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
}

#[tauri::command]
pub async fn create_goal(
    state: State<'_, AppState>,
    request: CreateGoalRequest,
) -> Result<Goal, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    sqlx::query(
        r#"
        INSERT INTO goals (id, life_area_id, title, description, target_date, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#
    )
    .bind(&id)
    .bind(&request.life_area_id)
    .bind(&request.title)
    .bind(&request.description)
    .bind(&request.target_date)
    .bind(&now)
    .bind(&now)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_goal(state, id).await
}

#[tauri::command]
pub async fn get_goals(state: State<'_, AppState>) -> Result<Vec<Goal>, String> {
    sqlx::query_as::<_, Goal>(
        r#"
        SELECT id, life_area_id, title, description, target_date,
               created_at, updated_at, completed_at, archived_at
        FROM goals
        WHERE archived_at IS NULL
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_goals_by_life_area(
    state: State<'_, AppState>,
    life_area_id: String,
) -> Result<Vec<Goal>, String> {
    sqlx::query_as::<_, Goal>(
        r#"
        SELECT id, life_area_id, title, description, target_date,
               created_at, updated_at, completed_at, archived_at
        FROM goals
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
pub async fn get_goal(state: State<'_, AppState>, id: String) -> Result<Goal, String> {
    sqlx::query_as::<_, Goal>(
        r#"
        SELECT id, life_area_id, title, description, target_date,
               created_at, updated_at, completed_at, archived_at
        FROM goals
        WHERE id = ?1
        "#
    )
    .bind(&id)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_goal(
    state: State<'_, AppState>,
    request: UpdateGoalRequest,
) -> Result<Goal, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE goals 
        SET life_area_id = ?1, title = ?2, description = ?3, target_date = ?4, updated_at = ?5
        WHERE id = ?6
        "#
    )
    .bind(&request.life_area_id)
    .bind(&request.title)
    .bind(&request.description)
    .bind(&request.target_date)
    .bind(&now)
    .bind(&request.id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_goal(state, request.id).await
}

#[tauri::command]
pub async fn complete_goal(state: State<'_, AppState>, id: String) -> Result<Goal, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE goals 
        SET completed_at = ?1, updated_at = ?2
        WHERE id = ?3
        "#
    )
    .bind(&now)
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_goal(state, id).await
}

#[tauri::command]
pub async fn uncomplete_goal(state: State<'_, AppState>, id: String) -> Result<Goal, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE goals 
        SET completed_at = NULL, updated_at = ?1
        WHERE id = ?2
        "#
    )
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_goal(state, id).await
}

#[tauri::command]
pub async fn delete_goal(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE goals 
        SET archived_at = ?1, updated_at = ?2
        WHERE id = ?3
        "#
    )
    .bind(&now)
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn restore_goal(state: State<'_, AppState>, id: String) -> Result<Goal, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE goals 
        SET archived_at = NULL, updated_at = ?1
        WHERE id = ?2
        "#
    )
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_goal(state, id).await
}