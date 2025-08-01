//! Tauri command handlers for EvorBrain application
//! 
//! This module contains all the command handlers that are exposed to the frontend
//! through Tauri's IPC mechanism. Commands are organized by entity type.

/// Commands for managing life areas
pub mod life_areas;
/// Commands for managing goals within life areas
pub mod goals;
/// Commands for managing projects within goals
pub mod projects;
/// Commands for managing tasks within projects
pub mod tasks;
/// Commands for managing notes attached to various entities
pub mod notes;
/// Commands for application logging and diagnostics
pub mod logging;
/// Commands for database maintenance and repository operations
pub mod repository;

pub use life_areas::*;
pub use goals::*;
pub use projects::*;
pub use tasks::*;
pub use notes::*;
pub use logging::*;
pub use repository::*;