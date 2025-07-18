/// Validation module for input validation and error handling
use lazy_static::lazy_static;
use regex::Regex;
use thiserror::Error;
use validator::ValidationErrors;

pub mod life_area;
pub mod goal;
pub mod project;
pub mod task;

/// Custom validation error type
#[derive(Error, Debug)]
pub enum ValidationError {
    #[error("Validation failed: {0}")]
    ValidationFailed(String),
    
    #[error("Field '{field}' {message}")]
    FieldError { field: String, message: String },
    
    #[error("Multiple validation errors occurred")]
    MultipleErrors(Vec<ValidationError>),
}

impl From<ValidationErrors> for ValidationError {
    fn from(errors: ValidationErrors) -> Self {
        let mut field_errors = Vec::new();
        
        for (field, errors) in errors.field_errors() {
            for error in errors {
                let message = error.message.as_ref()
                    .map(|m| m.to_string())
                    .unwrap_or_else(|| format!("validation failed for constraint: {:?}", error.code));
                
                field_errors.push(ValidationError::FieldError {
                    field: field.to_string(),
                    message,
                });
            }
        }
        
        if field_errors.len() == 1 {
            field_errors.into_iter().next().unwrap()
        } else {
            ValidationError::MultipleErrors(field_errors)
        }
    }
}

/// Common validation constants
pub const MAX_NAME_LENGTH: usize = 100;
pub const MAX_DESCRIPTION_LENGTH: usize = 500;
pub const MAX_LONG_DESCRIPTION_LENGTH: usize = 2000;
pub const MIN_NAME_LENGTH: usize = 1;
pub const MAX_COLOR_LENGTH: usize = 7;
pub const MIN_COLOR_LENGTH: usize = 4;

