# 📋 EvorBrain Task Tracking

## Overview

This document tracks all development tasks for the EvorBrain project. Tasks are organized by
development phase with difficulty ratings and current status.

## 🎯 Minimum Viable Product (MVP)

The MVP represents the minimum functionality needed for EvorBrain to be operational and useful.
These are the core features required before the first release:

### MVP Requirements

1. **Hierarchical Structure**
   - Life Areas → Goals → Projects → Tasks (with optional subtasks)
   - Tasks can exist independently (e.g., "chores" with subtasks like "take out trash", "do dishes")
   - Projects can link to goals and life areas (e.g., "Build SaaS app" → "Make $4000/month online" →
     "Career")
   - Flexible linking - not all items need to be connected

2. **Overview/Homepage**
   - Quick glance dashboard showing:
     - Tasks due today and upcoming
     - Active projects with progress indicators
     - Recent activity
   - Clean, intuitive interface for daily use

3. **Priority System**
   - Priority levels for all entities (Life Areas, Goals, Projects, Tasks)
   - Visual indicators for priority (colors, icons, or badges)
   - Ability to sort/filter by priority

4. **Calendar View**
   - Month/Week/Day views
   - Tasks displayed on calendar (even without specific times)
   - Easy filtering and sorting options (by priority, project, etc.)
   - Quick task creation from calendar

5. **Local File Storage**
   - All data stored locally in Obsidian-like manner
   - Human-readable markdown files
   - Attachments and media support
   - No cloud dependency

6. **Windows Support**
   - Full compatibility with Windows 10/11
   - Native performance
   - Proper file system integration

7. **Automatic Git Backups**
   - Auto-commit changes to local git repository
   - Push to remote repository (GitHub/GitLab)
   - Conflict resolution for multi-device sync
   - Backup scheduling options

### MVP Task Mapping

Based on our current task structure, here are the phases/tasks that MUST be completed for MVP:

- **Phase 1**: ✅ Complete (Foundation)
- **Phase 2**: Core Features
  - [P2.1] Data Models & CRUD - 🔄 In Progress (must complete)
  - [P2.2] Hierarchical Navigation - 📋 Required for MVP
  - [P2.3] Dashboard/Homepage - 📋 Required for MVP
  - [P2.4] Task Management UI - 📋 Required for MVP
  - [P2.5] Calendar View - 📋 Required for MVP
- **Phase 3**: Data Persistence
  - [P3.1] File System Integration - 📋 Required for MVP
  - [P3.2] Git Integration - 📋 Required for MVP

**Not Required for MVP** (but nice to have):

- Search functionality (P2.6)
- Markdown integration (P2.7) - basic support only needed
- Advanced backup options (P3.3)
- Import/Export (P3.4)
- Keyboard shortcuts (P4.1)
- UI animations (P4.2)
- Performance optimizations (P4.3)
- AI features (P5.1)
- Multi-platform support (P6.x)

**Testing Strategy for MVP**: While comprehensive testing (P7) is not required for MVP release, each
feature should have:

- Basic unit tests for critical functionality
- At least one integration test for the happy path
- Manual testing checklist for the feature

This ensures stability without delaying the MVP. Full test coverage can be added post-MVP.

**Legend:**

- ✅ Completed
- 🔄 In Progress
- 📋 Pending
- 🚧 Blocked
- ❌ Cancelled
- ⚠️ Blocked by technical debt (see specific section for details)

**Difficulty Levels:**

- 🟢 Easy: < 2 hours
- 🟡 Medium: 2-8 hours
- 🔴 High: 1-3 days
- ⚫ Very High: 3+ days

---

## Phase 1: Foundation [P1]

### [P1.1] Project Setup

- [x] ✅ [P1.1.1] Initialize Tauri project with SolidJS template 🟢
- [x] ✅ [P1.1.2] Configure Bun as package manager 🟢
- [x] ✅ [P1.1.3] Set up TypeScript configuration 🟢
- [x] ✅ [P1.1.4] Configure Tailwind CSS 🟢
- [x] ✅ [P1.1.5] Set up development environment scripts 🟢
- [x] ✅ [P1.1.6] Configure Git with .gitignore 🟢

### [P1.2] UI Foundation

- [x] ✅ [P1.2.1] Create base layout components 🟡
- [x] ✅ [P1.2.2] Implement navigation sidebar 🟡
- [x] ✅ [P1.2.3] Design color scheme and theme system 🟡
- [x] ✅ [P1.2.4] Set up Kobalte component library 🟢
- [x] ✅ [P1.2.5] Create basic button, input, and modal components 🟡
- [x] ✅ [P1.2.6] Implement responsive design breakpoints 🟡

