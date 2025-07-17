/// Database module for EvorBrain
/// 
/// Handles all database operations including connection management,
/// migrations, and data access layers.

pub mod connection;
pub mod error;
pub mod models;
pub mod migrations;

pub use connection::Database;
pub use error::{DatabaseError, DatabaseResult};

// Re-export commonly used types
pub use sqlx::{Pool, Sqlite};