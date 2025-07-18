/// Task validation
use crate::database::models::task::{CreateTaskDto, UpdateTaskDto, TaskPriority, TaskStatus};
use super::{ValidateDto, ValidationError, validate_name, validate_description, validate_uuid, validate_status, validate_priority, validate_estimated_minutes, MAX_LONG_DESCRIPTION_LENGTH};
use chrono::{Utc, Local};

impl ValidateDto for CreateTaskDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate project_id
        validate_uuid(&self.project_id)?;
        
        // Validate name
        validate_name(&self.name)?;
        
        // Validate description (tasks can have longer descriptions)
        validate_description(&self.description, MAX_LONG_DESCRIPTION_LENGTH)?;
        
        // Validate due_date if provided
        if let Some(due_date) = self.due_date {
            let now = Local::now().with_timezone(&Utc);
            let one_hour_ago = now - chrono::Duration::hours(1);
            
            // Allow due dates up to 1 hour in the past (for timezone differences)
            if due_date < one_hour_ago {
                return Err(ValidationError::FieldError {
                    field: "due_date".to_string(),
                    message: "cannot be more than 1 hour in the past".to_string(),
                });
            }
            
            // Validate due date is not too far in the future
            let two_years_future = now + chrono::Duration::days(365 * 2);
            if due_date > two_years_future {
                return Err(ValidationError::FieldError {
                    field: "due_date".to_string(),
                    message: "cannot be more than 2 years in the future".to_string(),
                });
            }
        }
        
        // Validate priority - TaskPriority enum is always valid, no need to validate
        
        // Validate estimated_minutes
        validate_estimated_minutes(self.estimated_minutes)?;
        
        // Validate recurrence_rule if provided
        if let Some(ref rrule) = self.recurrence_rule {
            validate_rrule(rrule)?;
        }
        
        Ok(())
    }
}

impl ValidateDto for UpdateTaskDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate name if provided
        if let Some(ref name) = self.name {
            validate_name(name)?;
        }
        
        // Validate description if provided
        validate_description(&self.description, MAX_LONG_DESCRIPTION_LENGTH)?;
        
        // Validate due_date if provided
        if let Some(due_date) = self.due_date {
            let now = Local::now().with_timezone(&Utc);
            let one_hour_ago = now - chrono::Duration::hours(1);
            
            // Allow due dates up to 1 hour in the past (for timezone differences)
            if due_date < one_hour_ago {
                return Err(ValidationError::FieldError {
                    field: "due_date".to_string(),
                    message: "cannot be more than 1 hour in the past".to_string(),
                });
            }
            
            // Validate due date is not too far in the future
            let two_years_future = now + chrono::Duration::days(365 * 2);
            if due_date > two_years_future {
                return Err(ValidationError::FieldError {
                    field: "due_date".to_string(),
                    message: "cannot be more than 2 years in the future".to_string(),
                });
            }
        }
        
        // Validate priority if provided - TaskPriority enum is always valid, no need to validate
        
        // Validate status if provided - TaskStatus enum is always valid, no need to validate
        
        // Validate estimated_minutes if provided
        validate_estimated_minutes(self.estimated_minutes)?;
        
        // Validate actual_minutes if provided
        if let Some(minutes) = self.actual_minutes {
            if minutes < 0 {
                return Err(ValidationError::FieldError {
                    field: "actual_minutes".to_string(),
                    message: "cannot be negative".to_string(),
                });
            }
            if minutes > 10080 { // 1 week in minutes
                return Err(ValidationError::FieldError {
                    field: "actual_minutes".to_string(),
                    message: "cannot exceed 1 week (10080 minutes)".to_string(),
                });
            }
        }
        
        
        // Validate recurrence_rule if provided
        if let Some(ref rrule) = self.recurrence_rule {
            validate_rrule(rrule)?;
        }
        
        // Ensure at least one field is being updated
        if self.name.is_none() && self.description.is_none() && 
           self.due_date.is_none() &&
           self.priority.is_none() && self.status.is_none() &&
           self.estimated_minutes.is_none() && self.actual_minutes.is_none() &&
           self.recurrence_rule.is_none() {
            return Err(ValidationError::ValidationFailed(
                "At least one field must be provided for update".to_string()
            ));
        }
        
        Ok(())
    }
}