### [P1.3] Database Setup

- [x] ✅ [P1.3.1] Integrate SQLite with Tauri 🟡
- [x] ✅ [P1.3.2] Create database migration system 🔴
- [x] ✅ [P1.3.3] Implement initial schema 🟡
- [x] ✅ [P1.3.4] Create Rust database models 🟡
- [x] ✅ [P1.3.5] Build database connection pool 🟡
- [x] ✅ [P1.3.6] Add database initialization on first run 🟡

### [P1.4] Core Infrastructure

- [x] ✅ [P1.4.1] Set up Tauri IPC commands structure 🟡
- [x] ✅ [P1.4.2] Create error handling system 🟡
- [x] ✅ [P1.4.3] Implement logging infrastructure 🟡
- [x] ✅ [P1.4.4] Build frontend API client 🟡
- [x] ✅ [P1.4.5] Create TypeScript type definitions 🟢
- [x] ✅ [P1.4.6] Set up state management structure 🟡
- [x] ✅ [P1.4.7] Replace all `any` types with proper TypeScript types 🟢
- [x] ✅ [P1.4.8] Fix memory leaks in theme system 🟢
- [x] ✅ [P1.4.9] Create Tauri commands for repository operations 🟡

### [P1.5] Testing Setup

- [x] ✅ [P1.5.1] Set up Vitest for unit testing 🟡
- [x] ✅ [P1.5.2] Configure Testing Library for component tests 🟡
- [x] ✅ [P1.5.3] Set up e2e testing with Playwright 🔴
- [x] ✅ [P1.5.4] Create test utilities and helpers 🟡
- [x] ✅ [P1.5.5] Write initial test suite for existing components 🟡
- [x] ✅ [P1.5.6] Add test coverage reporting 🟢

### [P1.6] Development Tooling

- [x] ✅ [P1.6.1] Set up ESLint with TypeScript rules 🟢
- [x] ✅ [P1.6.2] Configure Prettier for code formatting 🟢
- [x] ✅ [P1.6.3] Create pre-commit hooks with Husky 🟢

### [P1.7] Documentation Standards

- [x] ✅ [P1.7.1] Add JSDoc comments to all public APIs 🟢
- [x] ✅ [P1.7.2] Create component documentation standards 🟢
- [x] ✅ [P1.7.3] Document complex business logic 🟢
- [x] ✅ [P1.7.4] Set up automated documentation generation 🟡
- [x] ✅ [P1.7.5] Update README with recent code quality improvements 🟢

### [P1.8] Code Quality & Cleanup

- [x] ✅ [P1.8.1] Fix ESLint errors (reduced from 181 to 2 warnings) 🟡
- [x] ✅ [P1.8.2] Remove all `any` types in test files 🟢
- [x] ✅ [P1.8.3] Fix duplicate imports across codebase 🟢
- [x] ✅ [P1.8.4] Replace `confirm`/`alert` with proper UI modals 🟡
- [x] ✅ [P1.8.5] Fix SolidJS reactivity warnings 🟡
- [x] ✅ [P1.8.6] Remove unused variables and imports 🟢
- [x] ✅ [P1.8.7] Remove unused demo/test components (8 files) 🟢
- [x] ✅ [P1.8.8] Fix duplicate imports from 'solid-js' (19 files) 🟢
- [x] ✅ [P1.8.9] Apply Prettier formatting to codebase 🟢
- [x] ✅ [P1.8.10] Consolidate imports across codebase 🟢
- [x] ✅ [P1.8.11] Update documentation to reflect recent improvements 🟢

---

## Phase 2: Core Features [P2]

### [P2.1] Data Models & CRUD

- [x] ✅ [P2.1.1] Implement Life Area CRUD operations 🟡
- [x] ✅ [P2.1.2] Implement Goal CRUD operations 🟡
- [x] ✅ [P2.1.3] Implement Project CRUD operations 🟡
- [x] ✅ [P2.1.4] Implement Task CRUD operations 🟡
- [x] ✅ [P2.1.5] Add subtask support 🟡
- [x] ✅ [P2.1.6] Implement archiving functionality 🟢

### [P2.1.T] Tests for Data Models & CRUD

**✅ RESOLVED: Testing infrastructure issues have been fixed by P2.1.T.8:**

- ✅ Factory pattern for testable stores implemented
- ✅ API abstraction layer with TestApiClient for isolated testing
- ✅ Context-based stores with dependency injection
- ✅ Enhanced TauriMock with better isolation

