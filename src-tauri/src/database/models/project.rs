/// Project model
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(rename_all = "snake_case")]
pub enum ProjectStatus {
    Planning,
    Active,
    Completed,
    OnHold,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub goal_id: String,
    pub name: String,
    pub description: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub due_date: Option<NaiveDate>,
    pub status: ProjectStatus,
    pub progress: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectDto {
    pub goal_id: String,
    pub name: String,
    pub description: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub due_date: Option<NaiveDate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProjectDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub due_date: Option<NaiveDate>,
    pub status: Option<ProjectStatus>,
    pub progress: Option<i32>,
}