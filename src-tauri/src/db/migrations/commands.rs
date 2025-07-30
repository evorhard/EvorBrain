use crate::AppState;
use anyhow::Result;
use tauri::State;

#[tauri::command]
pub async fn get_migration_status(state: State<'_, AppState>) -> Result<String, String> {
    let runner = super::MigrationRunner::new((*state.db).clone());
    
    let applied = runner.get_applied_migrations()
        .await
        .map_err(|e| e.to_string())?;
    
    let all_migrations = super::all::get_migrations();
    
    let mut status = String::from("Migration Status:\n\n");
    
    for migration in &all_migrations {
        let is_applied = applied.contains(&migration.version);
        let status_icon = if is_applied { "✓" } else { "✗" };
        status.push_str(&format!(
            "{} Version {}: {} {}\n",
            status_icon,
            migration.version,
            migration.description,
            if is_applied { "(applied)" } else { "(pending)" }
        ));
    }
    
    if let Ok(Some(latest)) = runner.get_latest_version().await {
        status.push_str(&format!("\nLatest applied version: {}", latest));
    } else {
        status.push_str("\nNo migrations applied yet.");
    }
    
    Ok(status)
}

#[tauri::command]
pub async fn run_migrations(state: State<'_, AppState>) -> Result<String, String> {
    let runner = super::MigrationRunner::new((*state.db).clone());
    let all_migrations = super::all::get_migrations();
    
    let before_count = runner.get_applied_migrations()
        .await
        .map_err(|e| e.to_string())?
        .len();
    
    runner.migrate(&all_migrations)
        .await
        .map_err(|e| e.to_string())?;
    
    let after_count = runner.get_applied_migrations()
        .await
        .map_err(|e| e.to_string())?
        .len();
    
    let applied = after_count - before_count;
    
    if applied > 0 {
        Ok(format!("Successfully applied {} migration(s)", applied))
    } else {
        Ok("All migrations are already up to date".to_string())
    }
}

#[tauri::command]
pub async fn rollback_migration(state: State<'_, AppState>, target_version: Option<i64>) -> Result<String, String> {
    let runner = super::MigrationRunner::new((*state.db).clone());
    
    let before_version = runner.get_latest_version()
        .await
        .map_err(|e| e.to_string())?;
    
    runner.rollback(target_version)
        .await
        .map_err(|e| e.to_string())?;
    
    let after_version = runner.get_latest_version()
        .await
        .map_err(|e| e.to_string())?;
    
    match (before_version, after_version) {
        (Some(before), Some(after)) if before != after => {
            Ok(format!("Rolled back from version {} to {}", before, after))
        },
        (Some(before), None) => {
            Ok(format!("Rolled back all migrations from version {}", before))
        },
        _ => {
            Ok("No migrations to roll back".to_string())
        }
    }
}

#[tauri::command]
pub async fn reset_database(_state: State<'_, AppState>) -> Result<String, String> {
    #[cfg(not(debug_assertions))]
    {
        return Err("Database reset is only available in development mode".to_string());
    }
    
    #[cfg(debug_assertions)]
    {
        use sqlx::Executor;
        
        let runner = super::MigrationRunner::new((*_state.db).clone());
        
        runner.rollback(Some(0))
            .await
            .map_err(|e| e.to_string())?;
        
        (*_state.db).execute("DROP TABLE IF EXISTS _migrations")
            .await
            .map_err(|e| e.to_string())?;
        
        let all_migrations = super::all::get_migrations();
        runner.migrate(&all_migrations)
            .await
            .map_err(|e| e.to_string())?;
        
        Ok("Database reset successfully".to_string())
    }
}