**Testing Approach:** Use the same patterns demonstrated in P2.1.T.1 (Life Area tests):

1. Factory pattern for stores (e.g., `createGoalStoreFactory`, `createProjectStoreFactory`)
2. TestApiClient for API mocking instead of vi.mock
3. Context providers for better component testability
4. UI-only tests for components without store dependencies

- [x] ✅ [P2.1.T.1] Write unit tests for Life Area components 🟡 _(Complete - 55 tests passing)_
  - [x] Test validation and error handling (14 tests in LifeAreaValidation.test.tsx)
  - [x] Test create/edit operations (10 tests in LifeAreaForm.test.tsx)
  - [x] Test UI components without store dependencies (10 tests in LifeAreaUI.test.tsx)
  - [x] Test LifeAreaList component with factory pattern (7 tests in LifeAreaList.factory.test.tsx)
  - [x] Test store factory pattern (14 tests in lifeAreaStore.factory.test.ts)
  - [ ] Note: LifeAreaList.test.tsx blocked by singleton store initialization
- [ ] 📋 [P2.1.T.2] Write unit tests for Goal components 🟡
  - [ ] Test GoalList component interactions (use factory pattern like P2.1.T.1)
  - [ ] Test GoalForm component (use factory pattern approach)
  - [ ] Test GoalsPage component (use factory pattern approach)
  - [ ] Fix failing tests and add missing coverage
  - [ ] **Recommended**: Create UI-only Goal tests without store dependencies
  - [ ] **Recommended**: Use createGoalStoreFactory pattern like Life Areas
- [ ] 📋 [P2.1.T.3] Write unit tests for Project components 🟡
  - [ ] Test ProjectList component (use factory pattern like P2.1.T.1)
  - [ ] Test ProjectForm component (use factory pattern approach)
  - [ ] Test ProjectsPage component (use factory pattern approach)
  - [ ] Test project status transitions (use TestApiClient)
  - [ ] **Recommended**: Create UI-only Project tests without store dependencies
  - [ ] **Recommended**: Test project status enum values and transitions logic
  - [ ] **Recommended**: Use createProjectStoreFactory pattern like Life Areas
- [ ] 📋 [P2.1.T.4] Write unit tests for Task components 🟡
  - [ ] Test TaskList component (use factory pattern like P2.1.T.1)
  - [ ] Test TaskForm component (use factory pattern approach)
  - [ ] Test TaskDetail component (use factory pattern approach)
  - [ ] Test TasksPage component (use factory pattern approach)
  - [ ] Test subtask functionality (use TestApiClient)
  - [ ] **Recommended**: Create UI-only Task tests without store dependencies
  - [ ] **Recommended**: Test priority selector component in isolation
  - [ ] **Recommended**: Test date formatting and validation utilities
  - [ ] **Recommended**: Use createTaskStoreFactory pattern like Life Areas
- [ ] 📋 [P2.1.T.5] Write unit tests for Note components 🟡
  - [ ] Test note CRUD operations (use TestApiClient)
  - [ ] Test note associations with other entities (use factory pattern approach)
  - [ ] **Recommended**: Create UI-only Note editor tests
  - [ ] **Recommended**: Test markdown rendering in isolation
  - [ ] **Recommended**: Use createNoteStoreFactory pattern like Life Areas
- [ ] 📋 [P2.1.T.6] Write integration tests for stores 🟡
  - [ ] Test lifeAreaStore (use factory pattern demonstrated in P2.1.T.1)
  - [ ] Test goalStore (use createGoalStoreFactory)
  - [ ] Test projectStore (use createProjectStoreFactory)
  - [ ] Test taskStore (use createTaskStoreFactory)
  - [ ] Test noteStore (use createNoteStoreFactory)
  - [ ] **Alternative**: Consider E2E tests with Playwright instead
- [ ] 📋 [P2.1.T.7] Write unit tests for archiving functionality 🟡
  - [ ] Test cascading archive operations (use TestApiClient)
  - [ ] Test restore operations (use TestApiClient)
  - [ ] Test UI state updates after archive/restore (use factory pattern)
  - [ ] **Recommended**: Test archive/restore UI buttons and confirmation dialogs
  - [ ] **Recommended**: Test archived item visual indicators (opacity, badges)
- [x] ✅ [P2.1.T.8] Fix test infrastructure issues ⚠️ COMPLETED
  - [x] Refactor stores to use lazy initialization or dependency injection 🟡
  - [x] Create API abstraction layer with test doubles 🟡
  - [x] Resolve "computations created outside createRoot" warnings 🟢
  - [x] Fix module mocking limitations with vi.mock 🟡
  - [x] Update TauriMock for better isolation 🟡
  - [x] Create store providers that can be mocked for tests 🟡
  - [ ] Ensure all tests pass in CI 🟡 (partial - 10/22 test files passing)

