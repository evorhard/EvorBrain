use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use sqlx::{Type, FromRow};
use uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct LifeArea {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub archived_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Goal {
    pub id: String,
    pub life_area_id: String,
    pub title: String,
    pub description: Option<String>,
    pub target_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub archived_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: String,
    pub goal_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: ProjectStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub archived_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Task {
    pub id: String,
    pub project_id: Option<String>,
    pub parent_task_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub priority: TaskPriority,
    pub due_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub archived_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Note {
    pub id: String,
    pub task_id: Option<String>,
    pub project_id: Option<String>,
    pub goal_id: Option<String>,
    pub life_area_id: Option<String>,
    pub title: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub archived_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct TaskTag {
    pub task_id: String,
    pub tag_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ProjectTag {
    pub project_id: String,
    pub tag_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[sqlx(type_name = "TEXT")]
#[serde(rename_all = "lowercase")]
pub enum ProjectStatus {
    Planning,
    Active,
    OnHold,
    Completed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[sqlx(type_name = "TEXT")]
#[serde(rename_all = "lowercase")]
pub enum TaskPriority {
    Low,
    Medium,
    High,
    Urgent,
}

impl Default for TaskPriority {
    fn default() -> Self {
        TaskPriority::Medium
    }
}

impl std::fmt::Display for ProjectStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProjectStatus::Planning => write!(f, "planning"),
            ProjectStatus::Active => write!(f, "active"),
            ProjectStatus::OnHold => write!(f, "onhold"),
            ProjectStatus::Completed => write!(f, "completed"),
            ProjectStatus::Cancelled => write!(f, "cancelled"),
        }
    }
}

impl std::str::FromStr for ProjectStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "planning" => Ok(ProjectStatus::Planning),
            "active" => Ok(ProjectStatus::Active),
            "onhold" => Ok(ProjectStatus::OnHold),
            "completed" => Ok(ProjectStatus::Completed),
            "cancelled" => Ok(ProjectStatus::Cancelled),
            _ => Err(format!("Invalid project status: {}", s)),
        }
    }
}

impl std::fmt::Display for TaskPriority {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TaskPriority::Low => write!(f, "low"),
            TaskPriority::Medium => write!(f, "medium"),
            TaskPriority::High => write!(f, "high"),
            TaskPriority::Urgent => write!(f, "urgent"),
        }
    }
}

impl std::str::FromStr for TaskPriority {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "low" => Ok(TaskPriority::Low),
            "medium" => Ok(TaskPriority::Medium),
            "high" => Ok(TaskPriority::High),
            "urgent" => Ok(TaskPriority::Urgent),
            _ => Err(format!("Invalid task priority: {}", s)),
        }
    }
}

// Implementation helpers for models
impl LifeArea {
    pub fn new(name: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            description: None,
            color: None,
            icon: None,
            created_at: now,
            updated_at: now,
            archived_at: None,
        }
    }

    pub fn is_archived(&self) -> bool {
        self.archived_at.is_some()
    }
}

impl Goal {
    pub fn new(life_area_id: String, title: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            life_area_id,
            title,
            description: None,
            target_date: None,
            created_at: now,
            updated_at: now,
            completed_at: None,
            archived_at: None,
        }
    }

    pub fn is_completed(&self) -> bool {
        self.completed_at.is_some()
    }

    pub fn is_archived(&self) -> bool {
        self.archived_at.is_some()
    }
}

impl Project {
    pub fn new(goal_id: String, title: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            goal_id,
            title,
            description: None,
            status: ProjectStatus::Planning,
            created_at: now,
            updated_at: now,
            completed_at: None,
            archived_at: None,
        }
    }

    pub fn is_active(&self) -> bool {
        matches!(self.status, ProjectStatus::Active)
    }

    pub fn is_completed(&self) -> bool {
        matches!(self.status, ProjectStatus::Completed) || self.completed_at.is_some()
    }

    pub fn is_archived(&self) -> bool {
        self.archived_at.is_some()
    }
}

impl Task {
    pub fn new(title: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            project_id: None,
            parent_task_id: None,
            title,
            description: None,
            priority: TaskPriority::default(),
            due_date: None,
            created_at: now,
            updated_at: now,
            completed_at: None,
            archived_at: None,
        }
    }

    pub fn with_project(mut self, project_id: String) -> Self {
        self.project_id = Some(project_id);
        self
    }

    pub fn with_parent(mut self, parent_task_id: String) -> Self {
        self.parent_task_id = Some(parent_task_id);
        self
    }

    pub fn is_completed(&self) -> bool {
        self.completed_at.is_some()
    }

    pub fn is_archived(&self) -> bool {
        self.archived_at.is_some()
    }

    pub fn is_overdue(&self) -> bool {
        if let Some(due) = self.due_date {
            !self.is_completed() && due < Utc::now()
        } else {
            false
        }
    }
}

impl Note {
    pub fn new(title: String, content: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            task_id: None,
            project_id: None,
            goal_id: None,
            life_area_id: None,
            title,
            content,
            created_at: now,
            updated_at: now,
            archived_at: None,
        }
    }

    pub fn for_task(mut self, task_id: String) -> Self {
        self.task_id = Some(task_id);
        self
    }

    pub fn for_project(mut self, project_id: String) -> Self {
        self.project_id = Some(project_id);
        self
    }

    pub fn for_goal(mut self, goal_id: String) -> Self {
        self.goal_id = Some(goal_id);
        self
    }

    pub fn for_life_area(mut self, life_area_id: String) -> Self {
        self.life_area_id = Some(life_area_id);
        self
    }

    pub fn is_archived(&self) -> bool {
        self.archived_at.is_some()
    }
}

impl Tag {
    pub fn new(name: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            color: None,
            created_at: Utc::now(),
        }
    }

    pub fn with_color(mut self, color: String) -> Self {
        self.color = Some(color);
        self
    }
}

// Additional type aliases for common query results
pub type TaskWithTags = (Task, Vec<Tag>);
pub type ProjectWithTags = (Project, Vec<Tag>);

// Query builder helpers
#[derive(Debug, Default)]
pub struct TaskFilter {
    pub project_id: Option<String>,
    pub parent_task_id: Option<String>,
    pub priority: Option<TaskPriority>,
    pub completed: Option<bool>,
    pub archived: Option<bool>,
    pub overdue: Option<bool>,
}

#[derive(Debug, Default)]
pub struct ProjectFilter {
    pub goal_id: Option<String>,
    pub status: Option<ProjectStatus>,
    pub completed: Option<bool>,
    pub archived: Option<bool>,
}