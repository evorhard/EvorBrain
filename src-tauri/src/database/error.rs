/// Database error types and result alias
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Database connection error: {0}")]
    ConnectionError(String),
    
    #[error("Migration error: {0}")]
    MigrationError(String),
    
    #[error("Query error: {0}")]
    QueryError(#[from] sqlx::Error),
    
    #[error("Entity not found: {entity}")]
    NotFound { entity: String },
    
    #[error("Validation error: {0}")]
    ValidationError(String),
    
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

pub type DatabaseResult<T> = Result<T, DatabaseError>;

// Convert to Tauri command error
impl From<DatabaseError> for String {
    fn from(err: DatabaseError) -> Self {
        err.to_string()
    }
}