### [P2.2] Hierarchical Navigation

- [ ] 📋 [P2.2.1] Build tree view component 🔴
- [ ] 📋 [P2.2.2] Implement expand/collapse functionality 🟡
- [ ] 📋 [P2.2.3] Add drag-and-drop reordering 🔴
- [ ] 📋 [P2.2.4] Create breadcrumb navigation 🟡
- [ ] 📋 [P2.2.5] Implement context menus 🟡
- [ ] 📋 [P2.2.6] Add keyboard navigation 🟡

### [P2.2.T] Tests for Hierarchical Navigation

- [ ] 📋 [P2.2.T.1] Write tests for tree view component 🟡
- [ ] 📋 [P2.2.T.2] Test drag-and-drop functionality 🟡
- [ ] 📋 [P2.2.T.3] Test keyboard navigation 🟢
- [ ] 📋 [P2.2.T.4] Test breadcrumb navigation 🟢

### [P2.3] Dashboard/Homepage

- [ ] 📋 [P2.3.1] Design dashboard layout 🟡
- [ ] 📋 [P2.3.2] Create today's tasks widget 🟡
- [ ] 📋 [P2.3.3] Build active projects widget 🟡
- [ ] 📋 [P2.3.4] Implement progress indicators 🟡
- [ ] 📋 [P2.3.5] Add quick-add task functionality 🟡
- [ ] 📋 [P2.3.6] Create recent activity feed 🟡

### [P2.4] Task Management UI

- [ ] 📋 [P2.4.1] Build task list component 🟡
- [ ] 📋 [P2.4.2] Implement task detail view 🟡
- [ ] 📋 [P2.4.3] Add inline editing 🟡
- [ ] 📋 [P2.4.4] Create priority selector 🟢
- [ ] 📋 [P2.4.5] Implement due date picker 🟡
- [ ] 📋 [P2.4.6] Add task completion animations 🟢

### [P2.5] Calendar View

- [ ] 📋 [P2.5.1] Create calendar grid component 🔴
- [ ] 📋 [P2.5.2] Implement month/week/day views 🔴
- [ ] 📋 [P2.5.3] Add task display on calendar 🟡
- [ ] 📋 [P2.5.4] Enable drag-and-drop scheduling 🔴
- [ ] 📋 [P2.5.5] Implement date navigation 🟡
- [ ] 📋 [P2.5.6] Add task creation from calendar 🟡

### [P2.6] Search Functionality

- [ ] 📋 [P2.6.1] Build search UI component 🟡
- [ ] 📋 [P2.6.2] Implement full-text search in Rust 🔴
- [ ] 📋 [P2.6.3] Add search filters (type, date, status) 🟡
- [ ] 📋 [P2.6.4] Create search results view 🟡
- [ ] 📋 [P2.6.5] Implement search highlighting 🟡
- [ ] 📋 [P2.6.6] Add recent searches 🟢

### [P2.7] Markdown Integration

- [ ] 📋 [P2.7.1] Integrate markdown editor library 🟡
- [ ] 📋 [P2.7.2] Add markdown preview 🟡
- [ ] 📋 [P2.7.3] Implement toolbar with formatting options 🟡
- [ ] 📋 [P2.7.4] Support task lists in markdown 🟡
- [ ] 📋 [P2.7.5] Add image/file attachment support 🔴
- [ ] 📋 [P2.7.6] Implement auto-save functionality 🟡

---

## Phase 3: Data Persistence [P3]

### [P3.1] File System Integration

- [ ] 📋 [P3.1.1] Design file structure implementation 🟡
- [ ] 📋 [P3.1.2] Create file read/write operations 🟡
- [ ] 📋 [P3.1.3] Implement metadata JSON handling 🟡
- [ ] 📋 [P3.1.4] Add markdown file management 🟡
- [ ] 📋 [P3.1.5] Build file watcher for external changes 🔴
- [ ] 📋 [P3.1.6] Implement file conflict resolution 🔴

### [P3.2] Git Integration

- [ ] 📋 [P3.2.1] Integrate Git library in Rust 🔴
- [ ] 📋 [P3.2.2] Implement auto-commit functionality 🟡
- [ ] 📋 [P3.2.3] Add commit message generation 🟡
- [ ] 📋 [P3.2.4] Build Git status indicator 🟡
- [ ] 📋 [P3.2.5] Create push/pull functionality 🔴
- [ ] 📋 [P3.2.6] Add conflict resolution UI 🔴

