# Database Migrations

This directory contains the database migration system for EvorBrain.

## Structure

- `mod.rs` - Main migration runner implementation
- `all.rs` - Registry of all migrations
- `commands.rs` - Tauri commands for migration management
- `sql/` - SQL migration files

## Creating a New Migration

1. Create two new SQL files in the `sql/` directory:
   - `XXX_description.up.sql` - Forward migration
   - `XXX_description.down.sql` - Rollback migration
   
   Where XXX is the next version number (e.g., 002, 003, etc.)

2. Add the migration to `all.rs`:
   ```rust
   Migration::new(
       2,
       "Add user preferences table",
       include_str!("./sql/002_user_preferences.up.sql"),
       include_str!("./sql/002_user_preferences.down.sql"),
   ),
   ```

## Available Tauri Commands

These commands can be invoked from the frontend:

- `get_migration_status` - Shows the current migration status
- `run_migrations` - Runs all pending migrations
- `rollback_migration` - Rolls back to a specific version (or all if no version specified)
- `reset_database` - (Dev only) Drops all tables and re-runs all migrations

## Example Usage from Frontend

```typescript
import { invoke } from '@tauri-apps/api/core';

// Check migration status
const status = await invoke('get_migration_status');
console.log(status);

// Run migrations
const result = await invoke('run_migrations');
console.log(result);

// Rollback to version 1
const rollbackResult = await invoke('rollback_migration', { targetVersion: 1 });
console.log(rollbackResult);

// Reset database (development only)
const resetResult = await invoke('reset_database');
console.log(resetResult);
```

## Best Practices

1. Always include both up and down migrations
2. Test your down migrations to ensure they work correctly
3. Keep migrations atomic - one logical change per migration
4. Never modify existing migrations once they've been applied
5. Use explicit column types and constraints
6. Include appropriate indexes in your migrations
7. Consider the impact on existing data when writing migrations