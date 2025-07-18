/// Life Area Tauri commands
use crate::database::Database;
use crate::database::models::life_area::{LifeArea, CreateLifeAreaDto, UpdateLifeAreaDto};
use tauri::State;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Get all life areas
#[tauri::command]
pub async fn get_life_areas(
    db: State<'_, Database>
) -> Result<Vec<LifeArea>, String> {
    use sqlx::Row;
    
    let rows = sqlx::query(
        r#"
        SELECT 
            id, name, description, color, icon,
            sort_order, created_at, updated_at
        FROM life_areas
        ORDER BY sort_order ASC, name ASC
        "#
    )
    .fetch_all(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch life areas: {}", e))?;
    
    let life_areas: Vec<LifeArea> = rows.into_iter().map(|row| {
        let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
        let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
        
        LifeArea {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            color: row.get("color"),
            icon: row.get("icon"),
            order_index: row.get::<i64, _>("sort_order") as i32,
            created_at: DateTime::from_naive_utc_and_offset(
                created_at_naive.unwrap_or_else(|| Utc::now().naive_utc()), 
                Utc
            ),
            updated_at: DateTime::from_naive_utc_and_offset(
                updated_at_naive.unwrap_or_else(|| Utc::now().naive_utc()), 
                Utc
            ),
        }
    }).collect();
    
    Ok(life_areas)
}

/// Get a single life area by ID
#[tauri::command]
pub async fn get_life_area(
    db: State<'_, Database>,
    id: String
) -> Result<LifeArea, String> {
    use sqlx::Row;
    
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid life area ID format")?;
    
    let row = sqlx::query(
        r#"
        SELECT 
            id, name, description, color, icon,
            sort_order, created_at, updated_at
        FROM life_areas
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_one(db.pool())
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => format!("Life area with ID {} not found", id),
        _ => format!("Failed to fetch life area: {}", e)
    })?;
    
    let created_at_naive: Option<chrono::NaiveDateTime> = row.get("created_at");
    let updated_at_naive: Option<chrono::NaiveDateTime> = row.get("updated_at");
    
    Ok(LifeArea {
        id: row.get("id"),
        name: row.get("name"),
        description: row.get("description"),
        color: row.get("color"),
        icon: row.get("icon"),
        order_index: row.get::<i64, _>("sort_order") as i32,
        created_at: DateTime::from_naive_utc_and_offset(
            created_at_naive.unwrap_or_else(|| Utc::now().naive_utc()), 
            Utc
        ),
        updated_at: DateTime::from_naive_utc_and_offset(
            updated_at_naive.unwrap_or_else(|| Utc::now().naive_utc()), 
            Utc
        ),
    })
}

