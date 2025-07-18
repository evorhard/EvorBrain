/// Goal model
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase", type_name = "TEXT")]
pub enum GoalStatus {
    Active,
    Completed,
    Paused,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Goal {
    pub id: String,
    pub life_area_id: String,
    pub name: String,
    pub description: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub status: GoalStatus,
    pub progress: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateGoalDto {
    pub life_area_id: String,
    pub name: String,
    pub description: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub status: GoalStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGoalDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub life_area_id: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub status: Option<GoalStatus>,
}