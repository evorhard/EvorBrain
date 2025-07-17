/// Life Area model
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct LifeArea {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: String,
    pub icon: Option<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLifeAreaDto {
    pub name: String,
    pub description: Option<String>,
    pub color: String,
    pub icon: Option<String>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateLifeAreaDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub sort_order: Option<i32>,
}