### [P3.3] Backup System

- [ ] 📋 [P3.3.1] Create backup scheduler 🟡
- [ ] 📋 [P3.3.2] Implement incremental backups 🟡
- [ ] 📋 [P3.3.3] Add backup restoration 🟡
- [ ] 📋 [P3.3.4] Build backup history view 🟡
- [ ] 📋 [P3.3.5] Create backup settings UI 🟢
- [ ] 📋 [P3.3.6] Add cloud backup options 🔴

### [P3.4] Import/Export

- [ ] 📋 [P3.4.1] Design import/export formats 🟡
- [ ] 📋 [P3.4.2] Implement CSV export 🟢
- [ ] 📋 [P3.4.3] Add JSON export/import 🟢
- [ ] 📋 [P3.4.4] Create Notion importer 🔴
- [ ] 📋 [P3.4.5] Build Obsidian importer 🔴
- [ ] 📋 [P3.4.6] Add progress indicators for long operations 🟡

### [P3.5] Settings Management

- [ ] 📋 [P3.5.1] Create settings UI 🟡
- [ ] 📋 [P3.5.2] Implement preferences storage 🟡
- [ ] 📋 [P3.5.3] Add theme customization 🟡
- [ ] 📋 [P3.5.4] Build hotkey configuration 🟡
- [ ] 📋 [P3.5.5] Create backup settings 🟢
- [ ] 📋 [P3.5.6] Add advanced options panel 🟡
- [ ] 📋 [P3.5.7] Implement secure storage patterns 🟡

---

## Phase 4: Polish & Performance [P4]

### [P4.1] Keyboard Shortcuts

- [ ] 📋 [P4.1.1] Implement global hotkey system 🟡
- [ ] 📋 [P4.1.2] Add command palette 🔴
- [ ] 📋 [P4.1.3] Create shortcut configuration UI 🟡
- [ ] 📋 [P4.1.4] Implement vim-style navigation (optional) 🔴
- [ ] 📋 [P4.1.5] Add quick-switch functionality 🟡
- [ ] 📋 [P4.1.6] Create shortcut cheat sheet 🟢

### [P4.2] UI Animations

- [ ] 📋 [P4.2.1] Add page transitions 🟢
- [ ] 📋 [P4.2.2] Implement task completion animations 🟢
- [ ] 📋 [P4.2.3] Create smooth scrolling 🟢
- [ ] 📋 [P4.2.4] Add loading states 🟢
- [ ] 📋 [P4.2.5] Implement drag feedback 🟡
- [ ] 📋 [P4.2.6] Create micro-interactions 🟡

### [P4.3] Performance Optimization

- [ ] 📋 [P4.3.1] Implement virtual scrolling 🔴
- [ ] 📋 [P4.3.2] Add query result caching 🟡
- [ ] 📋 [P4.3.3] Optimize database indexes 🟡
- [ ] 📋 [P4.3.4] Implement lazy loading 🟡
- [ ] 📋 [P4.3.5] Add debouncing for searches 🟢
- [ ] 📋 [P4.3.6] Profile and optimize render performance 🔴

### [P4.4] Error Handling

- [ ] 📋 [P4.4.1] Create error boundary components 🟡
- [ ] 📋 [P4.4.2] Implement user-friendly error messages 🟡
- [ ] 📋 [P4.4.3] Add error recovery mechanisms 🟡
- [ ] 📋 [P4.4.4] Create error logging system 🟡
- [ ] 📋 [P4.4.5] Build error reporting UI 🟡
- [ ] 📋 [P4.4.6] Add offline state handling 🟡

### [P4.5] User Onboarding

- [ ] 📋 [P4.5.1] Create welcome screen 🟡
- [ ] 📋 [P4.5.2] Build interactive tutorial 🔴
- [ ] 📋 [P4.5.3] Add sample data generator 🟡
- [ ] 📋 [P4.5.4] Create help documentation 🟡
- [ ] 📋 [P4.5.5] Implement tooltips system 🟡
- [ ] 📋 [P4.5.6] Add first-run setup wizard 🟡

---

## Phase 5: Advanced Features [P5]

### [P5.1] AI Integration

- [ ] 📋 [P5.1.1] Design Claude API integration 🔴
- [ ] 📋 [P5.1.2] Implement priority suggestions 🔴
- [ ] 📋 [P5.1.3] Add natural language task creation 🔴
- [ ] 📋 [P5.1.4] Create smart scheduling 🔴
- [ ] 📋 [P5.1.5] Build AI settings panel 🟡
- [ ] 📋 [P5.1.6] Add usage tracking and limits 🟡

