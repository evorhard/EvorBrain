/// Goal validation
use crate::database::models::goal::{CreateGoalDto, UpdateGoalDto};
use super::{ValidateDto, ValidationError, validate_name, validate_description, validate_uuid, validate_status, validate_progress, MAX_DESCRIPTION_LENGTH};
use chrono::Utc;

impl ValidateDto for CreateGoalDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate life_area_id
        validate_uuid(&self.life_area_id)?;
        
        // Validate name
        validate_name(&self.name)?;
        
        // Validate description
        validate_description(&self.description, MAX_DESCRIPTION_LENGTH)?;
        
        // Validate target_date if provided
        if let Some(target_date) = self.target_date {
            let now = Utc::now();
            if target_date < now {
                return Err(ValidationError::FieldError {
                    field: "target_date".to_string(),
                    message: "cannot be in the past".to_string(),
                });
            }
        }
        
        Ok(())
    }
}

impl ValidateDto for UpdateGoalDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate name if provided
        if let Some(ref name) = self.name {
            validate_name(name)?;
        }
        
        // Validate description if provided
        validate_description(&self.description, MAX_DESCRIPTION_LENGTH)?;
        
        // Validate target_date if provided
        if let Some(target_date) = self.target_date {
            let now = Utc::now();
            if target_date < now {
                return Err(ValidationError::FieldError {
                    field: "target_date".to_string(),
                    message: "cannot be in the past".to_string(),
                });
            }
        }
        
        // Validate status if provided
        if let Some(ref status) = self.status {
            let status_str = match status {
                crate::database::models::goal::GoalStatus::Active => "active",
                crate::database::models::goal::GoalStatus::Completed => "completed",
                crate::database::models::goal::GoalStatus::Paused => "paused",
                crate::database::models::goal::GoalStatus::Cancelled => "cancelled",
            };
            validate_status(status_str, "goal")?;
        }
        
        // Validate progress if provided
        if let Some(progress) = self.progress {
            validate_progress(progress)?;
        }
        
        // Ensure at least one field is being updated
        if self.name.is_none() && self.description.is_none() && 
           self.target_date.is_none() && self.status.is_none() && 
           self.progress.is_none() {
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
    use chrono::{DateTime, NaiveDate, TimeZone};
    use crate::database::models::goal::GoalStatus;

    #[test]
    fn test_create_goal_validation() {
        let valid_dto = CreateGoalDto {
            life_area_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Lose 20 pounds".to_string(),
            description: Some("Get healthier by losing weight".to_string()),
            target_date: Some(Utc.with_ymd_and_hms(2025, 12, 31, 0, 0, 0).unwrap()),
            status: GoalStatus::Active,
        };
        assert!(valid_dto.validate().is_ok());

        let invalid_uuid_dto = CreateGoalDto {
            life_area_id: "invalid-uuid".to_string(),
            name: "Goal".to_string(),
            description: None,
            target_date: None,
            status: GoalStatus::Active,
        };
        assert!(invalid_uuid_dto.validate().is_err());

        let past_date_dto = CreateGoalDto {
            life_area_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            name: "Goal".to_string(),
            description: None,
            target_date: Some(Utc.with_ymd_and_hms(2020, 1, 1, 0, 0, 0).unwrap()),
            status: GoalStatus::Active,
        };
        assert!(past_date_dto.validate().is_err());
    }

    #[test]
    fn test_update_goal_validation() {
        let valid_dto = UpdateGoalDto {
            name: Some("Updated Goal".to_string()),
            description: None,
            target_date: None,
            status: Some(GoalStatus::Completed),
            progress: Some(100),
        };
        assert!(valid_dto.validate().is_ok());


        let invalid_progress_dto = UpdateGoalDto {
            name: None,
            description: None,
            target_date: None,
            status: None,
            progress: Some(150),
        };
        assert!(invalid_progress_dto.validate().is_err());
    }
}