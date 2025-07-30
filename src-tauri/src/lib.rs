mod db;

use sqlx::SqlitePool;
use std::sync::Arc;
use tauri::Manager;

pub struct AppState {
    db: Arc<SqlitePool>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
            let db_path = db::connection::get_database_path(&app_handle)?;
            
            // Use Tauri's async runtime instead of creating a new one
            tauri::async_runtime::block_on(async move {
                let db_pool = db::init_database(&db_path).await?;
                
                app_handle.manage(AppState {
                    db: Arc::new(db_pool),
                });
                
                Ok(())
            })
        })
        .invoke_handler(tauri::generate_handler![greet, test_database])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