/// Validate RRULE format (basic validation)
fn validate_rrule(rrule: &str) -> Result<(), ValidationError> {
    // Basic RRULE validation - ensure it starts with FREQ=
    if !rrule.starts_with("FREQ=") {
        return Err(ValidationError::FieldError {
            field: "recurrence_rule".to_string(),
            message: "must be a valid RRULE starting with FREQ=".to_string(),
        });
    }
    
    // Check for valid frequency values
    let valid_freqs = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
    let has_valid_freq = valid_freqs.iter().any(|&freq| rrule.contains(&format!("FREQ={}", freq)));
    
    if !has_valid_freq {
        return Err(ValidationError::FieldError {
            field: "recurrence_rule".to_string(),
            message: "must contain a valid frequency (DAILY, WEEKLY, MONTHLY, or YEARLY)".to_string(),
        });
    }
    
    // Basic length check
    if rrule.len() > 500 {
        return Err(ValidationError::FieldError {
            field: "recurrence_rule".to_string(),
            message: "cannot exceed 500 characters".to_string(),
        });
    }
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_task_validation() {
        let valid_dto = CreateTaskDto {
            project_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Complete workout".to_string(),
            description: Some("30 minutes cardio + weights".to_string()),
            due_date: Some(Utc::now() + chrono::Duration::days(1)),
            priority: "high".to_string(),
            estimated_minutes: Some(45),
            recurrence_rule: None,
        };
        assert!(valid_dto.validate().is_ok());

        let invalid_priority_dto = CreateTaskDto {
            project_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Task".to_string(),
            description: None,
            due_date: None,
            priority: "urgent".to_string(),
            estimated_minutes: None,
            recurrence_rule: None,
        };
        assert!(invalid_priority_dto.validate().is_err());

        let invalid_rrule_dto = CreateTaskDto {
            project_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Task".to_string(),
            description: None,
            due_date: None,
            priority: "medium".to_string(),
            estimated_minutes: None,
            recurrence_rule: Some("INVALID".to_string()),
        };
        assert!(invalid_rrule_dto.validate().is_err());
    }

    #[test]
    fn test_update_task_validation() {
        let valid_dto = UpdateTaskDto {
            name: Some("Updated task".to_string()),
            description: None,
            due_date: None,
            completed_at: None,
            priority: Some("critical".to_string()),
            status: Some("in_progress".to_string()),
            estimated_minutes: Some(60),
            actual_minutes: Some(55),
            recurrence_rule: None,
        };
        assert!(valid_dto.validate().is_ok());

        let invalid_status_dto = UpdateTaskDto {
            name: None,
            description: None,
            due_date: None,
            completed_at: None,
            priority: None,
            status: Some("pending".to_string()),
            estimated_minutes: None,
            actual_minutes: None,
            recurrence_rule: None,
        };
        assert!(invalid_status_dto.validate().is_err());

        let negative_minutes_dto = UpdateTaskDto {
            name: None,
            description: None,
            due_date: None,
            completed_at: None,
            priority: None,
            status: None,
            estimated_minutes: Some(-10),
            actual_minutes: None,
            recurrence_rule: None,
        };
        assert!(negative_minutes_dto.validate().is_err());
    }

    #[test]
    fn test_rrule_validation() {
        assert!(validate_rrule("FREQ=DAILY").is_ok());
        assert!(validate_rrule("FREQ=WEEKLY;BYDAY=MO,WE,FR").is_ok());
        assert!(validate_rrule("FREQ=MONTHLY;BYMONTHDAY=15").is_ok());
        assert!(validate_rrule("INVALID").is_err());
        assert!(validate_rrule("FREQ=INVALID").is_err());
    }
}