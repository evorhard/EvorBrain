/// Task Tauri commands
use crate::database::Database;
use crate::database::models::task::{Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority};
use crate::database::utils::{to_datetime_utc, to_datetime_utc_opt, to_naive_datetime};
use tauri::State;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::Row;

/// Helper function to parse task priority from string
fn parse_task_priority(priority: &str) -> TaskPriority {
    match priority {
        "low" => TaskPriority::Low,
        "medium" => TaskPriority::Medium,
        "high" => TaskPriority::High,
        "critical" => TaskPriority::Critical,
        _ => TaskPriority::Medium,
    }
}

/// Helper function to convert task priority to string
fn task_priority_to_string(priority: &TaskPriority) -> &'static str {
    match priority {
        TaskPriority::Low => "low",
        TaskPriority::Medium => "medium",
        TaskPriority::High => "high",
        TaskPriority::Critical => "critical",
    }
}

/// Helper function to parse task status from string
fn parse_task_status(status: &str) -> TaskStatus {
    match status {
        "todo" => TaskStatus::Todo,
        "in_progress" => TaskStatus::InProgress,
        "completed" => TaskStatus::Completed,
        "cancelled" => TaskStatus::Cancelled,
        _ => TaskStatus::Todo,
    }
}

/// Helper function to convert task status to string
fn task_status_to_string(status: &TaskStatus) -> &'static str {
    match status {
        TaskStatus::Todo => "todo",
        TaskStatus::InProgress => "in_progress",
        TaskStatus::Completed => "completed",
        TaskStatus::Cancelled => "cancelled",
    }
}

