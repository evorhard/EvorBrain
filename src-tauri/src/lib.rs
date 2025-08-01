mod db;
mod commands;
mod error;
mod logger;

use sqlx::SqlitePool;
use std::sync::Arc;
use tauri::Manager;

pub struct AppState {
    pub db: Arc<SqlitePool>,
}

/// Simple greeting command for testing
/// 
/// # Arguments
/// * `name` - The name to greet
/// 
/// # Returns
/// * A greeting message
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Tests the database connection by counting tables
/// 
/// # Arguments
/// * `state` - Application state containing the database connection
/// 
/// # Returns
/// * `Result<String, String>` - Success message with table count or error
#[tauri::command]
async fn test_database(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let result: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        .fetch_one(&*state.db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(format!("Database is working! Number of tables: {}", result.0))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // Initialize logger
            logger::init_logger(&app_handle)?;
            log_info!("EvorBrain application starting up");
            
            let db_path = db::connection::get_database_path(&app_handle)?;
            log_info!("Database path", &db_path);
            
            // Use Tauri's async runtime instead of creating a new one
            tauri::async_runtime::block_on(async move {
                log_info!("Initializing database connection");
                let db_pool = db::init_database(&db_path).await?;
                
                app_handle.manage(AppState {
                    db: Arc::new(db_pool),
                });
                
                log_info!("Application setup complete");
                Ok(())
            })
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            test_database,
            // Migration commands
            db::migrations::commands::get_migration_status,
            db::migrations::commands::run_migrations,
            db::migrations::commands::rollback_migration,
            db::migrations::commands::reset_database,
            // Life Area commands
            commands::create_life_area,
            commands::get_life_areas,
            commands::get_life_area,
            commands::update_life_area,
            commands::delete_life_area,
            commands::restore_life_area,
            // Goal commands
            commands::create_goal,
            commands::get_goals,
            commands::get_goals_by_life_area,
            commands::get_goal,
            commands::update_goal,
            commands::complete_goal,
            commands::uncomplete_goal,
            commands::delete_goal,
            commands::restore_goal,
            // Project commands
            commands::create_project,
            commands::get_projects,
            commands::get_projects_by_goal,
            commands::get_project,
            commands::update_project,
            commands::update_project_status,
            commands::delete_project,
            commands::restore_project,
            // Task commands
            commands::create_task,
            commands::create_task_with_subtasks,
            commands::get_tasks,
            commands::get_tasks_by_project,
            commands::get_subtasks,
            commands::get_task,
            commands::update_task,
            commands::complete_task,
            commands::uncomplete_task,
            commands::delete_task,
            commands::restore_task,
            commands::get_todays_tasks,
            // Note commands
            commands::create_note,
            commands::get_notes,
            commands::get_notes_by_task,
            commands::get_notes_by_project,
            commands::get_notes_by_goal,
            commands::get_notes_by_life_area,
            commands::get_note,
            commands::update_note,
            commands::delete_note,
            commands::restore_note,
            commands::search_notes,
            // Logging commands
            commands::get_recent_logs,
            commands::set_log_level,
            // Repository commands
            commands::check_repository_health,
            commands::batch_delete,
            commands::get_database_stats,
            commands::cleanup_database,
            commands::export_all_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
