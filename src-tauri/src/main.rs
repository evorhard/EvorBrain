// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use database::Database;
use std::sync::Arc;
use tokio::sync::Mutex;

// Application state
pub struct AppState {
    db: Arc<Mutex<Database>>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Test database connection command
#[tauri::command]
async fn test_database(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().await;
    
    // Test query to check if database is working
    let result = sqlx::query_scalar::<_, i32>("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Database query failed: {}", e))?;
    
    Ok(format!("Database is working! Found {} tables.", result))
}

#[tokio::main]
async fn main() {
    // Initialize database
    // In production, we'll use the app's data directory
    // For now, let's use a local directory for development
    let app_data_dir = std::env::current_dir()
        .unwrap()
        .join("data");
    
    // Ensure the data directory exists
    std::fs::create_dir_all(&app_data_dir)
        .expect("Failed to create data directory");
    
    let db = Database::new(app_data_dir)
        .await
        .expect("Failed to initialize database");
    
    // Run migrations
    db.migrate()
        .await
        .expect("Failed to run database migrations");
    
    let app_state = AppState {
        db: Arc::new(Mutex::new(db)),
    };
    
    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![greet, test_database])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}