### [P5.2] Habit Tracker

- [ ] 📋 [P5.2.1] Design habit data model 🟡
- [ ] 📋 [P5.2.2] Create habit UI components 🟡
- [ ] 📋 [P5.2.3] Implement streak tracking 🟡
- [ ] 📋 [P5.2.4] Add habit statistics 🟡
- [ ] 📋 [P5.2.5] Build habit calendar view 🟡
- [ ] 📋 [P5.2.6] Create reminder system 🔴

### [P5.3] Analytics Dashboard

- [ ] 📋 [P5.3.1] Design analytics views 🟡
- [ ] 📋 [P5.3.2] Implement task completion metrics 🟡
- [ ] 📋 [P5.3.3] Add productivity graphs 🔴
- [ ] 📋 [P5.3.4] Create time tracking analytics 🔴
- [ ] 📋 [P5.3.5] Build custom report builder 🔴
- [ ] 📋 [P5.3.6] Add data export for analytics 🟡

### [P5.4] Template System

- [ ] 📋 [P5.4.1] Design template structure 🟡
- [ ] 📋 [P5.4.2] Create template editor 🔴
- [ ] 📋 [P5.4.3] Implement template library 🟡
- [ ] 📋 [P5.4.4] Add template sharing 🔴
- [ ] 📋 [P5.4.5] Build quick-create from template 🟡
- [ ] 📋 [P5.4.6] Create default templates 🟢

### [P5.5] Advanced Filtering

- [ ] 📋 [P5.5.1] Build advanced filter UI 🔴
- [ ] 📋 [P5.5.2] Implement filter combinations 🟡
- [ ] 📋 [P5.5.3] Add saved filters 🟡
- [ ] 📋 [P5.5.4] Create smart filters 🔴
- [ ] 📋 [P5.5.5] Implement filter presets 🟡
- [ ] 📋 [P5.5.6] Add bulk operations 🟡

---

## Phase 6: Platform Expansion [P6]

### [P6.1] macOS Support

- [ ] 📋 [P6.1.1] Test and fix macOS compatibility ⚫
- [ ] 📋 [P6.1.2] Implement macOS-specific features ⚫
- [ ] 📋 [P6.1.3] Add macOS keyboard shortcuts 🔴
- [ ] 📋 [P6.1.4] Create .dmg installer 🔴
- [ ] 📋 [P6.1.5] Implement Spotlight integration 🔴
- [ ] 📋 [P6.1.6] Add Touch Bar support 🔴

### [P6.2] Linux Support

- [ ] 📋 [P6.2.1] Test on major Linux distributions ⚫
- [ ] 📋 [P6.2.2] Fix Linux-specific issues ⚫
- [ ] 📋 [P6.2.3] Create .deb and .rpm packages 🔴
- [ ] 📋 [P6.2.4] Add .AppImage support 🔴
- [ ] 📋 [P6.2.5] Implement desktop integration 🔴
- [ ] 📋 [P6.2.6] Test Wayland compatibility 🔴

### [P6.3] Mobile Companion

- [ ] 📋 [P6.3.1] Design mobile app architecture ⚫
- [ ] 📋 [P6.3.2] Create React Native app ⚫
- [ ] 📋 [P6.3.3] Implement sync protocol ⚫
- [ ] 📋 [P6.3.4] Build mobile UI ⚫
- [ ] 📋 [P6.3.5] Add push notifications ⚫
- [ ] 📋 [P6.3.6] Create app store listings ⚫

### [P6.4] Sync Server (Optional)

- [ ] 📋 [P6.4.1] Design sync protocol ⚫
- [ ] 📋 [P6.4.2] Build sync server ⚫
- [ ] 📋 [P6.4.3] Implement conflict resolution ⚫
- [ ] 📋 [P6.4.4] Add end-to-end encryption ⚫
- [ ] 📋 [P6.4.5] Create user authentication ⚫
- [ ] 📋 [P6.4.6] Build subscription system ⚫

### [P6.5] Web Viewer

- [ ] 📋 [P6.5.1] Create read-only web interface ⚫
- [ ] 📋 [P6.5.2] Implement authentication 🔴
- [ ] 📋 [P6.5.3] Add sharing functionality ⚫
- [ ] 📋 [P6.5.4] Build responsive design ⚫
- [ ] 📋 [P6.5.5] Create public link generation ⚫
- [ ] 📋 [P6.5.6] Add collaboration features ⚫

