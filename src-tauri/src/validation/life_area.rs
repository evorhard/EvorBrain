/// Life Area validation
use crate::database::models::life_area::{CreateLifeAreaDto, UpdateLifeAreaDto};
use super::{ValidateDto, ValidationError, validate_name, validate_description, validate_hex_color, MAX_DESCRIPTION_LENGTH};

impl ValidateDto for CreateLifeAreaDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate name
        validate_name(&self.name)?;
        
        // Validate description
        validate_description(&self.description, MAX_DESCRIPTION_LENGTH)?;
        
        // Validate color
        validate_hex_color(&self.color)?;
        
        Ok(())
    }
}

impl ValidateDto for UpdateLifeAreaDto {
    fn validate(&self) -> Result<(), ValidationError> {
        // Validate name if provided
        if let Some(ref name) = self.name {
            validate_name(name)?;
        }
        
        // Validate description if provided
        validate_description(&self.description, MAX_DESCRIPTION_LENGTH)?;
        
        // Validate color if provided
        if let Some(ref color) = self.color {
            validate_hex_color(color)?;
        }
        
        // Validate order_index if provided
        if let Some(order_index) = self.order_index {
            if order_index < 0 {
                return Err(ValidationError::FieldError {
                    field: "order_index".to_string(),
                    message: "must be a non-negative number".to_string(),
                });
            }
        }
        
        // Ensure at least one field is being updated
        if self.name.is_none() && self.description.is_none() && 
           self.color.is_none() && self.order_index.is_none() {
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

    #[test]
    fn test_create_life_area_validation() {
        let valid_dto = CreateLifeAreaDto {
            name: "Health".to_string(),
            description: Some("Health and fitness goals".to_string()),
            color: "#FF5733".to_string(),
        };
        assert!(valid_dto.validate().is_ok());

        let invalid_dto = CreateLifeAreaDto {
            name: "".to_string(),
            description: None,
            color: "#FF5733".to_string(),
        };
        assert!(invalid_dto.validate().is_err());

        let invalid_color_dto = CreateLifeAreaDto {
            name: "Health".to_string(),
            description: None,
            color: "invalid".to_string(),
        };
        assert!(invalid_color_dto.validate().is_err());
    }

    #[test]
    fn test_update_life_area_validation() {
        let valid_dto = UpdateLifeAreaDto {
            name: Some("Updated Health".to_string()),
            description: None,
            color: None,
            order_index: None,
        };
        assert!(valid_dto.validate().is_ok());

        let empty_dto = UpdateLifeAreaDto {
            name: None,
            description: None,
            color: None,
            order_index: None,
        };
        assert!(empty_dto.validate().is_err());
    }
}