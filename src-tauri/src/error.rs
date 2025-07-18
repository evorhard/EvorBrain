/// Error handling module
use thiserror::Error;

/// Application-wide error type
#[derive(Error, Debug)]
pub enum AppError {
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    #[error("Database error: {message}")]
    Database { message: String },
    
    #[error("Not found: {entity}")]
    NotFound { entity: String },
    
    #[error("Already exists: {entity}")]
    AlreadyExists { entity: String },
    
    #[error("Bad request: {message}")]
    BadRequest { message: String },
    
    #[error("Internal error: {message}")]
    Internal { message: String },
    
    #[error("Permission denied: {message}")]
    PermissionDenied { message: String },
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::NotFound { 
                entity: "Resource not found".to_string() 
            },
            sqlx::Error::Database(db_err) => {
                // Check for unique constraint violations
                if let Some(code) = db_err.code() {
                    if code == "2067" || code == "UNIQUE" {
                        return AppError::AlreadyExists { 
                            entity: "Resource already exists".to_string() 
                        };
                    }
                }
                AppError::Database { 
                    message: db_err.to_string() 
                }
            },
            _ => AppError::Database { 
                message: err.to_string() 
            },
        }
    }
}

impl From<crate::validation::ValidationError> for AppError {
    fn from(err: crate::validation::ValidationError) -> Self {
        AppError::Validation { 
            message: err.to_string() 
        }
    }
}

impl From<uuid::Error> for AppError {
    fn from(_: uuid::Error) -> Self {
        AppError::BadRequest { 
            message: "Invalid UUID format".to_string() 
        }
    }
}

/// Result type alias for application
pub type AppResult<T> = Result<T, AppError>;

/// Convert AppError to string for Tauri commands
impl AppError {
    pub fn to_user_message(&self) -> String {
        match self {
            AppError::Validation { message } => format!("Validation failed: {}", message),
            AppError::Database { message } => format!("Database operation failed: {}", message),
            AppError::NotFound { entity } => format!("{} not found", entity),
            AppError::AlreadyExists { entity } => format!("{} already exists", entity),
            AppError::BadRequest { message } => format!("Invalid request: {}", message),
            AppError::Internal { message } => format!("An internal error occurred: {}", message),
            AppError::PermissionDenied { message } => format!("Permission denied: {}", message),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_messages() {
        let err = AppError::Validation { 
            message: "Name is required".to_string() 
        };
        assert_eq!(err.to_user_message(), "Validation failed: Name is required");

        let err = AppError::NotFound { 
            entity: "Task".to_string() 
        };
        assert_eq!(err.to_user_message(), "Task not found");
    }
}