---

## Phase 7: Comprehensive Testing [P7]

### [P7.1] Backend Rust Tests

- [ ] 📋 [P7.1.1] Write unit tests for repository methods 🟡
  - [ ] Test all CRUD operations
  - [ ] Test cascading operations
  - [ ] Test transaction handling
- [ ] 📋 [P7.1.2] Write unit tests for Tauri commands 🟡
  - [ ] Test command input validation
  - [ ] Test error handling
  - [ ] Test response formatting
- [ ] 📋 [P7.1.3] Write integration tests for database operations 🔴
  - [ ] Test migration system
  - [ ] Test data integrity
  - [ ] Test concurrent operations
- [ ] 📋 [P7.1.4] Write tests for error handling 🟡
  - [ ] Test AppError types
  - [ ] Test error propagation
  - [ ] Test user-friendly error messages

### [P7.2] End-to-End Tests

- [ ] 📋 [P7.2.1] Write E2E tests for core user flows 🔴
  - [ ] Test complete GTD workflow (Life Area → Goal → Project → Task)
  - [ ] Test task creation and completion
  - [ ] Test archiving and restoration
- [ ] 📋 [P7.2.2] Write E2E tests for data persistence 🔴
  - [ ] Test data saves correctly
  - [ ] Test data loads on restart
  - [ ] Test backup functionality
- [ ] 📋 [P7.2.3] Write E2E tests for navigation 🟡
  - [ ] Test all navigation paths
  - [ ] Test breadcrumb navigation
  - [ ] Test keyboard shortcuts
- [ ] 📋 [P7.2.4] Write E2E tests for search and filtering 🟡
  - [ ] Test search functionality
  - [ ] Test filters
  - [ ] Test sorting

### [P7.3] Performance Tests

- [ ] 📋 [P7.3.1] Write performance benchmarks 🔴
  - [ ] Test with large datasets (1000+ items)
  - [ ] Test render performance
  - [ ] Test database query performance
- [ ] 📋 [P7.3.2] Write memory leak tests 🔴
  - [ ] Test component mounting/unmounting
  - [ ] Test store subscriptions
  - [ ] Test event listeners

### [P7.4] Test Infrastructure Improvements

- [ ] 📋 [P7.4.1] Set up continuous integration testing 🟡
  - [ ] Configure GitHub Actions for tests
  - [ ] Set up test coverage reporting
  - [ ] Configure test result notifications
- [ ] 📋 [P7.4.2] Improve test utilities 🟡
  - [ ] Enhance TauriMock capabilities
  - [ ] Create more test factories
  - [ ] Add custom test matchers
- [ ] 📋 [P7.4.3] Set up visual regression testing 🔴
  - [ ] Configure screenshot testing
  - [ ] Set up visual diff tools
  - [ ] Create baseline screenshots

---

## Notes

### Current Implementation Status

- **Database Layer**: Complete with SQLite + SQLx integration
- **Migration System**: Fully functional with Tauri commands
- **Models**: All core models implemented with helper methods
- **Repository**: Basic operations implemented (partial CRUD)
- **Tauri Commands**: All CRUD commands implemented for Life Areas, Goals, Projects, Tasks, and
  Notes
- **TypeScript Types**: Complete type definitions for all models and commands
- **Frontend API Client**: Type-safe API client with full command coverage
- **UI Components**: Life Area, Goal, Project, and Task management interfaces complete with full
  CRUD functionality
- **Task Management**: Complete task CRUD with subtask support, priority management, and due dates
- **Test Utilities**: Comprehensive test helpers created (TauriMock, render helpers, data factories,
  custom matchers)
- **Testing Setup**: Vitest + Playwright configured, though some environment issues need resolution
- **Code Quality**: ESLint configured with TypeScript rules, reduced errors from 181 to 2 warnings
  only
- **UI Components**: Added ConfirmDialog component to replace browser confirm/alert dialogs
- **New UI Components**: Created Heading, Alert, LoadingSpinner, and cn utility for consistent
  styling

### Technical Decisions

- Using UUID v4 for all IDs ✅
- Storing dates in ISO 8601 format ✅
- All times in UTC, converted for display ✅
- Markdown as primary content format
- JSON for structured data exchange
- Using SQLx for compile-time checked SQL queries ✅
- Custom migration system with up/down support ✅

### Known Challenges

- Cross-platform file path handling
- Git integration complexity
- Calendar view performance with many tasks
- Conflict resolution for sync
- AI API rate limiting
- Test environment configuration (jsdom with bun test)
- Router integration in component tests

