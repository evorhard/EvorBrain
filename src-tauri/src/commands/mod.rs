/// Tauri command modules
/// 
/// This module contains all Tauri IPC commands organized by entity type.
/// Each submodule handles CRUD operations for its respective entity.

pub mod life_areas;
pub mod goals;
pub mod projects;
pub mod tasks;

// Re-export all command functions for easy registration
pub use life_areas::*;
pub use goals::*;
pub use projects::*;
pub use tasks::*;