// Regex patterns
lazy_static! {
    pub static ref HEX_COLOR_REGEX: Regex = Regex::new(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$").unwrap();
    pub static ref SAFE_TEXT_REGEX: Regex = Regex::new(r"^[a-zA-Z0-9\s\-_.,!?'()\[\]{}@#$%&*+=/:;<>]+$").unwrap();
}

/// Validate hex color format
pub fn validate_hex_color(color: &str) -> Result<(), ValidationError> {
    if !HEX_COLOR_REGEX.is_match(color) {
        return Err(ValidationError::FieldError {
            field: "color".to_string(),
            message: "must be a valid hex color (e.g., #FF5733 or #F57)".to_string(),
        });
    }
    Ok(())
}

/// Validate name field
pub fn validate_name(name: &str) -> Result<(), ValidationError> {
    let trimmed = name.trim();
    
    if trimmed.is_empty() {
        return Err(ValidationError::FieldError {
            field: "name".to_string(),
            message: "cannot be empty".to_string(),
        });
    }
    
    if trimmed.len() > MAX_NAME_LENGTH {
        return Err(ValidationError::FieldError {
            field: "name".to_string(),
            message: format!("cannot exceed {} characters", MAX_NAME_LENGTH),
        });
    }
    
    // Check for potentially dangerous characters
    if trimmed.contains('\0') || trimmed.contains('\r') {
        return Err(ValidationError::FieldError {
            field: "name".to_string(),
            message: "contains invalid characters".to_string(),
        });
    }
    
    Ok(())
}

/// Validate description field
pub fn validate_description(description: &Option<String>, max_length: usize) -> Result<(), ValidationError> {
    if let Some(desc) = description {
        if desc.len() > max_length {
            return Err(ValidationError::FieldError {
                field: "description".to_string(),
                message: format!("cannot exceed {} characters", max_length),
            });
        }
        
        // Check for potentially dangerous characters
        if desc.contains('\0') {
            return Err(ValidationError::FieldError {
                field: "description".to_string(),
                message: "contains invalid characters".to_string(),
            });
        }
    }
    
    Ok(())
}

/// Validate UUID format
pub fn validate_uuid(id: &str) -> Result<(), ValidationError> {
    uuid::Uuid::parse_str(id)
        .map_err(|_| ValidationError::FieldError {
            field: "id".to_string(),
            message: "must be a valid UUID".to_string(),
        })?;
    Ok(())
}

/// Validate date range
pub fn validate_date_range(
    start_date: &Option<chrono::NaiveDate>,
    end_date: &Option<chrono::NaiveDate>,
) -> Result<(), ValidationError> {
    if let (Some(start), Some(end)) = (start_date, end_date) {
        if start > end {
            return Err(ValidationError::FieldError {
                field: "date_range".to_string(),
                message: "start date must be before or equal to end date".to_string(),
            });
        }
    }
    Ok(())
}

/// Validate priority
pub fn validate_priority(priority: &str) -> Result<(), ValidationError> {
    const VALID_PRIORITIES: &[&str] = &["low", "medium", "high", "critical"];
    
    if !VALID_PRIORITIES.contains(&priority) {
        return Err(ValidationError::FieldError {
            field: "priority".to_string(),
            message: format!("must be one of: {}", VALID_PRIORITIES.join(", ")),
        });
    }
    Ok(())
}

/// Validate status based on entity type
pub fn validate_status(status: &str, entity_type: &str) -> Result<(), ValidationError> {
    let valid_statuses = match entity_type {
        "goal" => vec!["active", "completed", "paused", "cancelled"],
        "project" => vec!["planning", "active", "completed", "on_hold", "cancelled"],
        "task" => vec!["todo", "in_progress", "completed", "cancelled"],
        _ => return Err(ValidationError::ValidationFailed("Unknown entity type".to_string())),
    };
    
    if !valid_statuses.contains(&status) {
        return Err(ValidationError::FieldError {
            field: "status".to_string(),
            message: format!("must be one of: {}", valid_statuses.join(", ")),
        });
    }
    Ok(())
}

/// Validate progress percentage
pub fn validate_progress(progress: i32) -> Result<(), ValidationError> {
    if !(0..=100).contains(&progress) {
        return Err(ValidationError::FieldError {
            field: "progress".to_string(),
            message: "must be between 0 and 100".to_string(),
        });
    }
    Ok(())
}

/// Validate estimated minutes
pub fn validate_estimated_minutes(minutes: Option<i32>) -> Result<(), ValidationError> {
    if let Some(mins) = minutes {
        if mins < 0 {
            return Err(ValidationError::FieldError {
                field: "estimated_minutes".to_string(),
                message: "cannot be negative".to_string(),
            });
        }
        if mins > 10080 { // 1 week in minutes
            return Err(ValidationError::FieldError {
                field: "estimated_minutes".to_string(),
                message: "cannot exceed 1 week (10080 minutes)".to_string(),
            });
        }
    }
    Ok(())
}

/// Common trait for validating DTOs
pub trait ValidateDto {
    fn validate(&self) -> Result<(), ValidationError>;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_color_validation() {
        assert!(validate_hex_color("#FF5733").is_ok());
        assert!(validate_hex_color("#F57").is_ok());
        assert!(validate_hex_color("#ff5733").is_ok());
        assert!(validate_hex_color("FF5733").is_err());
        assert!(validate_hex_color("#GG5733").is_err());
        assert!(validate_hex_color("#FF57333").is_err());
    }

    #[test]
    fn test_name_validation() {
        assert!(validate_name("Valid Name").is_ok());
        assert!(validate_name("  Valid Name  ").is_ok());
        assert!(validate_name("").is_err());
        assert!(validate_name("   ").is_err());
        assert!(validate_name(&"a".repeat(101)).is_err());
        assert!(validate_name("Name\0").is_err());
    }

    #[test]
    fn test_uuid_validation() {
        assert!(validate_uuid("550e8400-e29b-41d4-a716-446655440000").is_ok());
        assert!(validate_uuid("invalid-uuid").is_err());
        assert!(validate_uuid("").is_err());
    }
}