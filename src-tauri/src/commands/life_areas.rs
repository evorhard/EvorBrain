use crate::db::models::LifeArea;
use crate::db::repository::Repository;
use crate::AppState;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLifeAreaRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateLifeAreaRequest {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

#[tauri::command]
pub async fn create_life_area(
    state: State<'_, AppState>,
    request: CreateLifeAreaRequest,
) -> Result<LifeArea, String> {
    let repo = Repository::new(state.db.clone());
    
    repo.create_life_area(
        request.name,
        request.description,
        request.color,
        request.icon,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_life_areas(state: State<'_, AppState>) -> Result<Vec<LifeArea>, String> {
    let repo = Repository::new(state.db.clone());
    repo.get_life_areas().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_life_area(state: State<'_, AppState>, id: String) -> Result<LifeArea, String> {
    let repo = Repository::new(state.db.clone());
    
    sqlx::query_as::<_, LifeArea>(
        r#"
        SELECT id, name, description, color, icon, 
               created_at, updated_at, archived_at
        FROM life_areas
        WHERE id = ?1
        "#
    )
    .bind(&id)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_life_area(
    state: State<'_, AppState>,
    request: UpdateLifeAreaRequest,
) -> Result<LifeArea, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE life_areas 
        SET name = ?1, description = ?2, color = ?3, icon = ?4, updated_at = ?5
        WHERE id = ?6
        "#
    )
    .bind(&request.name)
    .bind(&request.description)
    .bind(&request.color)
    .bind(&request.icon)
    .bind(&now)
    .bind(&request.id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_life_area(state, request.id).await
}

#[tauri::command]
pub async fn delete_life_area(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE life_areas 
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
pub async fn restore_life_area(state: State<'_, AppState>, id: String) -> Result<LifeArea, String> {
    let now = Utc::now();
    
    sqlx::query(
        r#"
        UPDATE life_areas 
        SET archived_at = NULL, updated_at = ?1
        WHERE id = ?2
        "#
    )
    .bind(&now)
    .bind(&id)
    .execute(&*state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    get_life_area(state, id).await
}