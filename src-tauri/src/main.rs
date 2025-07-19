// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod commands;
mod validation;
mod error;

use database::Database;
use tauri::{State, Manager};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Test database connection command
#[tauri::command]
async fn test_database(db: State<'_, Database>) -> Result<String, String> {
    // Test query to check if database is working
    let result = sqlx::query_scalar::<_, i32>("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Database query failed: {}", e))?;
    
    Ok(format!("Database is working! Found {} tables.", result))
}

fn main() {
    // Initialize database before starting Tauri
    let runtime = tokio::runtime::Runtime::new().expect("Failed to create runtime");
    
    // Get the app data directory - we'll create it in a standard location for now
    let app_data_dir = dirs::data_dir()
        .expect("Failed to get data directory")
        .join("com.evorbrain.app");
    
    // Initialize the database synchronously before Tauri starts
    let db = runtime.block_on(async {
        let database = Database::new(app_data_dir).await
            .expect("Failed to initialize database");
        
        // Run migrations
        database.migrate()
            .await
            .expect("Failed to run database migrations");
        
        database
    });
    
    tauri::Builder::default()
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            greet, 
            test_database,
            // Life Area commands
            commands::get_life_areas,
            commands::get_life_area,
            commands::create_life_area,
            commands::update_life_area,
            commands::delete_life_area,
            commands::reorder_life_areas,
            // Goal commands
            commands::get_goals,
            commands::get_goals_by_life_area,
            commands::get_goal,
            commands::create_goal,
            commands::update_goal,
            commands::delete_goal,
            commands::update_goal_progress,
            // Project commands
            commands::get_projects,
            commands::get_projects_by_goal,
            commands::get_project,
            commands::create_project,
            commands::update_project,
            commands::delete_project,
            commands::update_project_progress,
            // Task commands
            commands::get_tasks,
            commands::get_tasks_by_project,
            commands::get_tasks_due_today,
            commands::get_overdue_tasks,
            commands::get_task,
            commands::create_task,
            commands::update_task,
            commands::delete_task,
            commands::toggle_task_complete,
            commands::bulk_update_tasks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}