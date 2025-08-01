use crate::db::models::LifeArea;
use crate::db::repository::Repository;
use crate::error::{AppError, AppResult};
use crate::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

/// Request structure for creating a new life area
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLifeAreaRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

/// Request structure for updating an existing life area
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateLifeAreaRequest {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

/// Creates a new life area in the system
/// 
/// # Arguments
/// * `state` - Application state containing the database connection
/// * `request` - Creation request with name, description, color, and icon
/// 
/// # Returns
/// * `AppResult<LifeArea>` - The newly created life area
/// 
/// # Errors
/// * Returns `AppError` if creation fails or validation errors occur
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

/// Retrieves all life areas from the database
/// 
/// # Arguments
/// * `state` - Application state containing the database connection
/// 
/// # Returns
/// * `AppResult<Vec<LifeArea>>` - List of all life areas
/// 
/// # Errors
/// * Returns `AppError` if database query fails
#[tauri::command]
pub async fn get_life_areas(state: State<'_, AppState>) -> AppResult<Vec<LifeArea>> {
    let repo = Repository::new(state.db.clone());
    repo.get_life_areas().await
}

/// Retrieves a specific life area by ID
/// 
/// # Arguments
/// * `state` - Application state containing the database connection
/// * `id` - UUID string of the life area to retrieve
/// 
/// # Returns
/// * `AppResult<LifeArea>` - The requested life area
/// 
/// # Errors
/// * Returns `AppError` if the ID is invalid or life area not found
#[tauri::command]
pub async fn get_life_area(state: State<'_, AppState>, id: String) -> AppResult<LifeArea> {
    let _ = Uuid::parse_str(&id).map_err(|_| AppError::invalid_id(&id))?;
    let repo = Repository::new(state.db.clone());
    repo.get_life_area(&id).await
}

/// Updates an existing life area
/// 
/// # Arguments
/// * `state` - Application state containing the database connection
/// * `request` - Update request containing ID and fields to update
/// 
/// # Returns
/// * `AppResult<LifeArea>` - The updated life area
/// 
/// # Errors
/// * Returns `AppError` if the ID is invalid, life area not found, or update fails
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

/// Soft deletes a life area (marks as archived)
/// 
/// # Arguments
/// * `state` - Application state containing the database connection
/// * `id` - UUID string of the life area to delete
/// 
/// # Returns
/// * `AppResult<()>` - Success or error
/// 
/// # Errors
/// * Returns `AppError` if the ID is invalid, life area not found, or has active goals
#[tauri::command]
pub async fn delete_life_area(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let _ = Uuid::parse_str(&id).map_err(|_| AppError::invalid_id(&id))?;
    let repo = Repository::new(state.db.clone());
    repo.delete_life_area(&id).await
}

/// Restores a previously deleted life area
/// 
/// # Arguments
/// * `state` - Application state containing the database connection
/// * `id` - UUID string of the life area to restore
/// 
/// # Returns
/// * `AppResult<LifeArea>` - The restored life area
/// 
/// # Errors
/// * Returns `AppError` if the ID is invalid, life area not found, or not archived
#[tauri::command]
pub async fn restore_life_area(state: State<'_, AppState>, id: String) -> AppResult<LifeArea> {
    let _ = Uuid::parse_str(&id).map_err(|_| AppError::invalid_id(&id))?;
    let repo = Repository::new(state.db.clone());
    repo.restore_life_area(&id).await
}