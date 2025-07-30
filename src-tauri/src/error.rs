use serde::{Deserialize, Serialize};
use std::fmt;
use crate::{log_error, log_warn};

#[derive(Debug, Deserialize)]
pub struct AppError {
    pub code: ErrorCode,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    // Database errors
    DatabaseConnection,
    DatabaseQuery,
    DatabaseMigration,
    
    // Validation errors
    ValidationError,
    InvalidInput,
    InvalidId,
    
    // Business logic errors
    NotFound,
    AlreadyExists,
    CannotDelete,
    CannotUpdate,
    
    // System errors
    InternalError,
    ConfigError,
    IoError,
    
    // Auth errors (future use)
    Unauthorized,
    Forbidden,
}

impl AppError {
    pub fn new(code: ErrorCode, message: impl Into<String>) -> Self {
        let error = Self {
            code,
            message: message.into(),
            details: None,
        };
        
        // Log errors and warnings
        match code {
            ErrorCode::InternalError | ErrorCode::DatabaseConnection | ErrorCode::DatabaseQuery => {
                log_error!(&error.message);
            }
            ErrorCode::NotFound | ErrorCode::InvalidId | ErrorCode::ValidationError => {
                log_warn!(&error.message);
            }
            _ => {}
        }
        
        error
    }
    
    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        let details_str = details.into();
        
        // Log error details if it's a serious error
        match self.code {
            ErrorCode::InternalError | ErrorCode::DatabaseConnection | ErrorCode::DatabaseQuery => {
                log_error!(&format!("{} - Details: {}", self.message, details_str));
            }
            _ => {}
        }
        
        self.details = Some(details_str);
        self
    }
    
    // Common error constructors
    pub fn not_found(entity: &str, id: &str) -> Self {
        Self::new(
            ErrorCode::NotFound,
            format!("{} with id '{}' not found", entity, id),
        )
    }
    
    pub fn invalid_id(id: &str) -> Self {
        Self::new(
            ErrorCode::InvalidId,
            format!("Invalid ID format: '{}'", id),
        )
    }
    
    pub fn database_error(operation: &str, error: impl std::error::Error) -> Self {
        Self::new(
            ErrorCode::DatabaseQuery,
            format!("Database operation '{}' failed", operation),
        )
        .with_details(error.to_string())
    }
    
    pub fn validation_error(field: &str, reason: &str) -> Self {
        Self::new(
            ErrorCode::ValidationError,
            format!("Validation failed for field '{}': {}", field, reason),
        )
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for AppError {}

// Convert from sqlx::Error
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::new(
                ErrorCode::NotFound,
                "Requested resource not found",
            ),
            sqlx::Error::Database(db_err) => {
                // Handle specific database errors
                if db_err.message().contains("UNIQUE constraint") {
                    AppError::new(
                        ErrorCode::AlreadyExists,
                        "Resource already exists",
                    )
                    .with_details(db_err.message())
                } else {
                    AppError::new(
                        ErrorCode::DatabaseQuery,
                        "Database operation failed",
                    )
                    .with_details(db_err.message())
                }
            }
            _ => AppError::new(
                ErrorCode::DatabaseQuery,
                "Database error occurred",
            )
            .with_details(err.to_string()),
        }
    }
}

// Convert from uuid::Error
impl From<uuid::Error> for AppError {
    fn from(err: uuid::Error) -> Self {
        AppError::new(
            ErrorCode::InvalidId,
            "Invalid UUID format",
        )
        .with_details(err.to_string())
    }
}

// Convert from std::io::Error
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::new(
            ErrorCode::IoError,
            "I/O operation failed",
        )
        .with_details(err.to_string())
    }
}

// Convert from serde_json::Error
impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::new(
            ErrorCode::InternalError,
            "JSON serialization/deserialization failed",
        )
        .with_details(err.to_string())
    }
}

// Type alias for Result with AppError
pub type AppResult<T> = Result<T, AppError>;

// Macro for easy error creation
#[macro_export]
macro_rules! app_error {
    ($code:expr, $msg:expr) => {
        $crate::error::AppError::new($code, $msg)
    };
    ($code:expr, $msg:expr, $details:expr) => {
        $crate::error::AppError::new($code, $msg).with_details($details)
    };
}

// Make AppError compatible with Tauri commands
impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        
        let mut state = serializer.serialize_struct("AppError", 3)?;
        state.serialize_field("code", &self.code)?;
        state.serialize_field("message", &self.message)?;
        state.serialize_field("details", &self.details)?;
        state.end()
    }
}