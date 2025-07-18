/// Life Area query implementations
use sqlx::{Pool, Sqlite, Row};
use crate::database::models::life_area::LifeArea;
use crate::database::DatabaseResult;
use chrono::{DateTime, Utc};

impl LifeArea {
    /// Get all life areas ordered by sort_order
    pub async fn get_all(pool: &Pool<Sqlite>) -> DatabaseResult<Vec<LifeArea>> {
        let rows = sqlx::query(
            r#"
            SELECT 
                id, name, description, color, icon,
                sort_order, created_at, updated_at
            FROM life_areas
            ORDER BY sort_order ASC, name ASC
            "#
        )
        .fetch_all(pool)
        .await?;
        
        let life_areas = rows.into_iter().map(|row| LifeArea {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            color: row.get("color"),
            icon: row.get("icon"),
            order_index: row.get("sort_order"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }).collect();
        
        Ok(life_areas)
    }
    
    /// Get a single life area by ID
    pub async fn get_by_id(pool: &Pool<Sqlite>, id: &str) -> DatabaseResult<Option<LifeArea>> {
        let row = sqlx::query(
            r#"
            SELECT 
                id, name, description, color, icon,
                sort_order, created_at, updated_at
            FROM life_areas
            WHERE id = ?
            "#
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        
        Ok(row.map(|row| LifeArea {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            color: row.get("color"),
            icon: row.get("icon"),
            order_index: row.get("sort_order"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }))
    }
    
    /// Create a new life area
    pub async fn create(
        pool: &Pool<Sqlite>,
        id: String,
        name: String,
        description: Option<String>,
        color: String,
        order_index: i32,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
    ) -> DatabaseResult<LifeArea> {
        sqlx::query(
            r#"
            INSERT INTO life_areas (id, name, description, color, icon, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, NULL, ?, ?, ?)
            "#
        )
        .bind(&id)
        .bind(&name)
        .bind(&description)
        .bind(&color)
        .bind(order_index)
        .bind(&created_at)
        .bind(&updated_at)
        .execute(pool)
        .await?;
        
        Ok(LifeArea {
            id,
            name,
            description,
            color,
            icon: None,
            order_index,
            created_at,
            updated_at,
        })
    }
    
    /// Get the maximum order index
    pub async fn get_max_order_index(pool: &Pool<Sqlite>) -> DatabaseResult<Option<i32>> {
        let row = sqlx::query("SELECT MAX(sort_order) as max_order FROM life_areas")
            .fetch_one(pool)
            .await?;
        
        Ok(row.get("max_order"))
    }
    
    /// Check if a life area exists
    pub async fn exists(pool: &Pool<Sqlite>, id: &str) -> DatabaseResult<bool> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM life_areas WHERE id = ?")
            .bind(id)
            .fetch_one(pool)
            .await?;
        
        Ok(count > 0)
    }
    
    /// Update a life area's name
    pub async fn update_name(pool: &Pool<Sqlite>, id: &str, name: &str, updated_at: DateTime<Utc>) -> DatabaseResult<()> {
        sqlx::query("UPDATE life_areas SET name = ?, updated_at = ? WHERE id = ?")
            .bind(name)
            .bind(updated_at)
            .bind(id)
            .execute(pool)
            .await?;
        
        Ok(())
    }
    
    /// Update a life area's description
    pub async fn update_description(pool: &Pool<Sqlite>, id: &str, description: Option<String>, updated_at: DateTime<Utc>) -> DatabaseResult<()> {
        sqlx::query("UPDATE life_areas SET description = ?, updated_at = ? WHERE id = ?")
            .bind(description)
            .bind(updated_at)
            .bind(id)
            .execute(pool)
            .await?;
        
        Ok(())
    }
    
    /// Update a life area's color
    pub async fn update_color(pool: &Pool<Sqlite>, id: &str, color: &str, updated_at: DateTime<Utc>) -> DatabaseResult<()> {
        sqlx::query("UPDATE life_areas SET color = ?, updated_at = ? WHERE id = ?")
            .bind(color)
            .bind(updated_at)
            .bind(id)
            .execute(pool)
            .await?;
        
        Ok(())
    }
    
    /// Update a life area's order index
    pub async fn update_order_index(pool: &Pool<Sqlite>, id: &str, order_index: i32, updated_at: DateTime<Utc>) -> DatabaseResult<()> {
        sqlx::query("UPDATE life_areas SET sort_order = ?, updated_at = ? WHERE id = ?")
            .bind(order_index)
            .bind(updated_at)
            .bind(id)
            .execute(pool)
            .await?;
        
        Ok(())
    }
    
    /// Delete a life area
    pub async fn delete(pool: &Pool<Sqlite>, id: &str) -> DatabaseResult<u64> {
        let result = sqlx::query("DELETE FROM life_areas WHERE id = ?")
            .bind(id)
            .execute(pool)
            .await?;
        
        Ok(result.rows_affected())
    }
    
    /// Count goals associated with a life area
    pub async fn count_goals(pool: &Pool<Sqlite>, life_area_id: &str) -> DatabaseResult<i64> {
        let count = sqlx::query_scalar("SELECT COUNT(*) FROM goals WHERE life_area_id = ?")
            .bind(life_area_id)
            .fetch_one(pool)
            .await?;
        
        Ok(count)
    }
}