/// Create a new life area
#[tauri::command]
pub async fn create_life_area(
    db: State<'_, Database>,
    dto: CreateLifeAreaDto
) -> Result<LifeArea, String> {
    // Validate input
    if dto.name.trim().is_empty() {
        return Err("Life area name cannot be empty".to_string());
    }
    
    if dto.name.len() > 100 {
        return Err("Life area name cannot exceed 100 characters".to_string());
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 500 {
            return Err("Description cannot exceed 500 characters".to_string());
        }
    }
    
    // Validate color format (should be hex color)
    if !is_valid_hex_color(&dto.color) {
        return Err("Invalid color format. Please use hex format (e.g., #FF5733)".to_string());
    }
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    // Get the next order index
    let max_order: Option<i64> = sqlx::query_scalar("SELECT MAX(sort_order) FROM life_areas")
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to get max order index: {}", e))?;
    
    let order_index = (max_order.unwrap_or(-1) + 1) as i32;
    
    // Convert DateTime to NaiveDateTime for SQLite
    let naive_now = now.naive_utc();
    
    // Insert the new life area
    sqlx::query(
        r#"
        INSERT INTO life_areas (id, name, description, color, icon, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, NULL, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(dto.name.trim())
    .bind(&dto.description)
    .bind(&dto.color)
    .bind(order_index)
    .bind(naive_now)
    .bind(naive_now)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to create life area: {}", e))?;
    
    // Fetch and return the created life area
    get_life_area(db, id).await
}

/// Update an existing life area
#[tauri::command]
pub async fn update_life_area(
    db: State<'_, Database>,
    id: String,
    dto: UpdateLifeAreaDto
) -> Result<LifeArea, String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid life area ID format")?;
    
    // Validate input if provided
    if let Some(ref name) = dto.name {
        if name.trim().is_empty() {
            return Err("Life area name cannot be empty".to_string());
        }
        if name.len() > 100 {
            return Err("Life area name cannot exceed 100 characters".to_string());
        }
    }
    
    if let Some(ref desc) = dto.description {
        if desc.len() > 500 {
            return Err("Description cannot exceed 500 characters".to_string());
        }
    }
    
    if let Some(ref color) = dto.color {
        if !is_valid_hex_color(color) {
            return Err("Invalid color format. Please use hex format (e.g., #FF5733)".to_string());
        }
    }
    
    // Build dynamic update query based on provided fields
    let mut query = String::from("UPDATE life_areas SET ");
    let mut updates = vec![];
    
    if dto.name.is_some() {
        updates.push("name = ?");
    }
    if dto.description.is_some() {
        updates.push("description = ?");
    }
    if dto.color.is_some() {
        updates.push("color = ?");
    }
    if dto.order_index.is_some() {
        updates.push("sort_order = ?");
    }
    
    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }
    
    updates.push("updated_at = ?");
    query.push_str(&updates.join(", "));
    query.push_str(" WHERE id = ? RETURNING id, name, description, color, icon, sort_order as order_index, created_at, updated_at");
    
    // For now, we'll use a simpler approach with individual field updates
    let now = Utc::now();
    
    // First, check if the life area exists
    let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM life_areas WHERE id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check life area existence: {}", e))?;
    
    if exists == 0 {
        return Err(format!("Life area with ID {} not found", id));
    }
    
    // Convert DateTime to NaiveDateTime for SQLite
    let naive_now = now.naive_utc();
    
    // Update only the provided fields
    if let Some(name) = dto.name {
        sqlx::query("UPDATE life_areas SET name = ?, updated_at = ? WHERE id = ?")
            .bind(name.trim())
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update name: {}", e))?;
    }
    
    if let Some(description) = dto.description {
        sqlx::query("UPDATE life_areas SET description = ?, updated_at = ? WHERE id = ?")
            .bind(description)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update description: {}", e))?;
    }
    
    if let Some(color) = dto.color {
        sqlx::query("UPDATE life_areas SET color = ?, updated_at = ? WHERE id = ?")
            .bind(color)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update color: {}", e))?;
    }
    
    if let Some(order_index) = dto.order_index {
        sqlx::query("UPDATE life_areas SET sort_order = ?, updated_at = ? WHERE id = ?")
            .bind(order_index)
            .bind(naive_now)
            .bind(&id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update order index: {}", e))?;
    }
    
    // Fetch and return the updated life area
    get_life_area(db, id).await
}

/// Delete a life area
#[tauri::command]
pub async fn delete_life_area(
    db: State<'_, Database>,
    id: String
) -> Result<(), String> {
    // Validate UUID format
    let _ = Uuid::parse_str(&id)
        .map_err(|_| "Invalid life area ID format")?;
    
    // Check if there are any goals associated with this life area
    let goal_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM goals WHERE life_area_id = ?")
        .bind(&id)
        .fetch_one(db.pool())
        .await
        .map_err(|e| format!("Failed to check associated goals: {}", e))?;
    
    if goal_count > 0 {
        return Err(format!(
            "Cannot delete life area: {} goals are still associated with it. Please delete or reassign them first.",
            goal_count
        ));
    }
    
    // Delete the life area
    let result = sqlx::query("DELETE FROM life_areas WHERE id = ?")
        .bind(&id)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to delete life area: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Life area with ID {} not found", id));
    }
    
    Ok(())
}

/// Reorder life areas
#[tauri::command]
pub async fn reorder_life_areas(
    db: State<'_, Database>,
    ids: Vec<String>
) -> Result<(), String> {
    // Validate all IDs
    for id in &ids {
        let _ = Uuid::parse_str(id)
            .map_err(|_| format!("Invalid life area ID format: {}", id))?;
    }
    
    // Update order_index for each life area
    let now = Utc::now();
    let naive_now = now.naive_utc();
    
    for (index, id) in ids.iter().enumerate() {
        sqlx::query("UPDATE life_areas SET sort_order = ?, updated_at = ? WHERE id = ?")
            .bind(index as i32)
            .bind(naive_now)
            .bind(id)
            .execute(db.pool())
            .await
            .map_err(|e| format!("Failed to update order for life area {}: {}", id, e))?;
    }
    
    Ok(())
}

/// Helper function to validate hex color format
fn is_valid_hex_color(color: &str) -> bool {
    if !color.starts_with('#') || (color.len() != 7 && color.len() != 4) {
        return false;
    }
    
    color[1..].chars().all(|c| c.is_ascii_hexdigit())
}