/// Get all tasks
#[tauri::command]
pub async fn get_tasks(
    db: State<'_, Database>
) -> Result<Vec<Task>, String> {
    let rows = sqlx::query(
        r#"
        SELECT 
            id, project_id, name, description,
            due_date, completed_at, priority,
            status, estimated_minutes, actual_minutes,
            recurrence_rule, created_at, updated_at
        FROM tasks
        ORDER BY 
            CASE status
                WHEN 'todo' THEN 1
                WHEN 'in_progress' THEN 2
                WHEN 'completed' THEN 3
                WHEN 'cancelled' THEN 4
            END,
            CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END,
            due_date ASC NULLS LAST,
            name ASC
        "#
    )
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch tasks: {}", e))?;
    
    let tasks: Vec<Task> = rows.into_iter().map(|row| {
        let due_date_naive: Option<chrono::NaiveDateTime> = row.get("due_date");
        let completed_at_naive: Option<chrono::NaiveDateTime> = row.get("completed_at");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let priority_str: String = row.get("priority");
        let status_str: String = row.get("status");
        
        Task {
            id: row.get("id"),
            project_id: row.get("project_id"),
            name: row.get("name"),
            description: row.get("description"),
            due_date: to_datetime_utc_opt(due_date_naive.map(|dt| dt.date())),
            completed_at: completed_at_naive.map(|dt| DateTime::from_naive_utc_and_offset(dt, Utc)),
            priority: parse_task_priority(&priority_str),
            status: parse_task_status(&status_str),
            estimated_minutes: row.get::<Option<i64>, _>("estimated_minutes").map(|v| v as i32),
            actual_minutes: row.get::<Option<i64>, _>("actual_minutes").map(|v| v as i32),
            recurrence_rule: row.get("recurrence_rule"),
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(tasks)
}

/// Get tasks by project
#[tauri::command]
pub async fn get_tasks_by_project(
    db: State<'_, Database>,
    project_id: String
) -> Result<Vec<Task>, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&project_id)
        .map_err(|_| "Invalid project ID format")?;
    
    let rows = sqlx::query(
        r#"
        SELECT 
            id, project_id, name, description,
            due_date, completed_at, priority,
            status, estimated_minutes, actual_minutes,
            recurrence_rule, created_at, updated_at
        FROM tasks
        WHERE project_id = ?
        ORDER BY 
            CASE status
                WHEN 'todo' THEN 1
                WHEN 'in_progress' THEN 2
                WHEN 'completed' THEN 3
                WHEN 'cancelled' THEN 4
            END,
            CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END,
            due_date ASC NULLS LAST,
            name ASC
        "#
    )
    .bind(&project_id)
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch tasks for project: {}", e))?;
    
    let tasks: Vec<Task> = rows.into_iter().map(|row| {
        let due_date_naive: Option<chrono::NaiveDateTime> = row.get("due_date");
        let completed_at_naive: Option<chrono::NaiveDateTime> = row.get("completed_at");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let priority_str: String = row.get("priority");
        let status_str: String = row.get("status");
        
        Task {
            id: row.get("id"),
            project_id: row.get("project_id"),
            name: row.get("name"),
            description: row.get("description"),
            due_date: to_datetime_utc_opt(due_date_naive.map(|dt| dt.date())),
            completed_at: completed_at_naive.map(|dt| DateTime::from_naive_utc_and_offset(dt, Utc)),
            priority: parse_task_priority(&priority_str),
            status: parse_task_status(&status_str),
            estimated_minutes: row.get::<Option<i64>, _>("estimated_minutes").map(|v| v as i32),
            actual_minutes: row.get::<Option<i64>, _>("actual_minutes").map(|v| v as i32),
            recurrence_rule: row.get("recurrence_rule"),
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(tasks)
}

/// Get tasks due today
#[tauri::command]
pub async fn get_tasks_due_today(
    db: State<'_, Database>
) -> Result<Vec<Task>, String> {
    let today = Utc::now().naive_utc().date();
    
    let rows = sqlx::query(
        r#"
        SELECT 
            id, project_id, name, description,
            due_date, completed_at, priority,
            status, estimated_minutes, actual_minutes,
            recurrence_rule, created_at, updated_at
        FROM tasks
        WHERE DATE(due_date) = DATE(?)
        AND status IN ('todo', 'in_progress')
        ORDER BY 
            CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END,
            name ASC
        "#
    )
    .bind(today)
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch today's tasks: {}", e))?;
    
    let tasks: Vec<Task> = rows.into_iter().map(|row| {
        let due_date_naive: Option<chrono::NaiveDateTime> = row.get("due_date");
        let completed_at_naive: Option<chrono::NaiveDateTime> = row.get("completed_at");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let priority_str: String = row.get("priority");
        let status_str: String = row.get("status");
        
        Task {
            id: row.get("id"),
            project_id: row.get("project_id"),
            name: row.get("name"),
            description: row.get("description"),
            due_date: to_datetime_utc_opt(due_date_naive.map(|dt| dt.date())),
            completed_at: completed_at_naive.map(|dt| DateTime::from_naive_utc_and_offset(dt, Utc)),
            priority: parse_task_priority(&priority_str),
            status: parse_task_status(&status_str),
            estimated_minutes: row.get::<Option<i64>, _>("estimated_minutes").map(|v| v as i32),
            actual_minutes: row.get::<Option<i64>, _>("actual_minutes").map(|v| v as i32),
            recurrence_rule: row.get("recurrence_rule"),
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(tasks)
}

/// Get overdue tasks
#[tauri::command]
pub async fn get_overdue_tasks(
    db: State<'_, Database>
) -> Result<Vec<Task>, String> {
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    
    let rows = sqlx::query(
        r#"
        SELECT 
            id, project_id, name, description,
            due_date, completed_at, priority,
            status, estimated_minutes, actual_minutes,
            recurrence_rule, created_at, updated_at
        FROM tasks
        WHERE due_date < ?
        AND status IN ('todo', 'in_progress')
        ORDER BY 
            due_date ASC,
            CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END
        "#
    )
    .bind(naive_now)
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch overdue tasks: {}", e))?;
    
    let tasks: Vec<Task> = rows.into_iter().map(|row| {
        let due_date_naive: Option<chrono::NaiveDateTime> = row.get("due_date");
        let completed_at_naive: Option<chrono::NaiveDateTime> = row.get("completed_at");
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        let priority_str: String = row.get("priority");
        let status_str: String = row.get("status");
        
        Task {
            id: row.get("id"),
            project_id: row.get("project_id"),
            name: row.get("name"),
            description: row.get("description"),
            due_date: to_datetime_utc_opt(due_date_naive.map(|dt| dt.date())),
            completed_at: completed_at_naive.map(|dt| DateTime::from_naive_utc_and_offset(dt, Utc)),
            priority: parse_task_priority(&priority_str),
            status: parse_task_status(&status_str),
            estimated_minutes: row.get::<Option<i64>, _>("estimated_minutes").map(|v| v as i32),
            actual_minutes: row.get::<Option<i64>, _>("actual_minutes").map(|v| v as i32),
            recurrence_rule: row.get("recurrence_rule"),
            created_at: to_datetime_utc(created_at_naive),
            updated_at: to_datetime_utc(updated_at_naive),
        }
    }).collect();
    
    Ok(tasks)
}

/// Get a single task by ID
#[tauri::command]
pub async fn get_task(
    db: State<'_, Database>,
    id: String
) -> Result<Task, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid task ID format")?;
    
    let row = sqlx::query(
        r#"
        SELECT 
            id, project_id, name, description,
            due_date, completed_at, priority,
            status, estimated_minutes, actual_minutes,
            recurrence_rule, created_at, updated_at
        FROM tasks
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_one(db.pool())
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => format!("Task with ID {} not found", id),
        _ => format!("Failed to fetch task: {}", e)
    })?;
    
    let due_date_naive: Option<chrono::NaiveDateTime> = row.get("due_date");
    let completed_at_naive: Option<chrono::NaiveDateTime> = row.get("completed_at");
    let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
    let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
    let priority_str: String = row.get("priority");
    let status_str: String = row.get("status");
    
    Ok(Task {
        id: row.get("id"),
        project_id: row.get("project_id"),
        name: row.get("name"),
        description: row.get("description"),
        due_date: to_datetime_utc_opt(due_date_naive.map(|dt| dt.date())),
        completed_at: completed_at_naive.map(|dt| DateTime::from_naive_utc_and_offset(dt, Utc)),
        priority: parse_task_priority(&priority_str),
        status: parse_task_status(&status_str),
        estimated_minutes: row.get::<Option<i64>, _>("estimated_minutes").map(|v| v as i32),
        actual_minutes: row.get::<Option<i64>, _>("actual_minutes").map(|v| v as i32),
        recurrence_rule: row.get("recurrence_rule"),
        created_at: to_datetime_utc(created_at_naive),
        updated_at: to_datetime_utc(updated_at_naive),
    })
}

/// Create a new task
#[tauri::command]
pub async fn create_task(
    db: State<'_, Database>,
    dto: CreateTaskDto
) -> Result<Task, String> {
    // Validate input
    if dto.name.trim().is_empty() {
        return Err("Task name cannot be empty".to_string());
    }
    
    if dto.name.len() > 200 {
        return Err("Task name cannot exceed 200 characters".to_string());
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 1000 {
            return Err("Description cannot exceed 1000 characters".to_string());
        }
    }
    
    // Validate project ID
    let _ = Uuid::parse_str(&dto.project_id)
        .map_err(|_| "Invalid project ID format")?;
    
    // Check if project exists
    let project_exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM projects WHERE id = ?")
        .bind(&dto.project_id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check project existence: {}", e))?;
    
    if project_exists == 0 {
        return Err("Project not found".to_string());
    }
    
    // Validate estimated minutes if provided
    if let Some(minutes) = dto.estimated_minutes {
        if minutes < 0 {
            return Err("Estimated minutes cannot be negative".to_string());
        }
        if minutes > 10080 { // 1 week in minutes
            return Err("Estimated minutes cannot exceed 1 week (10080 minutes)".to_string());
        }
    }
    
    // Validate recurrence rule if provided
    if let Some(ref rrule) = dto.recurrence_rule {
        if rrule.len() > 500 {
            return Err("Recurrence rule too long".to_string());
        }
        // TODO: Add proper RRULE validation
    }
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    let naive_due_date = dto.due_date.map(|d| to_naive_datetime(d));
    let priority_str = task_priority_to_string(&dto.priority);
    
    sqlx::query(
        r#"
        INSERT INTO tasks (
            id, project_id, name, description,
            due_date, priority, status, estimated_minutes,
            recurrence_rule, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(&dto.project_id)
    .bind(dto.name.trim())
    .bind(&dto.description)
    .bind(naive_due_date)
    .bind(priority_str)
    .bind(dto.estimated_minutes)
    .bind(&dto.recurrence_rule)
    .bind(naive_now)
    .bind(naive_now)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to create task: {}", e))?;
    
    // Fetch and return the created task
    get_task(db, id).await
}

/// Update an existing task
#[tauri::command]
pub async fn update_task(
    db: State<'_, Database>,
    id: String,
    dto: UpdateTaskDto
) -> Result<Task, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid task ID format")?;
    
    // Validate input if provided
    if let Some(ref name) = dto.name {
        if name.trim().is_empty() {
            return Err("Task name cannot be empty".to_string());
        }
        if name.len() > 200 {
            return Err("Task name cannot exceed 200 characters".to_string());
        }
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 1000 {
            return Err("Description cannot exceed 1000 characters".to_string());
        }
    }
    
    if let Some(minutes) = dto.estimated_minutes {
        if minutes < 0 {
            return Err("Estimated minutes cannot be negative".to_string());
        }
        if minutes > 10080 {
            return Err("Estimated minutes cannot exceed 1 week (10080 minutes)".to_string());
        }
    }
    
    if let Some(minutes) = dto.actual_minutes {
        if minutes < 0 {
            return Err("Actual minutes cannot be negative".to_string());
        }
    }
    
    // Check if the task exists
    let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM tasks WHERE id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check task existence: {}", e))?;
    
    if exists == 0 {
        return Err(format!("Task with ID {} not found", id));
    }
    
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    
    // Update fields individually
    if let Some(name) = dto.name {
        sqlx::query("UPDATE tasks SET name = ?, updated_at = ? WHERE id = ?")
            .bind(name.trim())
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update name: {}", e))?;
    }
    
    if let Some(description) = dto.description {
        sqlx::query("UPDATE tasks SET description = ?, updated_at = ? WHERE id = ?")
            .bind(description)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update description: {}", e))?;
    }
    
    if let Some(due_date) = dto.due_date {
        let naive_due_date = to_naive_datetime(due_date);
        sqlx::query("UPDATE tasks SET due_date = ?, updated_at = ? WHERE id = ?")
            .bind(naive_due_date)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update due date: {}", e))?;
    }
    
    if let Some(priority) = dto.priority {
        let priority_str = task_priority_to_string(&priority);
        sqlx::query("UPDATE tasks SET priority = ?, updated_at = ? WHERE id = ?")
            .bind(priority_str)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update priority: {}", e))?;
    }
    
    // Track if status was updated
    let status_updated = dto.status.is_some();
    
    if let Some(status) = dto.status {
        // If status is being set to completed, update completed_at
        let completed_at = if status == TaskStatus::Completed {
            Some(naive_now)
        } else {
            None
        };
        
        let status_str = task_status_to_string(&status);
        sqlx::query("UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?")
            .bind(status_str)
            .bind(completed_at)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update status: {}", e))?;
    }
    
    if let Some(estimated_minutes) = dto.estimated_minutes {
        sqlx::query("UPDATE tasks SET estimated_minutes = ?, updated_at = ? WHERE id = ?")
            .bind(estimated_minutes)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update estimated minutes: {}", e))?;
    }
    
    if let Some(actual_minutes) = dto.actual_minutes {
        sqlx::query("UPDATE tasks SET actual_minutes = ?, updated_at = ? WHERE id = ?")
            .bind(actual_minutes)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update actual minutes: {}", e))?;
    }
    
    if let Some(recurrence_rule) = dto.recurrence_rule {
        sqlx::query("UPDATE tasks SET recurrence_rule = ?, updated_at = ? WHERE id = ?")
            .bind(recurrence_rule)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update recurrence rule: {}", e))?;
    }
    
    // Update project progress if task status changed
    if status_updated {
        let project_id: Option<String> = sqlx::query_scalar("SELECT project_id FROM tasks WHERE id = ?")
            .bind(&id)
            .fetch_one(db.pool())
            .await
            .map_err(|e| format!("Failed to get project ID: {}", e))?;
        
        if let Some(project_id) = project_id {
            // Trigger project progress update (without waiting for result)
            let _ = update_project_progress(db.clone(), project_id);
        }
    }
    
    // Fetch and return the updated task
    get_task(db, id).await
}

/// Delete a task
#[tauri::command]
pub async fn delete_task(
    db: State<'_, Database>,
    id: String
) -> Result<(), String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid task ID format")?;
    
    // Get project ID before deletion for progress update
    let project_id: Option<String> = sqlx::query_scalar("SELECT project_id FROM tasks WHERE id = ?")
        .bind(&id)
        .fetch_optional(db.pool())
        .await
        .map_err(|e| format!("Failed to get project ID: {}", e))?;
    
    // Delete the task
    let result = sqlx::query("DELETE FROM tasks WHERE id = ?")
        .bind(&id)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to delete task: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Task with ID {} not found", id));
    }
    
    // Update project progress after deletion
    if let Some(project_id) = project_id {
        let _ = update_project_progress(db.clone(), project_id);
    }
    
    Ok(())
}

/// Toggle task completion status
#[tauri::command]
pub async fn toggle_task_complete(
    db: State<'_, Database>,
    id: String
) -> Result<Task, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid task ID format")?;
    
    // Get current status
    let current_status: Option<String> = sqlx::query_scalar("SELECT status FROM tasks WHERE id = ?")
        .bind(&id)
        .fetch_optional(db.pool())
        .await
        .map_err(|e| format!("Failed to get task status: {}", e))?;
    
    match current_status {
        Some(status) => {
            let new_status = if status == "completed" {
                TaskStatus::Todo
            } else {
                TaskStatus::Completed
            };
            
            update_task(db, id, UpdateTaskDto {
                status: Some(new_status),
                ..Default::default()
            }).await
        }
        None => Err(format!("Task with ID {} not found", id))
    }
}

/// Bulk update tasks (e.g., move to different project)
#[tauri::command]
pub async fn bulk_update_tasks(
    db: State<'_, Database>,
    ids: Vec<String>,
    project_id: Option<String>,
    status: Option<TaskStatus>,
    priority: Option<TaskPriority>
) -> Result<usize, String> {
    // Validate all IDs
    for id in &ids {
        let _ = Uuid::parse_str(id)
            .map_err(|_| format!("Invalid task ID format: {}", id))?;
    }
    
    // Validate project ID if provided
    if let Some(ref pid) = project_id {
        let _ = Uuid::parse_str(pid)
            .map_err(|_| "Invalid project ID format")?;
        
        // Check if project exists
        let project_exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM projects WHERE id = ?")
            .bind(pid)
            .fetch_one(db.pool())
            .await
            .map_err(|e| format!("Failed to check project existence: {}", e))?;
        
        if project_exists == 0 {
            return Err("Project not found".to_string());
        }
    }
    
    let now = Utc::now();
    let naive_now = to_naive_datetime(now);
    let mut affected_projects = std::collections::HashSet::new();
    let mut updated_count = 0;
    
    // Update each task
    for id in ids {
        // Get current project for progress update
        if project_id.is_some() || status.is_some() {
            let current_project: Option<String> = sqlx::query_scalar("SELECT project_id FROM tasks WHERE id = ?")
                .bind(&id)
                .fetch_optional(db.pool())
                .await
                .map_err(|e| format!("Failed to get project ID: {}", e))?;
            
            if let Some(pid) = current_project {
                affected_projects.insert(pid);
            }
        }
        
        // Update fields
        if let Some(ref pid) = project_id {
            sqlx::query("UPDATE tasks SET project_id = ?, updated_at = ? WHERE id = ?")
                .bind(pid)
                .bind(naive_now)
                .bind(&id)
                .execute(db.pool())
                .await
                .map_err(|e| format!("Failed to update project for task {}: {}", id, e))?;
            
            affected_projects.insert(pid.clone());
        }
        
        if let Some(ref s) = status {
            let status_str = task_status_to_string(s);
            let completed_at = if s == &TaskStatus::Completed {
                Some(naive_now)
            } else {
                None
            };
            
            sqlx::query("UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?")
                .bind(status_str)
                .bind(completed_at)
                .bind(naive_now)
                .bind(&id)
                .execute(db.pool())
                .await
                .map_err(|e| format!("Failed to update status for task {}: {}", id, e))?;
        }
        
        if let Some(ref p) = priority {
            let priority_str = task_priority_to_string(p);
            sqlx::query("UPDATE tasks SET priority = ?, updated_at = ? WHERE id = ?")
                .bind(priority_str)
                .bind(naive_now)
                .bind(&id)
                .execute(db.pool())
                .await
                .map_err(|e| format!("Failed to update priority for task {}: {}", id, e))?;
        }
        
        updated_count += 1;
    }
    
    // Update progress for all affected projects
    for project_id in affected_projects {
        let _ = update_project_progress(db.clone(), project_id);
    }
    
    Ok(updated_count)
}

// Import the function from projects module
use crate::commands::projects::update_project_progress;