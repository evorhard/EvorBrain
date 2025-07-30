use crate::db::repository::Repository;
use crate::error::AppResult;
use crate::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionResult {
    pub success: bool,
    pub message: String,
    pub affected_rows: Option<usize>,
}

// Repository health check
#[tauri::command]
pub async fn check_repository_health(state: State<'_, AppState>) -> AppResult<TransactionResult> {
    let repo = Repository::new(state.db.clone());
    
    // Try to begin and commit a transaction to verify database is working
    let tx = repo.begin_transaction().await?;
    tx.commit().await
        .map_err(|e| crate::error::AppError::database_error("health check", e))?;
    
    Ok(TransactionResult {
        success: true,
        message: "Repository is healthy".to_string(),
        affected_rows: None,
    })
}

// Batch operations
#[derive(Debug, Serialize, Deserialize)]
pub struct BatchDeleteRequest {
    pub entity_type: EntityType,
    pub ids: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EntityType {
    LifeArea,
    Goal,
    Project,
    Task,
    Note,
}

#[tauri::command]
pub async fn batch_delete(
    state: State<'_, AppState>,
    request: BatchDeleteRequest,
) -> AppResult<TransactionResult> {
    let repo = Repository::new(state.db.clone());
    let mut affected = 0;
    
    match request.entity_type {
        EntityType::LifeArea => {
            for id in &request.ids {
                repo.delete_life_area(id).await?;
                affected += 1;
            }
        }
        EntityType::Project => {
            for id in &request.ids {
                repo.archive_project_cascade(id).await?;
                affected += 1;
            }
        }
        EntityType::Task => {
            // We'll need to add delete_task to repository
            // For now, return an error
            return Err(crate::error::AppError::new(
                crate::error::ErrorCode::InternalError,
                "Task batch delete not yet implemented",
            ));
        }
        _ => {
            return Err(crate::error::AppError::new(
                crate::error::ErrorCode::InternalError,
                format!("Batch delete not implemented for {:?}", request.entity_type),
            ));
        }
    }
    
    Ok(TransactionResult {
        success: true,
        message: format!("Successfully deleted {} items", affected),
        affected_rows: Some(affected),
    })
}

// Database statistics
#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseStats {
    pub life_areas_count: i64,
    pub goals_count: i64,
    pub projects_count: i64,
    pub tasks_count: i64,
    pub notes_count: i64,
    pub archived_items_count: i64,
}

#[tauri::command]
pub async fn get_database_stats(state: State<'_, AppState>) -> AppResult<DatabaseStats> {
    use sqlx::Row;
    
    // Get counts for each entity type
    let life_areas_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM life_areas WHERE archived_at IS NULL"
    )
    .fetch_one(&*state.db)
    .await?;
    
    let goals_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM goals WHERE archived_at IS NULL"
    )
    .fetch_one(&*state.db)
    .await?;
    
    let projects_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM projects WHERE archived_at IS NULL"
    )
    .fetch_one(&*state.db)
    .await?;
    
    let tasks_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM tasks WHERE archived_at IS NULL"
    )
    .fetch_one(&*state.db)
    .await?;
    
    let notes_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM notes WHERE archived_at IS NULL"
    )
    .fetch_one(&*state.db)
    .await?;
    
    // Get total archived items
    let archived_query = r#"
        SELECT 
            (SELECT COUNT(*) FROM life_areas WHERE archived_at IS NOT NULL) +
            (SELECT COUNT(*) FROM goals WHERE archived_at IS NOT NULL) +
            (SELECT COUNT(*) FROM projects WHERE archived_at IS NOT NULL) +
            (SELECT COUNT(*) FROM tasks WHERE archived_at IS NOT NULL) +
            (SELECT COUNT(*) FROM notes WHERE archived_at IS NOT NULL) as total
    "#;
    
    let archived_row = sqlx::query(archived_query)
        .fetch_one(&*state.db)
        .await?;
    
    let archived_items_count: i64 = archived_row.get("total");
    
    Ok(DatabaseStats {
        life_areas_count: life_areas_count.0,
        goals_count: goals_count.0,
        projects_count: projects_count.0,
        tasks_count: tasks_count.0,
        notes_count: notes_count.0,
        archived_items_count,
    })
}

// Cleanup operations
#[derive(Debug, Serialize, Deserialize)]
pub struct CleanupOptions {
    pub delete_archived_older_than_days: Option<u32>,
    pub vacuum_database: bool,
}