### Dependencies to Research

- ✅ SQLite library for Rust (Decided: SQLx with compile-time checked queries)
- Markdown editor for SolidJS
- Git library options (git2-rs vs alternatives)
- Calendar component options
- Chart library for analytics

---

_Last updated: 2025-08-02_

### Recent Updates (2025-08-02)

#### Life Area Component Tests Complete (P2.1.T.1) ✅

- ✅ Fixed remaining test issue in LifeAreaList.factory.test.tsx
- ✅ All 55 Life Area tests now passing:
  - 14 validation tests
  - 10 form tests
  - 10 UI component tests
  - 7 list factory tests
  - 14 store factory tests
- ⚠️ Note: Original LifeAreaList.test.tsx remains blocked by singleton store initialization issue

#### Test Infrastructure Improvements (P2.1.T.8) ✅

- ✅ Fixed "computations created outside createRoot" warnings in store factory tests
  - Wrapped all store creations in `createRoot` to properly dispose of reactive computations
  - Eliminated all SolidJS reactivity warnings from test output
- ✅ Resolved module mocking limitations
  - Confirmed TestApiClient pattern is the correct approach over vi.mock for API mocking
  - API abstraction layer with test doubles is already implemented and working
- ✅ Verified test runner configuration
  - Package.json already correctly configured to use vitest via `bunx vitest`
  - Tests must be run with vitest, not `bun test` directly, to use proper jsdom environment
- ⚠️ Partial CI test success: 10/22 test files passing
  - Passing tests include: UI components, store factories, test utilities
  - Failing tests: Components that require store context providers (GoalsPage, etc.)
  - Next step: Add store providers to test render helpers for component tests

### Recent Updates (2025-08-02)

- ✅ Reduced ESLint errors from 181 to 2 warnings
- ✅ Consolidated imports across entire codebase
- ✅ Removed 8 unused demo and test components
- ✅ Fixed TypeScript type safety issues (replaced all `any` types)
- ✅ Added ConfirmDialog component as proper replacement for browser dialogs
- ✅ Resolved SolidJS reactivity warnings
- ✅ Applied Prettier formatting to entire codebase
- ✅ Updated project documentation to reflect improvements
- ✅ Created 55 passing unit tests for Life Area components (UI, Form, Validation, List Factory,
  Store Factory)
- ✅ Implemented factory pattern for testable stores (P2.1.T.8.1)
- ✅ Created API abstraction layer with test doubles (P2.1.T.8.2)
  - `ApiClient` interface for all operations
  - `TauriApiClient` for production use
  - `TestApiClient` for unit testing
  - 14 passing tests for lifeAreaStore factory
- ✅ Created context-based stores for all entities (P2.1.T.8.6)
  - LifeAreaStoreContext, GoalStoreContext, ProjectStoreContext, TaskStoreContext
  - Backward compatibility with singleton stores
  - Context providers for better testability
- ✅ Enhanced TauriMock with better isolation (P2.1.T.8.5)
  - Command tracking and call counts
  - State management with StatefulTauriMock
  - Debug logging support
  - Global installation helpers
  - 16 passing tests for TauriMock functionality

### Technical Debt

#### Testing Infrastructure Issues

During the implementation of unit tests for Life Area components, we encountered significant
challenges with testing components and stores that depend on Tauri APIs:

1. **Store Auto-initialization Problem**
   - The lifeAreaStore module initializes and calls Tauri APIs immediately upon import
   - This makes it impossible to mock the Tauri API before the store is created
   - Affects: `LifeAreaList.test.tsx`, `lifeAreaStore.test.ts`
   - **Suggested Fix**: Refactor stores to use lazy initialization or dependency injection

2. **Module Mocking Limitations**
   - Vitest's `vi.mock` hoisting conflicts with how our API client is structured
   - The API module checks for Tauri at runtime, but mocks can't be set up early enough
   - **Suggested Fix**: Create a proper API abstraction layer with test doubles

3. **Component-Store Coupling**
   - Components that directly import stores inherit the initialization problems
   - Makes it difficult to test components in isolation
   - **Suggested Fix**: Use dependency injection or context providers for stores

#### Workarounds Implemented

- Created UI-only test components that don't depend on stores
- Successfully tested forms, validation, and pure UI logic (34 tests passing)
- Deferred store and integration tests until architecture improvements are made

#### Recommended Actions

1. Consider using E2E tests with Playwright for integration testing
2. Refactor store initialization to be more test-friendly
3. Create an API abstraction layer that can be easily mocked
4. Implement proper dependency injection for better testability
