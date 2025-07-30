use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

impl LogLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            LogLevel::Error => "ERROR",
            LogLevel::Warn => "WARN",
            LogLevel::Info => "INFO",
            LogLevel::Debug => "DEBUG",
            LogLevel::Trace => "TRACE",
        }
    }
    
    pub fn should_log(&self, filter_level: &LogLevel) -> bool {
        (*self as u8) <= (*filter_level as u8)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: DateTime<Utc>,
    pub level: LogLevel,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_details: Option<String>,
}

pub struct Logger {
    log_file: Mutex<PathBuf>,
    log_level: Mutex<LogLevel>,
}

impl Logger {
    pub fn new(app_handle: &AppHandle) -> Result<Self, Box<dyn std::error::Error>> {
        let log_dir = app_handle
            .path()
            .app_log_dir()
            .expect("Failed to get app log directory");
        
        // Create logs directory if it doesn't exist
        fs::create_dir_all(&log_dir)?;
        
        // Create log file with date in filename
        let log_filename = format!("evorbrain_{}.log", Utc::now().format("%Y-%m-%d"));
        let log_file = log_dir.join(log_filename);
        
        Ok(Self {
            log_file: Mutex::new(log_file),
            log_level: Mutex::new(LogLevel::Info),
        })
    }
    
    pub fn set_level(&self, level: LogLevel) {
        if let Ok(mut log_level) = self.log_level.lock() {
            *log_level = level;
        }
    }
    
    pub fn log(&self, level: LogLevel, message: impl AsRef<str>, context: Option<String>, error: Option<&dyn std::error::Error>) {
        // Check if we should log this level
        if let Ok(filter_level) = self.log_level.lock() {
            if !level.should_log(&*filter_level) {
                return;
            }
        }
        
        let entry = LogEntry {
            timestamp: Utc::now(),
            level,
            message: message.as_ref().to_string(),
            context,
            error_details: error.map(|e| format!("{:?}", e)),
        };
        
        // Write to file
        if let Err(e) = self.write_to_file(&entry) {
            eprintln!("Failed to write log entry: {}", e);
        }
        
        // Also print to console in development
        #[cfg(debug_assertions)]
        {
            let level_str = entry.level.as_str();
            let timestamp = entry.timestamp.format("%Y-%m-%d %H:%M:%S%.3f");
            
            if let Some(ctx) = &entry.context {
                println!("[{}] {} [{}] {}", timestamp, level_str, ctx, entry.message);
            } else {
                println!("[{}] {} {}", timestamp, level_str, entry.message);
            }
            
            if let Some(err_details) = &entry.error_details {
                println!("  Error details: {}", err_details);
            }
        }
    }
    
    fn write_to_file(&self, entry: &LogEntry) -> Result<(), Box<dyn std::error::Error>> {
        if let Ok(log_file) = self.log_file.lock() {
            let mut file = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&*log_file)?;
            
            // Write as JSON Lines format
            let json = serde_json::to_string(entry)?;
            writeln!(file, "{}", json)?;
            file.flush()?;
        }
        
        Ok(())
    }
    
    // Convenience methods
    pub fn error(&self, message: impl AsRef<str>) {
        self.log(LogLevel::Error, message, None, None);
    }
    
    pub fn error_with_context(&self, message: impl AsRef<str>, context: impl AsRef<str>, error: Option<&dyn std::error::Error>) {
        self.log(LogLevel::Error, message, Some(context.as_ref().to_string()), error);
    }
    
    pub fn warn(&self, message: impl AsRef<str>) {
        self.log(LogLevel::Warn, message, None, None);
    }
    
    pub fn info(&self, message: impl AsRef<str>) {
        self.log(LogLevel::Info, message, None, None);
    }
    
    pub fn info_with_context(&self, message: impl AsRef<str>, context: impl AsRef<str>) {
        self.log(LogLevel::Info, message, Some(context.as_ref().to_string()), None);
    }
    
    pub fn debug(&self, message: impl AsRef<str>) {
        self.log(LogLevel::Debug, message, None, None);
    }
    
    pub fn trace(&self, message: impl AsRef<str>) {
        self.log(LogLevel::Trace, message, None, None);
    }
    
    // Get recent log entries for debugging/display
    pub fn get_recent_logs(&self, count: usize) -> Result<Vec<LogEntry>, Box<dyn std::error::Error>> {
        if let Ok(log_file) = self.log_file.lock() {
            if !log_file.exists() {
                return Ok(Vec::new());
            }
            
            let content = fs::read_to_string(&*log_file)?;
            let lines: Vec<&str> = content.lines().collect();
            
            let start = if lines.len() > count {
                lines.len() - count
            } else {
                0
            };
            
            let mut entries = Vec::new();
            for line in &lines[start..] {
                if let Ok(entry) = serde_json::from_str::<LogEntry>(line) {
                    entries.push(entry);
                }
            }
            
            Ok(entries)
        } else {
            Ok(Vec::new())
        }
    }
}

// Global logger instance
pub static mut LOGGER: Option<Logger> = None;
static LOGGER_INIT: std::sync::Once = std::sync::Once::new();

pub fn init_logger(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    unsafe {
        LOGGER_INIT.call_once(|| {
            match Logger::new(app_handle) {
                Ok(logger) => {
                    LOGGER = Some(logger);
                }
                Err(e) => {
                    eprintln!("Failed to initialize logger: {}", e);
                }
            }
        });
    }
    Ok(())
}

pub fn log(level: LogLevel, message: impl AsRef<str>, context: Option<String>, error: Option<&dyn std::error::Error>) {
    unsafe {
        if let Some(logger) = &LOGGER {
            logger.log(level, message, context, error);
        }
    }
}

// Convenience macros
#[macro_export]
macro_rules! log_error {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Error, $msg, None, None)
    };
    ($msg:expr, $err:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Error, $msg, None, Some(&$err))
    };
    ($msg:expr, $ctx:expr, $err:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Error, $msg, Some($ctx.to_string()), Some(&$err))
    };
}

#[macro_export]
macro_rules! log_warn {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Warn, $msg, None, None)
    };
}

#[macro_export]
macro_rules! log_info {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Info, $msg, None, None)
    };
    ($msg:expr, $ctx:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Info, $msg, Some($ctx.to_string()), None)
    };
}

#[macro_export]
macro_rules! log_debug {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Debug, $msg, None, None)
    };
}

#[macro_export]
macro_rules! log_trace {
    ($msg:expr) => {
        $crate::logger::log($crate::logger::LogLevel::Trace, $msg, None, None)
    };
}