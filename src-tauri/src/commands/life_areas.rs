use crate::db::models::LifeArea;
use crate::db::repository::Repository;
use crate::error::{AppError, AppResult};
use crate::AppState;
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
) -> AppResult<LifeArea> {
    let repo = Repository::new(state.db.clone());
    
    repo.create_life_area(
        request.name,
        request.description,
        request.color,
        request.icon,
    )
    .await
}

#[tauri::command]
pub async fn get_life_areas(state: State<'_, AppState>) -> AppResult<Vec<LifeArea>> {
    let repo = Repository::new(state.db.clone());
    repo.get_life_areas().await
}

#[tauri::command]
pub async fn get_life_area(state: State<'_, AppState>, id: String) -> AppResult<LifeArea> {
    let _ = Uuid::parse_str(&id).map_err(|_| AppError::invalid_id(&id))?;
    let repo = Repository::new(state.db.clone());
    repo.get_life_area(&id).await
}

#[tauri::command]
pub async fn update_life_area(
    state: State<'_, AppState>,
    request: UpdateLifeAreaRequest,
) -> AppResult<LifeArea> {
    let _ = Uuid::parse_str(&request.id).map_err(|_| AppError::invalid_id(&request.id))?;
    let repo = Repository::new(state.db.clone());
    
    repo.update_life_area(
        &request.id,
        request.name,
        request.description,
        request.color,
        request.icon,
    )
    .await
}

#[tauri::command]
pub async fn delete_life_area(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let _ = Uuid::parse_str(&id).map_err(|_| AppError::invalid_id(&id))?;
    let repo = Repository::new(state.db.clone());
    repo.delete_life_area(&id).await
}

#[tauri::command]
pub async fn restore_life_area(state: State<'_, AppState>, id: String) -> AppResult<LifeArea> {
    let _ = Uuid::parse_str(&id).map_err(|_| AppError::invalid_id(&id))?;
    let repo = Repository::new(state.db.clone());
    repo.restore_life_area(&id).await
}