#[tauri::command]
pub async fn cleanup_database(
    state: State<'_, AppState>,
    options: CleanupOptions,
) -> AppResult<TransactionResult> {
    let mut messages = Vec::new();
    let mut total_deleted = 0;
    
    // Delete old archived items if requested
    if let Some(days) = options.delete_archived_older_than_days {
        let cutoff_date = chrono::Utc::now() - chrono::Duration::days(days as i64);
        
        // Delete from each table
        for (table, name) in [
            ("life_areas", "life areas"),
            ("goals", "goals"),
            ("projects", "projects"),
            ("tasks", "tasks"),
            ("notes", "notes"),
        ] {
            let result = sqlx::query(&format!(
                "DELETE FROM {} WHERE archived_at IS NOT NULL AND archived_at < ?1",
                table
            ))
            .bind(cutoff_date)
            .execute(&*state.db)
            .await?;
            
            let deleted = result.rows_affected();
            if deleted > 0 {
                total_deleted += deleted;
                messages.push(format!("Deleted {} archived {}", deleted, name));
            }
        }
    }
    
    // Vacuum database if requested
    if options.vacuum_database {
        sqlx::query("VACUUM")
            .execute(&*state.db)
            .await
            .map_err(|e| crate::error::AppError::database_error("vacuum database", e))?;
        messages.push("Database vacuumed successfully".to_string());
    }
    
    let message = if messages.is_empty() {
        "No cleanup operations performed".to_string()
    } else {
        messages.join(", ")
    };
    
    Ok(TransactionResult {
        success: true,
        message,
        affected_rows: if total_deleted > 0 { Some(total_deleted as usize) } else { None },
    })
}

// Export data
#[derive(Debug, Serialize, Deserialize)]
pub struct ExportRequest {
    pub include_archived: bool,
    pub format: ExportFormat,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ExportFormat {
    Json,
    // Future: CSV, Markdown
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResult {
    pub data: serde_json::Value,
    pub item_count: usize,
    pub export_date: chrono::DateTime<chrono::Utc>,
}

#[tauri::command]
pub async fn export_all_data(
    state: State<'_, AppState>,
    request: ExportRequest,
) -> AppResult<ExportResult> {
    let repo = Repository::new(state.db.clone());
    
    // For now, only implement JSON export
    match request.format {
        ExportFormat::Json => {
            let mut data = serde_json::json!({});
            let mut total_items = 0;
            
            // Export life areas
            let life_areas = if request.include_archived {
                sqlx::query_as::<_, crate::db::models::LifeArea>(
                    "SELECT * FROM life_areas ORDER BY created_at"
                )
                .fetch_all(&*state.db)
                .await?
            } else {
                repo.get_life_areas().await?
            };
            total_items += life_areas.len();
            data["life_areas"] = serde_json::to_value(&life_areas)?;
            
            // Export goals
            let goals = sqlx::query_as::<_, crate::db::models::Goal>(
                if request.include_archived {
                    "SELECT * FROM goals ORDER BY created_at"
                } else {
                    "SELECT * FROM goals WHERE archived_at IS NULL ORDER BY created_at"
                }
            )
            .fetch_all(&*state.db)
            .await?;
            total_items += goals.len();
            data["goals"] = serde_json::to_value(&goals)?;
            
            // Export projects
            let projects = sqlx::query_as::<_, crate::db::models::Project>(
                if request.include_archived {
                    "SELECT * FROM projects ORDER BY created_at"
                } else {
                    "SELECT * FROM projects WHERE archived_at IS NULL ORDER BY created_at"
                }
            )
            .fetch_all(&*state.db)
            .await?;
            total_items += projects.len();
            data["projects"] = serde_json::to_value(&projects)?;
            
            // Export tasks
            let tasks = sqlx::query_as::<_, crate::db::models::Task>(
                if request.include_archived {
                    "SELECT * FROM tasks ORDER BY created_at"
                } else {
                    "SELECT * FROM tasks WHERE archived_at IS NULL ORDER BY created_at"
                }
            )
            .fetch_all(&*state.db)
            .await?;
            total_items += tasks.len();
            data["tasks"] = serde_json::to_value(&tasks)?;
            
            // Export notes
            let notes = sqlx::query_as::<_, crate::db::models::Note>(
                if request.include_archived {
                    "SELECT * FROM notes ORDER BY created_at"
                } else {
                    "SELECT * FROM notes WHERE archived_at IS NULL ORDER BY created_at"
                }
            )
            .fetch_all(&*state.db)
            .await?;
            total_items += notes.len();
            data["notes"] = serde_json::to_value(&notes)?;
            
            Ok(ExportResult {
                data,
                item_count: total_items,
                export_date: chrono::Utc::now(),
            })
        }
    }
}