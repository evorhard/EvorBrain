/// Project validation
use crate::database::models::project::{CreateProjectDto, UpdateProjectDto, ProjectStatus};
use super::{ValidateDto, ValidationError, validate_name, validate_description, validate_uuid, validate_status, validate_progress, MAX_DESCRIPTION_LENGTH};
use chrono::{Utc, Duration};

impl ValidateDto for CreateProjectDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate goal_id
        validate_uuid(&self.goal_id)?;
        
        // Validate name
        validate_name(&self.name)?;
        
        // Validate description
        validate_description(&self.description, MAX_DESCRIPTION_LENGTH)?;
        
        // Validate date range
        if let (Some(start), Some(due)) = (self.start_date, self.due_date) {
            if start > due {
                return Err(ValidationError::FieldError {
                    field: "date_range".to_string(),
                    message: "start date must be before or equal to due date".to_string(),
                });
            }
        }
        
        // Validate dates are not too far in the past
        if let Some(start_date) = self.start_date {
            let one_year_ago = Utc::now() - Duration::days(365);
            if start_date < one_year_ago {
                return Err(ValidationError::FieldError {
                    field: "start_date".to_string(),
                    message: "cannot be more than 1 year in the past".to_string(),
                });
            }
        }
        
        // Validate dates are not too far in the future
        if let Some(due_date) = self.due_date {
            let five_years_future = Utc::now() + Duration::days(365 * 5);
            if due_date > five_years_future {
                return Err(ValidationError::FieldError {
                    field: "due_date".to_string(),
                    message: "cannot be more than 5 years in the future".to_string(),
                });
            }
        }
        
        Ok(())
    }
}

impl ValidateDto for UpdateProjectDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate name if provided
        if let Some(ref name) = self.name {
            validate_name(name)?;
        }
        
        // Validate description if provided
        validate_description(&self.description, MAX_DESCRIPTION_LENGTH)?;
        
        // Validate date range
        if let (Some(start), Some(due)) = (self.start_date, self.due_date) {
            if start > due {
                return Err(ValidationError::FieldError {
                    field: "date_range".to_string(),
                    message: "start date must be before or equal to due date".to_string(),
                });
            }
        }
        
        // Validate dates are not too far in the past
        if let Some(start_date) = self.start_date {
            let one_year_ago = Utc::now() - Duration::days(365);
            if start_date < one_year_ago {
                return Err(ValidationError::FieldError {
                    field: "start_date".to_string(),
                    message: "cannot be more than 1 year in the past".to_string(),
                });
            }
        }
        
        // Validate dates are not too far in the future
        if let Some(due_date) = self.due_date {
            let five_years_future = Utc::now() + Duration::days(365 * 5);
            if due_date > five_years_future {
                return Err(ValidationError::FieldError {
                    field: "due_date".to_string(),
                    message: "cannot be more than 5 years in the future".to_string(),
                });
            }
        }
        
        // Validate status if provided
        if let Some(ref status) = self.status {
            let status_str = match status {
                ProjectStatus::Planning => "planning",
                ProjectStatus::Active => "active",
                ProjectStatus::Completed => "completed",
                ProjectStatus::OnHold => "on_hold",
                ProjectStatus::Cancelled => "cancelled",
            };
            validate_status(status_str, "project")?;
        }
        
        // Validate progress if provided
        if let Some(progress) = self.progress {
            validate_progress(progress)?;
        }
        
        // Ensure at least one field is being updated
        if self.name.is_none() && self.description.is_none() && 
           self.start_date.is_none() && self.due_date.is_none() &&
           self.status.is_none() && self.progress.is_none() {
            return Err(ValidationError::ValidationFailed(
                "At least one field must be provided for update".to_string()
            ));
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn test_create_project_validation() {
        let valid_dto = CreateProjectDto {
            goal_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Gym Routine".to_string(),
            description: Some("Daily workout plan".to_string()),
            start_date: Some(Utc.with_ymd_and_hms(2025, 1, 1, 0, 0, 0).unwrap()),
            due_date: Some(Utc.with_ymd_and_hms(2025, 12, 31, 0, 0, 0).unwrap()),
            status: ProjectStatus::Planning,
        };
        assert!(valid_dto.validate().is_ok());

        let invalid_date_range_dto = CreateProjectDto {
            goal_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Project".to_string(),
            description: None,
            start_date: Some(Utc.with_ymd_and_hms(2025, 12, 31, 0, 0, 0).unwrap()),
            due_date: Some(Utc.with_ymd_and_hms(2025, 1, 1, 0, 0, 0).unwrap()),
            status: ProjectStatus::Planning,
        };
        assert!(invalid_date_range_dto.validate().is_err());

        let too_far_past_dto = CreateProjectDto {
            goal_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Project".to_string(),
            description: None,
            start_date: Some(Utc.with_ymd_and_hms(2020, 1, 1, 0, 0, 0).unwrap()),
            due_date: None,
            status: ProjectStatus::Planning,
        };
        assert!(too_far_past_dto.validate().is_err());
    }

    #[test]
    fn test_update_project_validation() {
        let valid_dto = UpdateProjectDto {
            name: Some("Updated Project".to_string()),
            description: None,
            goal_id: None,
            start_date: None,
            due_date: None,
            status: Some(ProjectStatus::Completed),
            progress: Some(75),
        };
        assert!(valid_dto.validate().is_ok());

        let invalid_progress_dto = UpdateProjectDto {
            name: None,
            description: None,
            goal_id: None,
            start_date: None,
            due_date: None,
            status: None,
            progress: Some(150),
        };
        assert!(invalid_progress_dto.validate().is_err());
    }
}