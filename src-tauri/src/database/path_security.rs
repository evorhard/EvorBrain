/// Path security utilities for preventing path traversal attacks
use std::path::{Path, PathBuf};
use crate::database::{DatabaseError, DatabaseResult};

/// Validates and sanitizes a path to prevent directory traversal attacks
pub fn validate_path(base_dir: &Path, requested_path: &Path) -> DatabaseResult<PathBuf> {
    // Get the canonical (absolute) path of the base directory
    let canonical_base = base_dir.canonicalize()
        .map_err(|e| DatabaseError::SecurityError(format!("Failed to resolve base directory: {}", e)))?;
    
    // Resolve the requested path relative to the base
    let resolved_path = if requested_path.is_absolute() {
        // If absolute path provided, reject it for security
        return Err(DatabaseError::SecurityError(
            "Absolute paths are not allowed".to_string()
        ));
    } else {
        canonical_base.join(requested_path)
    };
    
    // Get the canonical path to resolve any .. or . segments
    let canonical_requested = resolved_path.canonicalize()
        .or_else(|_| {
            // If the file doesn't exist yet, canonicalize the parent and append the filename
            if let Some(parent) = resolved_path.parent() {
                if let Some(file_name) = resolved_path.file_name() {
                    parent.canonicalize()
                        .map(|p| p.join(file_name))
                        .map_err(|e| DatabaseError::SecurityError(format!("Failed to resolve path: {}", e)))
                } else {
                    Err(DatabaseError::SecurityError("Invalid file name".to_string()))
                }
            } else {
                Err(DatabaseError::SecurityError("Invalid path structure".to_string()))
            }
        })?;
    
    // Ensure the resolved path is within the base directory
    if !canonical_requested.starts_with(&canonical_base) {
        return Err(DatabaseError::SecurityError(
            "Path traversal attempt detected: requested path is outside the allowed directory".to_string()
        ));
    }
    
    Ok(canonical_requested)
}

/// Validates that a filename is safe (no directory separators or special characters)
pub fn validate_filename(filename: &str) -> DatabaseResult<&str> {
    // Check for empty filename
    if filename.is_empty() {
        return Err(DatabaseError::SecurityError("Filename cannot be empty".to_string()));
    }
    
    // Check for directory separators
    if filename.contains('/') || filename.contains('\\') {
        return Err(DatabaseError::SecurityError(
            "Filename cannot contain directory separators".to_string()
        ));
    }
    
    // Check for parent directory references
    if filename == ".." || filename == "." {
        return Err(DatabaseError::SecurityError(
            "Invalid filename: cannot use . or ..".to_string()
        ));
    }
    
    // Check for null bytes
    if filename.contains('\0') {
        return Err(DatabaseError::SecurityError(
            "Filename cannot contain null bytes".to_string()
        ));
    }
    
    // On Windows, check for reserved names and invalid characters
    #[cfg(target_os = "windows")]
    {
        let reserved_names = ["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", 
                             "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", 
                             "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"];
        
        let name_upper = filename.to_uppercase();
        let base_name = name_upper.split('.').next().unwrap_or(&name_upper);
        
        if reserved_names.contains(&base_name) {
            return Err(DatabaseError::SecurityError(
                format!("Invalid filename: {} is a reserved name on Windows", filename)
            ));
        }
        
        // Check for invalid Windows characters
        let invalid_chars = ['<', '>', ':', '"', '|', '?', '*'];
        for ch in invalid_chars {
            if filename.contains(ch) {
                return Err(DatabaseError::SecurityError(
                    format!("Invalid filename: cannot contain '{}'", ch)
                ));
            }
        }
    }
    
    Ok(filename)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_validate_path_normal() {
        let temp_dir = TempDir::new().unwrap();
        let base_path = temp_dir.path();
        
        // Create a subdirectory
        let sub_dir = base_path.join("subdir");
        fs::create_dir(&sub_dir).unwrap();
        
        // Test valid relative path
        let result = validate_path(base_path, Path::new("subdir/file.db"));
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_validate_path_traversal_attempt() {
        let temp_dir = TempDir::new().unwrap();
        let base_path = temp_dir.path();
        
        // Test path traversal attempt
        let result = validate_path(base_path, Path::new("../../../etc/passwd"));
        assert!(result.is_err());
        
        if let Err(DatabaseError::SecurityError(msg)) = result {
            assert!(msg.contains("Path traversal attempt detected"));
        } else {
            panic!("Expected SecurityError");
        }
    }
    
    #[test]
    fn test_validate_path_absolute_rejected() {
        let temp_dir = TempDir::new().unwrap();
        let base_path = temp_dir.path();
        
        // Test absolute path
        let result = validate_path(base_path, Path::new("/etc/passwd"));
        assert!(result.is_err());
        
        if let Err(DatabaseError::SecurityError(msg)) = result {
            assert!(msg.contains("Absolute paths are not allowed"));
        } else {
            panic!("Expected SecurityError");
        }
    }
    
    #[test]
    fn test_validate_filename_valid() {
        assert!(validate_filename("evorbrain.db").is_ok());
        assert!(validate_filename("backup_2025.db").is_ok());
        assert!(validate_filename("test-file.json").is_ok());
    }
    
    #[test]
    fn test_validate_filename_invalid() {
        // Directory separators
        assert!(validate_filename("../evil.db").is_err());
        assert!(validate_filename("path/to/file.db").is_err());
        assert!(validate_filename("path\\to\\file.db").is_err());
        
        // Special names
        assert!(validate_filename("..").is_err());
        assert!(validate_filename(".").is_err());
        
        // Empty
        assert!(validate_filename("").is_err());
        
        // Null bytes
        assert!(validate_filename("file\0.db").is_err());
    }
    
    #[test]
    #[cfg(target_os = "windows")]
    fn test_validate_filename_windows() {
        // Reserved names
        assert!(validate_filename("CON").is_err());
        assert!(validate_filename("con.txt").is_err());
        assert!(validate_filename("PRN.db").is_err());
        
        // Invalid characters
        assert!(validate_filename("file<>.db").is_err());
        assert!(validate_filename("file:name.db").is_err());
        assert!(validate_filename("file|name.db").is_err());
    }
}