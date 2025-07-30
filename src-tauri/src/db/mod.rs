pub mod connection;
pub mod models;
pub mod schema;
pub mod repository;
pub mod migrations;

use anyhow::Result;
use sqlx::sqlite::SqlitePool;

pub async fn init_database(database_url: &str) -> Result<SqlitePool> {
    migrations::ensure_database_exists(database_url).await?;
    let pool = connection::create_pool(database_url).await?;
    
    let runner = migrations::MigrationRunner::new(pool.clone());
    let all_migrations = migrations::all::get_migrations();
    runner.migrate(&all_migrations).await?;
    
    Ok(pool)
}