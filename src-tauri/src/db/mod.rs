pub mod connection;
pub mod models;
pub mod schema;
pub mod repository;

use anyhow::Result;
use sqlx::sqlite::SqlitePool;

pub async fn init_database(database_url: &str) -> Result<SqlitePool> {
    let pool = connection::create_pool(database_url).await?;
    schema::run_migrations(&pool).await?;
    Ok(pool)
}