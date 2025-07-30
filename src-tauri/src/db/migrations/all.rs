use super::Migration;

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration::new(
            1,
            "Initial schema",
            include_str!("./sql/001_initial_schema.up.sql"),
            include_str!("./sql/001_initial_schema.down.sql"),
        ),
        Migration::new(
            2,
            "Add tags system",
            include_str!("./sql/002_add_tags.up.sql"),
            include_str!("./sql/002_add_tags.down.sql"),
        ),
    ]
}