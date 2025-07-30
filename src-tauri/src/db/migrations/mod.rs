pub mod all;
pub mod commands;

use anyhow::Result;
use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool};

pub struct Migration {
    pub version: i64,
    pub description: String,
    pub up: String,
    pub down: String,
}

impl Migration {
    pub fn new(version: i64, description: impl Into<String>, up: impl Into<String>, down: impl Into<String>) -> Self {
        Self {
            version,
            description: description.into(),
            up: up.into(),
            down: down.into(),
        }
    }
}

pub struct MigrationRunner {
    pool: SqlitePool,
}

impl MigrationRunner {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn init(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS _migrations (
                version BIGINT PRIMARY KEY NOT NULL,
                description TEXT NOT NULL,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                checksum TEXT NOT NULL
            )
            "#
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn migrate(&self, migrations: &[Migration]) -> Result<()> {
        self.init().await?;

        let mut tx = self.pool.begin().await?;

        for migration in migrations {
            if !self.is_applied(migration.version).await? {
                println!("Applying migration {}: {}", migration.version, migration.description);
                
                sqlx::query(&migration.up)
                    .execute(&mut *tx)
                    .await?;

                let checksum = self.calculate_checksum(&migration.up);
                
                sqlx::query(
                    "INSERT INTO _migrations (version, description, checksum) VALUES (?, ?, ?)"
                )
                .bind(migration.version)
                .bind(&migration.description)
                .bind(checksum)
                .execute(&mut *tx)
                .await?;
            }
        }

        tx.commit().await?;
        Ok(())
    }

    pub async fn rollback(&self, target_version: Option<i64>) -> Result<()> {
        let target = target_version.unwrap_or(0);
        
        let applied_migrations = self.get_applied_migrations().await?;
        
        for version in applied_migrations.into_iter().rev() {
            if version <= target {
                break;
            }
            
            println!("Rolling back migration {}", version);
            
            sqlx::query("DELETE FROM _migrations WHERE version = ?")
                .bind(version)
                .execute(&self.pool)
                .await?;
        }
        
        Ok(())
    }

    pub async fn is_applied(&self, version: i64) -> Result<bool> {
        let result = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM _migrations WHERE version = ?"
        )
        .bind(version)
        .fetch_one(&self.pool)
        .await?;
        
        Ok(result > 0)
    }

    pub async fn get_applied_migrations(&self) -> Result<Vec<i64>> {
        let versions: Vec<i64> = sqlx::query_scalar(
            "SELECT version FROM _migrations ORDER BY version ASC"
        )
        .fetch_all(&self.pool)
        .await?;
        
        Ok(versions)
    }

    pub async fn get_latest_version(&self) -> Result<Option<i64>> {
        let version: Option<i64> = sqlx::query_scalar(
            "SELECT MAX(version) FROM _migrations"
        )
        .fetch_one(&self.pool)
        .await?;
        
        Ok(version)
    }

    fn calculate_checksum(&self, content: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        content.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }
}

pub async fn ensure_database_exists(database_url: &str) -> Result<()> {
    if !Sqlite::database_exists(database_url).await? {
        println!("Creating database: {}", database_url);
        Sqlite::create_database(database_url).await?;
    }
    Ok(())
}