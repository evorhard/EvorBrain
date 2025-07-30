use anyhow::Result;
use sqlx::SqlitePool;

#[deprecated(note = "Use the migration system instead")]
pub async fn run_migrations(_pool: &SqlitePool) -> Result<()> {
    Ok(())
}