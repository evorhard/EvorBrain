use crate::logger::{LogEntry, LogLevel};
use crate::error::AppResult;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GetLogsRequest {
    pub count: Option<usize>,
    pub level_filter: Option<LogLevel>,
}

#[tauri::command]
pub fn get_recent_logs(request: GetLogsRequest) -> AppResult<Vec<LogEntry>> {
    let count = request.count.unwrap_or(100);
    
    unsafe {
        if let Some(logger) = &crate::logger::LOGGER {
            let logs = logger.get_recent_logs(count)
                .map_err(|e| crate::error::AppError::new(
                    crate::error::ErrorCode::InternalError,
                    format!("Failed to retrieve logs: {}", e)
                ))?;
            
            // Filter by level if requested
            if let Some(filter_level) = request.level_filter {
                Ok(logs.into_iter()
                    .filter(|entry| entry.level.should_log(&filter_level))
                    .collect())
            } else {
                Ok(logs)
            }
        } else {
            Ok(Vec::new())
        }
    }
}

#[tauri::command]
pub fn set_log_level(level: LogLevel) -> AppResult<()> {
    unsafe {
        if let Some(logger) = &crate::logger::LOGGER {
            logger.set_level(level);
            crate::log_info!("Log level changed", &format!("New level: {:?}", level));
            Ok(())
        } else {
            Err(crate::error::AppError::new(
                crate::error::ErrorCode::InternalError,
                "Logger not initialized"
            ))
        }
    }
}