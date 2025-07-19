<!-- Logo placeholder - add logo image when available -->
<!-- <p align="center">
  <img src="docs/images/evorbrain-logo.png" alt="EvorBrain Logo" width="200" />
</p> -->

<h1 align="center">EvorBrain</h1>

<p align="center">
  <strong>A local-first, open-source personal productivity system that organizes your entire life through a visual hierarchy of Life Areas, Goals, Projects, and Tasks.</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/version-0.1.0--dev-blue" alt="Version"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/build-pending-yellow" alt="Build Status"></a>
  <a href="#"><img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="Platform"></a>
</p>

---

## Table of Contents

- [What does this do?](#what-does-this-do)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License & Contact](#license--contact)

---

## What does this do?

EvorBrain helps you organize your entire life in a way that makes sense - from big-picture life goals down to daily tasks. Unlike other productivity apps that focus only on tasks, EvorBrain uses a natural hierarchy that mirrors how you actually think about your life.

### The EvorBrain Workflow

```
Life Areas (Health, Career, Family)
    ↓
Goals (Lose 20 pounds, Get promoted)
    ↓
Projects (Gym routine, Complete certification)
    ↓
Tasks (Monday workout, Study Chapter 3)
```

**Why EvorBrain?**

- 🔒 **100% Private**: Your data never leaves your computer
- ✈️ **Works Offline**: Full functionality without internet
- 🎯 **Hierarchy-First**: Not just tasks, but meaningful organization
- 🚀 **Lightning Fast**: Native desktop performance
- 🎨 **Visual Organization**: Calendar, Kanban, and List views
- 🔧 **Extensible**: Plugin system for custom features (coming soon)

### Screenshots

<!-- Screenshots coming soon - application UI in development -->
<!-- <p align="center">
  <img src="docs/images/screenshot-dashboard.png" alt="Dashboard View" width="600" />
  <br />
  <em>Dashboard - See your entire life at a glance</em>
</p>

<p align="center">
  <img src="docs/images/screenshot-calendar.png" alt="Calendar View" width="600" />
  <br />
  <em>Calendar - Visualize tasks and deadlines</em>
</p> -->

*Screenshots will be added once the UI is implemented.*

---

## Key Features

### ✅ Current Features (MVP)

- **Life Area Management**: Organize your life into color-coded areas
- **Goal Tracking**: Set goals within life areas with progress tracking
- **Project Organization**: Break goals into manageable projects
- **Task Management**: Create, schedule, and complete tasks
- **Calendar Integration**: Drag-and-drop tasks on a visual calendar
- **Multiple Views**: Switch between Calendar, List, and Dashboard views
- **Keyboard Shortcuts**: Navigate entirely without a mouse
- **Data Export**: Export your data in JSON or CSV format

### 🚧 Planned Features (Phase 2)

- **Recurring Tasks**: Set up daily, weekly, or custom recurring tasks
- **Kanban Boards**: Visual project management with drag-and-drop
- **Time Tracking**: Track actual vs. estimated time
- **Pomodoro Timer**: Built-in productivity timer
- **Advanced Filtering**: Complex filters and saved searches
- **Tags System**: Cross-cutting organization with tags

### 🔮 Future Vision (Phase 3)

- **Habit Tracking**: Build and monitor habits
- **Note-Taking**: Markdown notes linked to tasks/projects
- **Analytics Dashboard**: Productivity insights and trends
- **Plugin System**: Extend functionality with custom plugins
- **Mobile Companion**: Sync with mobile app (optional)
- **Cloud Backup**: Optional encrypted cloud backup

---

## 🚧 Current Development Status

**Last Updated**: July 18, 2025

### ✅ What's Working
- Complete backend infrastructure with SQLite database
- All CRUD operations for Life Areas, Goals, Projects, and Tasks
- Tauri IPC layer with full type safety
- Database migrations and schema management
- Comprehensive security measures (SQL injection protection, path traversal prevention, input validation)
- Application successfully starts and runs

### 🔄 Currently Building
- Frontend UI components for all entities
- Calendar view with drag-and-drop
- Task list and management views

### ⏳ Next Up
- Complete MVP frontend implementation
- Add unit and integration tests
- Polish UI/UX with loading states
- Performance optimizations

---

## Getting Started

### Prerequisites

Before installing EvorBrain, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Rust** (latest stable) - [Download](https://rustup.rs/)
- **Git** - [Download](https://git-scm.com/)

### Quick Install

1. **Download the latest release** for your platform:

   - [Windows (.msi)](https://github.com/yourusername/evorbrain/releases)
   - [macOS (.dmg)](https://github.com/yourusername/evorbrain/releases)
   - [Linux (.AppImage)](https://github.com/yourusername/evorbrain/releases)

2. **Install and launch** EvorBrain

3. **Create your first Life Area**:
   - Click "Add Life Area" in the sidebar
   - Name it (e.g., "Health", "Career", "Family")
   - Choose a color
   - Start adding goals!

### First Steps

1. **Set up your Life Areas**: Think about the major areas of your life
2. **Create Goals**: Add 1-2 goals per life area to start
3. **Break down into Projects**: What projects will achieve each goal?
4. **Add Tasks**: Create actionable tasks with due dates
5. **Use the Calendar**: Drag tasks to schedule your work

---

## Development Setup

Want to contribute or run from source? Here's how:

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/evorbrain.git
cd evorbrain

# Install dependencies
npm install

# Install Rust dependencies (first time only)
cd src-tauri
cargo build
cd ..
```

### Development Commands

```bash
# Start development server
npm run tauri dev

# Run frontend only (for UI development)
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Build for current platform
npm run tauri build

# Build for specific platform
npm run tauri build -- --target x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Documentation

EvorBrain includes comprehensive documentation for different audiences:

### 📚 Core Documentation

- **[PLANNING.md](PLANNING.md)** - Architecture decisions, database schema, and technical planning
- **[TASKS.md](TASKS.md)** - Development tasks organized by phase with progress tracking
- **[CLAUDE.md](CLAUDE.md)** - AI assistant guide for contributing to the project

### 🔧 Developer Guides

- **[Architecture Guide](docs/architecture.md)** - Understanding the codebase structure
- **[API Reference](docs/api.md)** - Tauri command documentation
- **[Plugin Development](docs/plugins.md)** - Creating EvorBrain plugins (coming soon)

### 📖 User Documentation

- **[User Manual](docs/user-manual.md)** - Complete guide to using EvorBrain
- **[Keyboard Shortcuts](docs/shortcuts.md)** - Quick reference for power users
- **[FAQ](docs/faq.md)** - Common questions and troubleshooting

### Current Development Status

- **Phase**: Development Phase - MVP Week 1
- **Progress**: Full backend implementation with SQLite, Tauri IPC commands, all CRUD operations working, application startup fixed
- **Target**: 6-week MVP release
- **Next**: Frontend UI implementation for all entities

See [TASKS.md](TASKS.md) for detailed progress.

---

## Tech Stack

EvorBrain is built with modern, performant technologies:

| Technology                                        | Purpose           | Why We Chose It                               |
| ------------------------------------------------- | ----------------- | --------------------------------------------- |
| **[Tauri](https://tauri.app/)**                   | Desktop Framework | Native performance, small bundle size, secure |
| **[React](https://react.dev/)**                   | UI Framework      | Component reusability, large ecosystem        |
| **[TypeScript](https://www.typescriptlang.org/)** | Language          | Type safety, better developer experience      |
| **[SQLite](https://www.sqlite.org/)**             | Database          | Embedded, fast, reliable for local data       |
| **[Zustand](https://zustand-demo.pmnd.rs/)**      | State Management  | Simple, performant, TypeScript-friendly       |
| **[Tailwind CSS](https://tailwindcss.com/)**      | Styling           | Utility-first, consistent design system       |
| **[Vite](https://vitejs.dev/)**                   | Build Tool        | Fast HMR, optimized builds                    |
| **[FullCalendar](https://fullcalendar.io/)**      | Calendar          | Feature-rich, customizable calendar views     |

---

## Contributing

We welcome contributions! EvorBrain is built by the community, for the community.

### How to Contribute

1. **Fork the repository** and create your branch:

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards

3. **Test thoroughly**:

   ```bash
   npm run test
   npm run lint
   ```

4. **Submit a Pull Request** with a clear description

### Development Workflow

- We use **Feature-Sliced Design** for architecture
- Follow **conventional commits** for messages
- Write tests for new features
- Update documentation as needed

### Where to Get Help

- 🐛 [Issue Tracker](https://github.com/yourusername/evorbrain/issues)
- 📖 [Developer Docs](docs/CONTRIBUTING.md) *(coming soon)*
- 💬 Discord Community *(coming soon)*
- 📧 Email Support *(coming soon)*

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## Roadmap

### 🎯 Current Phase: Development Phase - MVP Week 1

#### ✅ Completed
- [x] Architecture planning
- [x] Development environment setup
- [x] Tauri project initialization
- [x] TypeScript + path aliases configuration
- [x] Feature-Sliced Design structure
- [x] Tailwind CSS integration
- [x] Basic Zustand store setup
- [x] SQLite integration with migrations
- [x] Database schema implementation
- [x] Complete backend CRUD operations for all entities
- [x] Tauri IPC commands with validation
- [x] Security hardening (SQL injection protection, comprehensive path traversal protection, input validation layer, Tauri v2 security configuration)
- [x] Fixed application startup issues

#### 🔄 In Progress
- [ ] Frontend UI components for CRUD operations
- [ ] Calendar integration
- [ ] Testing and polish

### 🚀 Phase 2: Enhanced Features (3 months)

- [ ] Recurring tasks with RRULE
- [ ] Kanban board view
- [ ] Time tracking
- [ ] Pomodoro timer
- [ ] Advanced filtering

### 🌟 Phase 3: Expansion (6 months)

- [ ] Plugin architecture
- [ ] Note-taking module
- [ ] Habit tracking
- [ ] Analytics dashboard
- [ ] Mobile companion app

### Long-term Vision

EvorBrain aims to become the most powerful, privacy-respecting personal productivity system available. We believe in:

- **Local-first**: Your data, your control
- **Open source**: Transparency and community
- **Extensibility**: Adapt to any workflow
- **Performance**: Native speed, always

---

## License & Contact

### License

EvorBrain is open source software licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 EvorBrain Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

### Contact & Support

- **GitHub**: [Project Repository](https://github.com/yourusername/evorbrain)
<!-- **Website**: *(coming soon)*
- **Email**: *(coming soon)*
- **Discord**: *(coming soon)*
- **Twitter**: *(coming soon)* -->

### Maintainers

- **Lead Developer**: [EvorBrain](https://github.com/evorhard)
- **Contributors**: [See all contributors](https://github.com/yourusername/evorbrain/graphs/contributors)

