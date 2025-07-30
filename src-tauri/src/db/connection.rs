use anyhow::Result;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use tauri::Manager;

pub async fn create_pool(database_url: &str) -> Result<SqlitePool> {
    let connect_options = SqliteConnectOptions::new()
        .filename(database_url)
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await?;

    Ok(pool)
}

pub fn get_database_path(app_handle: &tauri::AppHandle) -> Result<String> {
    let app_dir = app_handle.path()
        .app_data_dir()?;
    
    std::fs::create_dir_all(&app_dir)?;
    
    let db_path = app_dir.join("evorbrain.db");
    Ok(db_path.to_string_lossy().into_owned())
}