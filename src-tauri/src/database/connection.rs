/// Database connection management
use sqlx::{Pool, Sqlite, SqlitePool};
use std::path::PathBuf;
use crate::database::{DatabaseError, DatabaseResult};

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    /// Create a new database connection
    pub async fn new(data_dir: PathBuf) -> DatabaseResult<Self> {
        // Ensure the data directory exists
        std::fs::create_dir_all(&data_dir)
            .map_err(|e| DatabaseError::ConnectionError(format!("Failed to create data directory: {}", e)))?;
        
        // Construct database path
        let db_path = data_dir.join("evorbrain.db");
        let db_url = format!("sqlite:{}", db_path.display());
        
        // Create connection pool with optimized settings
        let pool = SqlitePool::connect_with(
            sqlx::sqlite::SqliteConnectOptions::new()
                .filename(&db_path)
                .create_if_missing(true)
                .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
                .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
                .busy_timeout(std::time::Duration::from_secs(10))
        )
        .await
        .map_err(|e| DatabaseError::ConnectionError(format!("Failed to connect to database: {}", e)))?;
        
        Ok(Database { pool })
    }
    
    /// Get a reference to the connection pool
    pub fn pool(&self) -> &Pool<Sqlite> {
        &self.pool
    }
    
    /// Run database migrations
    pub async fn migrate(&self) -> DatabaseResult<()> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(|e| DatabaseError::MigrationError(format!("Failed to run migrations: {}", e)))?;
        
        Ok(())
    }
    
    /// Close the database connection
    pub async fn close(&self) {
        self.pool.close().await;
    }
}