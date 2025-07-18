/// Goal Tauri commands
use crate::database::Database;
use crate::database::models::goal::{Goal, CreateGoalDto, UpdateGoalDto, GoalStatus};
use crate::database::utils::{to_datetime_utc, to_datetime_utc_opt, to_naive_datetime};
use tauri::State;
use uuid::Uuid;
use chrono::Utc;
use sqlx::Row;

/// Helper function to parse goal status from string
fn parse_goal_status(status: &str) -> GoalStatus {
    match status {
        "active" => GoalStatus::Active,
        "completed" => GoalStatus::Completed,
        "paused" => GoalStatus::Paused,
        "cancelled" => GoalStatus::Cancelled,
        _ => GoalStatus::Active,
    }
}

/// Helper function to convert goal status to string
fn goal_status_to_string(status: &GoalStatus) -> &'static str {
    match status {
        GoalStatus::Active => "active",
        GoalStatus::Completed => "completed",
        GoalStatus::Paused => "paused",
        GoalStatus::Cancelled => "cancelled",
    }
}

/// Get all goals
#[tauri::command]
pub async fn get_goals(
    db: State<'_, Database>
) -> Result<Vec<Goal>, String> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id, life_area_id, name, description,
            target_date, status, progress, created_at, updated_at
        FROM goals
        ORDER BY 
            CASE status
                WHEN 'active' THEN 1
                WHEN 'planned' THEN 2
                WHEN 'completed' THEN 3
                WHEN 'archived' THEN 4
            END,
            target_date ASC NULLS LAST,
            name ASC
        "#
    )
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch goals: {}", e))?;
    
    let goals: Vec<Goal> = rows.into_iter().map(|row| {
        let target_date_naive: Option<chrono::NaiveDate> = row.get("target_date");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let status_str: String = row.get("status");
        
        Goal {
            id: row.get("id"),
            life_area_id: row.get("life_area_id"),
            name: row.get("name"),
            description: row.get("description"),
            target_date: to_datetime_utc_opt(target_date_naive),
            status: parse_goal_status(&status_str),
            progress: row.get::<i64, _>("progress") as i32,
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(goals)
}

/// Get goals by life area
#[tauri::command]
pub async fn get_goals_by_life_area(
    db: State<'_, Database>,
    life_area_id: String
) -> Result<Vec<Goal>, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&life_area_id)
        .map_err(|_| "Invalid life area ID format")?;
    
    let rows = sqlx::query(
        r#"
        SELECT 
            id, life_area_id, name, description,
            target_date, status, progress, created_at, updated_at
        FROM goals
        WHERE life_area_id = ?
        ORDER BY 
            CASE status
                WHEN 'active' THEN 1
                WHEN 'planned' THEN 2
                WHEN 'completed' THEN 3
                WHEN 'archived' THEN 4
            END,
            target_date ASC NULLS LAST,
            name ASC
        "#
    )
    .bind(&life_area_id)
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch goals for life area: {}", e))?;
    
    let goals: Vec<Goal> = rows.into_iter().map(|row| {
        let target_date_naive: Option<chrono::NaiveDate> = row.get("target_date");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let status_str: String = row.get("status");
        
        Goal {
            id: row.get("id"),
            life_area_id: row.get("life_area_id"),
            name: row.get("name"),
            description: row.get("description"),
            target_date: to_datetime_utc_opt(target_date_naive),
            status: parse_goal_status(&status_str),
            progress: row.get::<i64, _>("progress") as i32,
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(goals)
}

/// Get a single goal by ID
#[tauri::command]
pub async fn get_goal(
    db: State<'_, Database>,
    id: String
) -> Result<Goal, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid goal ID format")?;
    
    let row = sqlx::query(
        r#"
        SELECT 
            id, life_area_id, name, description,
            target_date, status, progress, created_at, updated_at
        FROM goals
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_one(db.pool())
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => format!("Goal with ID {} not found", id),
        _ => format!("Failed to fetch goal: {}", e)
    })?;
    
    let target_date_naive: Option<chrono::NaiveDate> = row.get("target_date");
    let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
    let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
    let status_str: String = row.get("status");
    
    Ok(Goal {
        id: row.get("id"),
        life_area_id: row.get("life_area_id"),
        name: row.get("name"),
        description: row.get("description"),
        target_date: to_datetime_utc_opt(target_date_naive),
        status: parse_goal_status(&status_str),
        progress: row.get::<i64, _>("progress") as i32,
        created_at: to_datetime_utc(created_at_naive),
        updated_at: to_datetime_utc(updated_at_naive),
    })
}

/// Create a new goal
#[tauri::command]
pub async fn create_goal(
    db: State<'_, Database>,
    dto: CreateGoalDto
) -> Result<Goal, String> {
    // Validate input
    if dto.name.trim().is_empty() {
        return Err("Goal name cannot be empty".to_string());
    }
    
    if dto.name.len() > 100 {
        return Err("Goal name cannot exceed 100 characters".to_string());
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 500 {
            return Err("Description cannot exceed 500 characters".to_string());
        }
    }
    
    // Validate life area ID
    let _ = Uuid::parse_str(&dto.life_area_id)
        .map_err(|_| "Invalid life area ID format")?;
    
    // Check if life area exists
    let life_area_exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM life_areas WHERE id = ?")
        .bind(&dto.life_area_id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check life area existence: {}", e))?;
    
    if life_area_exists == 0 {
        return Err("Life area not found".to_string());
    }
    
    // Validate target date if provided
    if let Some(target_date) = dto.target_date {
        if target_date < Utc::now() {
            return Err("Target date cannot be in the past".to_string());
        }
    }
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    let naive_target_date = dto.target_date.map(|d| d.naive_utc().date());
    let status_str = goal_status_to_string(&dto.status);
    
    sqlx::query(
        r#"
        INSERT INTO goals (
            id, life_area_id, name, description,
            target_date, status, progress, 
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(&dto.life_area_id)
    .bind(dto.name.trim())
    .bind(&dto.description)
    .bind(naive_target_date)
    .bind(status_str)
    .bind(0i32) // Initial progress is 0
    .bind(naive_now)
    .bind(naive_now)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to create goal: {}", e))?;
    
    // Fetch and return the created goal
    get_goal(db, id).await
}

/// Update an existing goal
#[tauri::command]
pub async fn update_goal(
    db: State<'_, Database>,
    id: String,
    dto: UpdateGoalDto
) -> Result<Goal, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid goal ID format")?;
    
    // Validate input if provided
    if let Some(ref name) = dto.name {
        if name.trim().is_empty() {
            return Err("Goal name cannot be empty".to_string());
        }
        if name.len() > 100 {
            return Err("Goal name cannot exceed 100 characters".to_string());
        }
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 500 {
            return Err("Description cannot exceed 500 characters".to_string());
        }
    }
    
    if let Some(ref life_area_id) = dto.life_area_id {
        let _ = Uuid::parse_str(life_area_id)
            .map_err(|_| "Invalid life area ID format")?;
        
        // Check if new life area exists
        let life_area_exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM life_areas WHERE id = ?")
            .bind(life_area_id)
            .fetch_one(db.pool())
            .await
            .map_err(|e| format!("Failed to check life area existence: {}", e))?;
        
        if life_area_exists == 0 {
            return Err("Life area not found".to_string());
        }
    }
    
    // Check if the goal exists
    let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM goals WHERE id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check goal existence: {}", e))?;
    
    if exists == 0 {
        return Err(format!("Goal with ID {} not found", id));
    }
    
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    
    // Update fields individually to avoid complex dynamic queries
    if let Some(name) = dto.name {
        sqlx::query("UPDATE goals SET name = ?, updated_at = ? WHERE id = ?")
            .bind(name.trim())
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update name: {}", e))?;
    }
    
    if let Some(description) = dto.description {
        sqlx::query("UPDATE goals SET description = ?, updated_at = ? WHERE id = ?")
            .bind(description)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update description: {}", e))?;
    }
    
    if let Some(life_area_id) = dto.life_area_id {
        sqlx::query("UPDATE goals SET life_area_id = ?, updated_at = ? WHERE id = ?")
            .bind(life_area_id)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update life area: {}", e))?;
    }
    
    if let Some(target_date) = dto.target_date {
        let naive_target_date = target_date.naive_utc().date();
        sqlx::query("UPDATE goals SET target_date = ?, updated_at = ? WHERE id = ?")
            .bind(naive_target_date)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update target date: {}", e))?;
    }
    
    if let Some(status) = dto.status {
        let status_str = goal_status_to_string(&status);
        sqlx::query("UPDATE goals SET status = ?, updated_at = ? WHERE id = ?")
            .bind(status_str)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update status: {}", e))?;
    }
    
    // Fetch and return the updated goal
    get_goal(db, id).await
}

/// Delete a goal
#[tauri::command]
pub async fn delete_goal(
    db: State<'_, Database>,
    id: String
) -> Result<(), String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid goal ID format")?;
    
    // Check if there are any projects associated with this goal
    let project_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM projects WHERE goal_id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check associated projects: {}", e))?;
    
    if project_count > 0 {
        return Err(format!(
            "Cannot delete goal: {} projects are still associated with it. Please delete or reassign them first.",
            project_count
        ));
    }
    
    // Delete the goal
    let result = sqlx::query("DELETE FROM goals WHERE id = ?")
        .bind(&id)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to delete goal: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Goal with ID {} not found", id));
    }
    
    Ok(())
}

/// Update goal progress based on associated projects
#[tauri::command]
pub async fn update_goal_progress(
    db: State<'_, Database>,
    id: String
) -> Result<Goal, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid goal ID format")?;
    
    // Calculate progress based on associated projects
    let progress: Option<f64> = sqlx::query_scalar(
        r#"
        SELECT 
            CAST(AVG(progress) AS REAL) as progress
        FROM projects
        WHERE goal_id = ?
        "#
    )
    .bind(&id)
    .fetch_one(db.pool())
    .await
    .map_err(|e| format!("Failed to calculate goal progress: {}", e))?;
    
    let progress_percentage = progress.unwrap_or(0.0) as i32;
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    
    // Update the goal's progress
    sqlx::query("UPDATE goals SET progress = ?, updated_at = ? WHERE id = ?")
        .bind(progress_percentage)
        .bind(naive_now)
        .bind(&id)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to update goal progress: {}", e))?;
    
    // Fetch and return the updated goal
    get_goal(db, id).await
}