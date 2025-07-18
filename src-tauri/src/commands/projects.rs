/// Project Tauri commands
use crate::database::Database;
use crate::database::models::project::{Project, CreateProjectDto, UpdateProjectDto, ProjectStatus};
use crate::database::utils::{to_datetime_utc, to_datetime_utc_opt, to_naive_datetime};
use tauri::State;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::Row;

/// Helper function to parse project status from string
fn parse_project_status(status: &str) -> ProjectStatus {
    match status {
        "planning" => ProjectStatus::Planning,
        "active" => ProjectStatus::Active,
        "completed" => ProjectStatus::Completed,
        "on_hold" => ProjectStatus::OnHold,
        "cancelled" => ProjectStatus::Cancelled,
        _ => ProjectStatus::Planning,
    }
}

/// Helper function to convert project status to string
fn project_status_to_string(status: &ProjectStatus) -> &'static str {
    match status {
        ProjectStatus::Planning => "planning",
        ProjectStatus::Active => "active",
        ProjectStatus::Completed => "completed",
        ProjectStatus::OnHold => "on_hold",
        ProjectStatus::Cancelled => "cancelled",
    }
}

/// Get all projects
#[tauri::command]
pub async fn get_projects(
    db: State<'_, Database>
) -> Result<Vec<Project>, String> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id, goal_id, name, description,
            start_date, due_date, status,
            progress, created_at, updated_at
        FROM projects
        ORDER BY 
            CASE status
                WHEN 'active' THEN 1
                WHEN 'planned' THEN 2
                WHEN 'on_hold' THEN 3
                WHEN 'completed' THEN 4
                WHEN 'cancelled' THEN 5
            END,
            start_date ASC NULLS LAST,
            name ASC
        "#
    )
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch projects: {}", e))?;
    
    let projects: Vec<Project> = rows.into_iter().map(|row| {
        let start_date_naive: Option<chrono::NaiveDate> = row.get("start_date");
        let due_date_naive: Option<chrono::NaiveDate> = row.get("due_date");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let status_str: String = row.get("status");
        
        Project {
            id: row.get("id"),
            goal_id: row.get("goal_id"),
            name: row.get("name"),
            description: row.get("description"),
            start_date: to_datetime_utc_opt(start_date_naive),
            due_date: to_datetime_utc_opt(due_date_naive),
            status: parse_project_status(&status_str),
            progress: row.get::<i64, _>("progress") as i32,
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(projects)
}

/// Get projects by goal
#[tauri::command]
pub async fn get_projects_by_goal(
    db: State<'_, Database>,
    goal_id: String
) -> Result<Vec<Project>, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&goal_id)
        .map_err(|_| "Invalid goal ID format")?;
    
    let rows = sqlx::query(
        r#"
        SELECT 
            id, goal_id, name, description,
            start_date, due_date, status,
            progress, created_at, updated_at
        FROM projects
        WHERE goal_id = ?
        ORDER BY 
            CASE status
                WHEN 'active' THEN 1
                WHEN 'planned' THEN 2
                WHEN 'on_hold' THEN 3
                WHEN 'completed' THEN 4
                WHEN 'cancelled' THEN 5
            END,
            start_date ASC NULLS LAST,
            name ASC
        "#
    )
    .bind(&goal_id)
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch projects for goal: {}", e))?;
    
    let projects: Vec<Project> = rows.into_iter().map(|row| {
        let start_date_naive: Option<chrono::NaiveDate> = row.get("start_date");
        let due_date_naive: Option<chrono::NaiveDate> = row.get("due_date");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let status_str: String = row.get("status");
        
        Project {
            id: row.get("id"),
            goal_id: row.get("goal_id"),
            name: row.get("name"),
            description: row.get("description"),
            start_date: to_datetime_utc_opt(start_date_naive),
            due_date: to_datetime_utc_opt(due_date_naive),
            status: parse_project_status(&status_str),
            progress: row.get::<i64, _>("progress") as i32,
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(projects)
}

/// Get a single project by ID
#[tauri::command]
pub async fn get_project(
    db: State<'_, Database>,
    id: String
) -> Result<Project, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid project ID format")?;
    
    let row = sqlx::query(
        r#"
        SELECT 
            id, goal_id, name, description,
            start_date, due_date, status,
            progress, created_at, updated_at
        FROM projects
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_one(db.pool())
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => format!("Project with ID {} not found", id),
        _ => format!("Failed to fetch project: {}", e)
    })?;
    
    let start_date_naive: Option<chrono::NaiveDate> = row.get("start_date");
    let due_date_naive: Option<chrono::NaiveDate> = row.get("due_date");
    let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
    let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
    let status_str: String = row.get("status");
    
    Ok(Project {
        id: row.get("id"),
        goal_id: row.get("goal_id"),
        name: row.get("name"),
        description: row.get("description"),
        start_date: to_datetime_utc_opt(start_date_naive),
        due_date: to_datetime_utc_opt(due_date_naive),
        status: parse_project_status(&status_str),
        progress: row.get::<i64, _>("progress") as i32,
        created_at: to_datetime_utc(created_at_naive),
        updated_at: to_datetime_utc(updated_at_naive),
    })
}

/// Create a new project
#[tauri::command]
pub async fn create_project(
    db: State<'_, Database>,
    dto: CreateProjectDto
) -> Result<Project, String> {
    // Validate input
    if dto.name.trim().is_empty() {
        return Err("Project name cannot be empty".to_string());
    }
    
    if dto.name.len() > 100 {
        return Err("Project name cannot exceed 100 characters".to_string());
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 500 {
            return Err("Description cannot exceed 500 characters".to_string());
        }
    }
    
    // Validate goal ID
    let _ = Uuid::parse_str(&dto.goal_id)
        .map_err(|_| "Invalid goal ID format")?;
    
    // Check if goal exists
    let goal_exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM goals WHERE id = ?")
        .bind(&dto.goal_id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check goal existence: {}", e))?;
    
    if goal_exists == 0 {
        return Err("Goal not found".to_string());
    }
    
    // Validate date range if both dates are provided
    if let (Some(start), Some(end)) = (dto.start_date, dto.due_date) {
        if end < start {
            return Err("End date must be after start date".to_string());
        }
    }
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    let naive_start_date = dto.start_date.map(|d| d.naive_utc().date());
    let naive_due_date = dto.due_date.map(|d| d.naive_utc().date());
    let status_str = project_status_to_string(&dto.status);
    
    sqlx::query(
        r#"
        INSERT INTO projects (
            id, goal_id, name, description,
            start_date, due_date, status, progress,
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(&dto.goal_id)
    .bind(dto.name.trim())
    .bind(&dto.description)
    .bind(naive_start_date)
    .bind(naive_due_date)
    .bind(status_str)
    .bind(0i32) // Initial progress is 0
    .bind(naive_now)
    .bind(naive_now)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to create project: {}", e))?;
    
    // Fetch and return the created project
    get_project(db, id).await
}

/// Update an existing project
#[tauri::command]
pub async fn update_project(
    db: State<'_, Database>,
    id: String,
    dto: UpdateProjectDto
) -> Result<Project, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid project ID format")?;
    
    // Validate input if provided
    if let Some(ref name) = dto.name {
        if name.trim().is_empty() {
            return Err("Project name cannot be empty".to_string());
        }
        if name.len() > 100 {
            return Err("Project name cannot exceed 100 characters".to_string());
        }
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 500 {
            return Err("Description cannot exceed 500 characters".to_string());
        }
    }
    
    if let Some(ref goal_id) = dto.goal_id {
        let _ = Uuid::parse_str(goal_id)
            .map_err(|_| "Invalid goal ID format")?;
        
        // Check if new goal exists
        let goal_exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM goals WHERE id = ?")
            .bind(goal_id)
            .fetch_one(db.pool())
            .await
            .map_err(|e| format!("Failed to check goal existence: {}", e))?;
        
        if goal_exists == 0 {
            return Err("Goal not found".to_string());
        }
    }
    
    // Validate date range if updating dates
    if dto.start_date.is_some() || dto.due_date.is_some() {
        // Get current dates
        let current = sqlx::query(
            "SELECT start_date, due_date FROM projects WHERE id = ?"
        )
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to fetch current project dates: {}", e))?;
        
        let current_start: Option<chrono::NaiveDate> = current.get("start_date");
        let current_due: Option<chrono::NaiveDate> = current.get("due_date");
        
        let start = dto.start_date.or(current_start.map(|d| DateTime::from_naive_utc_and_offset(d.and_hms_opt(0, 0, 0).unwrap(), Utc)));
        let end = dto.due_date.or(current_due.map(|d| DateTime::from_naive_utc_and_offset(d.and_hms_opt(0, 0, 0).unwrap(), Utc)));
        
        if let (Some(s), Some(e)) = (start, end) {
            if e < s {
                return Err("End date must be after start date".to_string());
            }
        }
    }
    
    // Check if the project exists
    let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM projects WHERE id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check project existence: {}", e))?;
    
    if exists == 0 {
        return Err(format!("Project with ID {} not found", id));
    }
    
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    
    // Update fields individually
    if let Some(name) = dto.name {
        sqlx::query("UPDATE projects SET name = ?, updated_at = ? WHERE id = ?")
            .bind(name.trim())
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update name: {}", e))?;
    }
    
    if let Some(description) = dto.description {
        sqlx::query("UPDATE projects SET description = ?, updated_at = ? WHERE id = ?")
            .bind(description)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update description: {}", e))?;
    }
    
    if let Some(goal_id) = dto.goal_id {
        sqlx::query("UPDATE projects SET goal_id = ?, updated_at = ? WHERE id = ?")
            .bind(goal_id)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update goal: {}", e))?;
    }
    
    if let Some(start_date) = dto.start_date {
        let naive_start_date = start_date.naive_utc().date();
        sqlx::query("UPDATE projects SET start_date = ?, updated_at = ? WHERE id = ?")
            .bind(naive_start_date)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update start date: {}", e))?;
    }
    
    if let Some(due_date) = dto.due_date {
        let naive_due_date = due_date.naive_utc().date();
        sqlx::query("UPDATE projects SET due_date = ?, updated_at = ? WHERE id = ?")
            .bind(naive_due_date)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update end date: {}", e))?;
    }
    
    if let Some(status) = dto.status {
        let status_str = project_status_to_string(&status);
        sqlx::query("UPDATE projects SET status = ?, updated_at = ? WHERE id = ?")
            .bind(status_str)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update status: {}", e))?;
    }
    
    // Fetch and return the updated project
    get_project(db, id).await
}

/// Delete a project
#[tauri::command]
pub async fn delete_project(
    db: State<'_, Database>,
    id: String
) -> Result<(), String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid project ID format")?;
    
    // Check if there are any tasks associated with this project
    let task_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM tasks WHERE project_id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check associated tasks: {}", e))?;
    
    if task_count > 0 {
        return Err(format!(
            "Cannot delete project: {} tasks are still associated with it. Please delete or reassign them first.",
            task_count
        ));
    }
    
    // Delete the project
    let result = sqlx::query("DELETE FROM projects WHERE id = ?")
        .bind(&id)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to delete project: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Project with ID {} not found", id));
    }
    
    Ok(())
}

/// Update project progress based on associated tasks
#[tauri::command]
pub async fn update_project_progress(
    db: State<'_, Database>,
    id: String
) -> Result<Project, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid project ID format")?;
    
    // Calculate progress based on associated tasks
    let task_stats = sqlx::query(
        r#"
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM tasks
        WHERE project_id = ?
        "#
    )
    .bind(&id)
    .fetch_one(db.pool())
    .await
    .map_err(|e| format!("Failed to calculate project progress: {}", e))?;
    
    let total: i64 = task_stats.get("total");
    let completed: i64 = task_stats.get("completed");
    
    let progress_percentage = if total > 0 {
        ((completed as f64 / total as f64) * 100.0) as i32
    } else {
        0
    };
    
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    
    // Update the project's progress
    sqlx::query("UPDATE projects SET progress = ?, updated_at = ? WHERE id = ?")
        .bind(progress_percentage)
        .bind(naive_now)
        .bind(&id)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to update project progress: {}", e))?;
    
    // Also update the parent goal's progress
    let goal_id: Option<String> = sqlx::query_scalar("SELECT goal_id FROM projects WHERE id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to get goal ID: {}", e))?;
    
    if let Some(goal_id) = goal_id {
        // Trigger goal progress update (without waiting for result)
        let _ = update_goal_progress(db.clone(), goal_id);
    }
    
    // Fetch and return the updated project
    get_project(db, id).await
}

// Import the function from goals module
use crate::commands::goals::update_goal_progress;