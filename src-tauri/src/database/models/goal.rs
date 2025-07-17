/// Goal model
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
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
    pub target_date: Option<NaiveDate>,
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
    pub target_date: Option<NaiveDate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGoalDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub target_date: Option<NaiveDate>,
    pub status: Option<GoalStatus>,
    pub progress: Option<i32>,
}