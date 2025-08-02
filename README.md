# 🧠 EvorBrain

```
███████╗██╗   ██╗ ██████╗ ██████╗ ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
██╔════╝██║   ██║██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
█████╗  ██║   ██║██║   ██║██████╔╝██████╔╝██████╔╝███████║██║██╔██╗ ██║
██╔══╝  ╚██╗ ██╔╝██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
███████╗ ╚████╔╝ ╚██████╔╝██║  ██║██████╔╝██║  ██║██║  ██║██║██║ ╚████║
╚══════╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
```

**A local-first, hierarchical task management system that combines the best of Notion and Obsidian
into a blazing-fast desktop application.**

> ⚠️ **IMPORTANT: This project is currently in early development and is NOT functional yet.** The
> documentation below describes the planned features and architecture. Please check the
> [Current Status](#-current-status) section for development progress.

[![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.8-2C4F7C?style=for-the-badge&logo=solid&logoColor=white)](https://solidjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-1.75-000000?style=for-the-badge&logo=rust&logoColor=white)](https://rust-lang.org)
[![SQLite](https://img.shields.io/badge/SQLite-3.44-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Bun](https://img.shields.io/badge/Bun-1.0-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📋 Table of Contents

- [What Does This Do?](#-what-does-this-do)
- [Current Status](#-current-status)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Workflow](#-development-workflow)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🚧 Current Status

EvorBrain is currently in the initial development phase. Here's the development progress:

### 🎯 Minimum Viable Product (MVP)

The MVP will be considered complete and operational when the following core features are
implemented:

1. **✅ Hierarchical task management** - Organize your life with Life Areas → Goals → Projects →
   Tasks
2. **✅ Dashboard overview** - See what needs to be done at a glance
3. **✅ Priority system** - Focus on what matters most
4. **✅ Calendar view** - Visualize your tasks over time
5. **✅ Local file storage** - Your data stays on your computer
6. **✅ Windows support** - Native Windows 10/11 application
7. **✅ Automatic Git backups** - Never lose your data

**When will it be ready?** The app will be functional for daily use once Phase 2 (Core Features) and
Phase 3.1-3.2 (File System & Git Integration) are complete. Check the
[Development Checklist](#development-checklist) below for current progress.

### Development Checklist

#### ✅ Completed

- [x] Project initialization and documentation
- [x] Technology stack selection
- [x] High-level architecture planning
- [x] Development environment setup
- [x] Basic Tauri application scaffold
- [x] Initial UI component library setup (Kobalte)
- [x] Theme system with dark mode support
- [x] Responsive design system with breakpoints
- [x] Base layout components (Header, Sidebar, Content Area)
- [x] Core UI components (Button, Input, Modal, Card, etc.)
- [x] SQLite database integration with SQLx
- [x] Database migration system
- [x] Core data models (Rust)
- [x] Tauri IPC commands structure
- [x] Frontend TypeScript type definitions
- [x] Type-safe API client with full command coverage
- [x] Testing framework setup (Vitest + SolidJS Testing Library)
- [x] E2E testing setup with Playwright
- [x] ESLint configuration with TypeScript and SolidJS rules
- [x] Prettier configuration for code formatting
- [x] Pre-commit hooks with Husky and lint-staged
- [x] Code quality improvements (reduced ESLint errors from 181 to 2 warnings)
- [x] Consolidated imports across codebase
- [x] Removed unused demo and test components
- [x] Added ConfirmDialog component to replace browser confirm/alert dialogs
- [x] Fixed TypeScript type safety issues (replaced `any` with proper types)
- [x] Resolved SolidJS reactivity warnings
- [x] Component documentation standards defined

#### 🔄 In Progress (MVP Focus)

- [ ] Basic CRUD operations implementation (MVP)
- [ ] Frontend state management setup (MVP)

#### 📋 Pending - MVP Requirements

**Essential for MVP:**

- [ ] Complete CRUD operations for all entities
- [ ] Hierarchical navigation component
- [ ] Dashboard/Homepage with task overview
- [ ] Task management UI with priority system
- [ ] Calendar view implementation
- [ ] Local file storage (Obsidian-like structure)
- [ ] Git integration for automatic backups

**Post-MVP Features:**

- [ ] Unit test coverage for existing components
- [ ] Search functionality
- [ ] Keyboard shortcuts
- [ ] Markdown editor integration
- [ ] Import/Export functionality
- [ ] Cross-platform testing (macOS, Linux)
- [ ] Performance optimization
- [ ] AI-powered features

**Development Status**: Major progress! The app now has a complete database layer with SQLite
integration, migration system, and all data models implemented. The UI foundation is complete with
theme system and responsive design. All Tauri IPC commands are implemented with full CRUD operations
for Life Areas, Goals, Projects, Tasks, and Notes. A type-safe frontend API client is ready to use.
Next up: implementing the actual UI functionality and state management.

---

## 🤔 What Does This Do?

EvorBrain is your personal life management system that helps you organize everything from big life
goals down to daily tasks. Think of it as a digital brain that:

- **Organizes your life** into clear areas (Career, Health, Finance, etc.)
- **Breaks down goals** into achievable projects and tasks
- **Stores everything locally** on your computer - you own your data
- **Syncs automatically** using Git for backups and multi-device access
- **Works offline** with the speed of a native desktop app
- **Reads like Obsidian** with human-readable markdown files
- **Functions like Notion** with a beautiful, intuitive interface

Perfect for anyone who wants the power of Notion's organization with Obsidian's local-first
philosophy and the performance of a native app.

---

## ✨ Key Features

### 🚀 Currently In Development

> **Note**: These features represent the planned functionality. None of these features are
> implemented yet.

- **Hierarchical Organization**: Life Areas → Goals → Projects → Tasks → Subtasks
- **Local-First Storage**: All data stored in SQLite + markdown files on your computer
- **Git Integration**: Automatic version control and backup to GitHub/GitLab
- **Beautiful UI**: Modern, responsive interface built with SolidJS and Tailwind CSS
- **Responsive Design**: Mobile-first design with custom breakpoint system and responsive utilities
- **Fast Performance**: Native desktop app performance with <2s startup time
- **Calendar View**: Visualize tasks and deadlines in month/week/day views
- **Full-Text Search**: Instantly find any task, project, or goal
- **Keyboard Shortcuts**: Navigate and manage tasks without touching the mouse

### 🔮 Coming Soon

- **AI-Powered Prioritization**: Smart task priority suggestions
- **Habit Tracking**: Build and monitor daily habits with streak tracking
- **Health Metrics**: Track wellness data and correlate with productivity
- **Plugin System**: Extend functionality with custom plugins
- **Mobile Companion**: Access your data on the go
- **Advanced Analytics**: Visualize progress with beautiful charts
- **Template System**: Save and reuse project/task templates
- **Cross-Platform**: Full support for macOS and Linux

---

## 🛠️ Tech Stack

### Core Technologies

| Component              | Technology                                                                                                  | Why I Chose It                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Desktop Framework**  | [Tauri 2.0](https://tauri.app)                                                                              | Rust-powered, secure, 50MB apps vs Electron's 150MB+                            |
| **Frontend Framework** | [SolidJS](https://solidjs.com)                                                                              | No virtual DOM, fine-grained reactivity, 7KB runtime                            |
| **Styling**            | [Tailwind CSS](https://tailwindcss.com)                                                                     | Utility-first, great DX, perfect for rapid development                          |
| **Responsive Design**  | Custom Breakpoint System                                                                                    | Mobile-first with useBreakpoint hook & responsive utils                         |
| **UI Components**      | [Kobalte](https://kobalte.dev)                                                                              | Accessible, unstyled components for SolidJS                                     |
| **Database**           | [SQLite](https://sqlite.org) with [SQLx](https://github.com/launchbadge/sqlx)                               | Fast, reliable, zero-config embedded database with compile-time checked queries |
| **Migrations**         | Custom Rust-based system                                                                                    | Version-controlled database schema with up/down support                         |
| **Language**           | [TypeScript](https://typescriptlang.org)                                                                    | Type safety, better DX, fewer runtime errors                                    |
| **Backend Language**   | [Rust](https://rust-lang.org)                                                                               | Memory safe, blazing fast, excellent for native apps                            |
| **Package Manager**    | [Bun](https://bun.sh)                                                                                       | Fast all-in-one JavaScript runtime and toolkit                                  |
| **State Management**   | [Solid Stores](https://www.solidjs.com/docs/latest#stores)                                                  | Built-in reactive state management                                              |
| **Router**             | [@solidjs/router](https://github.com/solidjs/solid-router)                                                  | Official SolidJS routing solution                                               |
| **Build Tool**         | [Vite](https://vitejs.dev)                                                                                  | Fast frontend build tool with HMR                                               |
| **Testing**            | [Vitest](https://vitest.dev) + [@solidjs/testing-library](https://github.com/solidjs/solid-testing-library) | Modern testing framework with SolidJS support                                   |
| **E2E Testing**        | [Playwright](https://playwright.dev)                                                                        | Cross-browser end-to-end testing for Tauri apps                                 |
| **Linting**            | [ESLint](https://eslint.org) + TypeScript ESLint                                                            | Code quality and consistency enforcement                                        |
| **Formatting**         | [Prettier](https://prettier.io)                                                                             | Consistent code formatting across the project                                   |
| **Git Hooks**          | [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/okonet/lint-staged)            | Pre-commit hooks for code quality checks                                        |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh)** (v1.0 or higher) - JavaScript runtime and package manager
- **[Rust](https://rust-lang.org)** (v1.75 or higher) - Required for Tauri backend
- **[Git](https://git-scm.com)** - For version control and backup features
- **[Node.js](https://nodejs.org)** (v18 or higher) - Some dependencies still require Node
- **OS Requirements**:
  - Windows 10/11 (version 1803 or higher with WebView2)
  - macOS 10.15 or higher (coming soon)
  - Linux with webkit2gtk (coming soon)

### System Dependencies

#### Windows

- WebView2 (auto-installed by Tauri if not present)
- Visual Studio Build Tools or Visual Studio 2019+ with C++ support

#### macOS (Coming Soon)

- Xcode Command Line Tools

#### Linux (Coming Soon)

- `webkit2gtk-4.0`
- `libssl-dev`
- `libgtk-3-dev`

---

## 🚀 Installation

> 🚀 **Developer Notice**: The application now runs in development mode! While core functionality
> like task management isn't implemented yet, you can explore the UI framework and responsive design
> system.

### 1. Clone the Repository

```bash
git clone https://github.com/evorhard/evorbrain.git
cd evorbrain
```

### 2. Install Dependencies

```bash
# Install JavaScript dependencies
bun install

# Install Rust dependencies (handled automatically by Tauri)
```

### 3. Set Up Development Environment

```bash
# Start the Tauri development server
bun run tauri:dev
# or
bun run start

# The app will launch with:
# - Working UI framework with theme switching
# - Responsive design system
# - Demo components showcasing the design system
# - Database migration system (check MigrationTester component)
# - Hot module replacement for development
```

**Current State**: Both UI foundation and database layer are complete! You can run the app to
explore the component library, theme system, responsive design, and test the database migration
system. Next milestone: implementing CRUD operations and connecting frontend to backend.

---

## 🎯 Getting Started

> 📝 **Note**: This section describes the planned user experience once the application is
> functional. It's currently here as a reference for the intended workflow.

### Quick Start Guide (Planned Experience)

1. **Launch the App**

   ```bash
   bun run dev  # This command doesn't work yet
   ```

2. **Create Your First Life Area** _(Not implemented)_
   - Click the "+" button in the sidebar
   - Name it (e.g., "Career", "Health", "Personal")
   - Choose a color and icon

3. **Add a Goal** _(Not implemented)_
   - Select your life area
   - Click "Add Goal"
   - Define what you want to achieve
   - Set a target date

4. **Create a Project** _(Not implemented)_
   - Within your goal, create a project
   - Break it down into actionable tasks
   - Set priorities and deadlines

5. **Start Working!** _(Not implemented)_
   - Check off tasks as you complete them
   - Watch your progress automatically update
   - Your data is saved locally and backed up via Git

### Keyboard Shortcuts

| Shortcut       | Action                 |
| -------------- | ---------------------- |
| `Ctrl/Cmd + N` | New task               |
| `Ctrl/Cmd + /` | Search                 |
| `Ctrl/Cmd + S` | Save/Sync              |
| `Ctrl/Cmd + ,` | Settings               |
| `Tab`          | Navigate forward       |
| `Shift + Tab`  | Navigate backward      |
| `Space`        | Toggle task completion |

---

## 📁 Project Structure

```
evorbrain/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs        # Application entry point
│   │   ├── lib.rs         # Library root with command registration
│   │   ├── commands/      # Tauri IPC commands ✅
│   │   │   ├── life_areas.rs
│   │   │   ├── goals.rs
│   │   │   ├── projects.rs
│   │   │   ├── tasks.rs
│   │   │   └── notes.rs
│   │   ├── db/           # Database operations ✅
│   │   │   ├── models.rs  # Data models
│   │   │   ├── migrations/ # Migration system
│   │   │   └── repository.rs
│   │   ├── storage/      # File system operations (planned)
│   │   ├── sync/         # Git synchronization (planned)
│   │   └── utils/        # Shared utilities
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
│
├── src/                   # SolidJS frontend
│   ├── components/       # UI components ✅
│   ├── stores/          # State management (planned)
│   ├── hooks/           # Custom hooks ✅
│   ├── lib/             # Libraries and utilities
│   │   ├── api.ts       # Type-safe Tauri API client ✅
│   │   └── api.test.ts  # API client tests ✅
│   ├── test/            # Test utilities and setup ✅
│   │   └── setup.ts     # Test environment configuration
│   ├── types/           # TypeScript types ✅
│   │   ├── models.ts    # Database model types
│   │   ├── commands.ts  # Command request/response types
│   │   └── index.ts     # Type exports
│   ├── styles/          # Global styles
│   └── App.tsx          # Root component
│
├── data/                  # User data (git-ignored)
│   ├── evorbrain.db      # SQLite database
│   ├── areas/           # Life area markdown files
│   ├── attachments/     # File attachments
│   └── config/          # User settings
│
├── e2e/                  # End-to-end tests ✅
│   ├── fixtures.ts      # Test fixtures and setup
│   ├── helpers/         # E2E test helper functions
│   └── *.spec.ts        # E2E test files
│
├── public/               # Static assets
├── scripts/             # Build and utility scripts
├── tests/               # Test files
├── vitest.config.ts     # Vitest configuration ✅
├── playwright.config.ts # Playwright configuration ✅
│
├── .github/             # GitHub Actions workflows
├── package.json         # Node.js dependencies
├── bun.lockb           # Bun lock file
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
│
├── PLANNING.md         # Architecture and planning document
├── TASKS.md           # Development task tracking
├── ARCHITECTURE.md    # Technical specifications
└── README.md          # You are here! 👋
```

---

## 💻 Development Workflow

### Running the App

> ℹ️ **Note**: Some commands are still being configured as development progresses.

```bash
# Development mode with hot reload ✅ WORKING
bun run tauri:dev
# or
bun run start

# Build for production ✅ WORKING
bun run tauri:build

# Run tests ⚠️ PARTIALLY WORKING
bun run test          # Run tests in watch mode
bun run test:ui       # Run tests with UI interface
bun run test:run      # Run tests once
bun run test:coverage # Run tests with coverage report

# Run specific test file (recommended for now)
bun test src/test/utils/example.test.tsx

# Run E2E tests ✅ WORKING
bun run test:e2e      # Run end-to-end tests
bun run test:e2e:ui   # Run E2E tests with interactive UI
bun run test:e2e:debug # Debug E2E tests
bun run test:e2e:headed # Run E2E tests in headed mode

# Clean build artifacts ✅ WORKING
bun run clean
bun run clean:all  # Deep clean including node_modules

# Lint code ✅ WORKING
bun run lint      # Check for linting errors
bun run lint:fix  # Auto-fix linting errors where possible

# Format code ✅ WORKING
bun run format    # Format all code with Prettier
bun run format:check # Check if code is properly formatted

# Generate documentation ✅ WORKING
bun run docs          # Generate all documentation
bun run docs:typescript # Generate TypeScript/Frontend docs only
bun run docs:rust     # Generate Rust/Backend docs only
bun run docs:serve    # Serve documentation locally
```

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards in [`PLANNING.md`](PLANNING.md#coding-standards)
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   bun run test      # Run unit tests
   bun run lint      # Check code quality
   bun run lint:fix  # Auto-fix linting issues
   ```

4. **Commit with conventional commits**

   ```bash
   git commit -m "feat: add new calendar view"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Tips

- Use the VS Code workspace settings for consistent formatting
- Install recommended extensions for the best development experience
- Check [`TASKS.md`](TASKS.md) for current development priorities
- Join my Discord for help and discussions

---

## 🧪 Testing

The project uses Vitest for unit testing and Playwright for end-to-end testing.

### Current Testing Status

⚠️ **Important**: Test utilities are fully implemented but have some environment setup limitations:

- **Component Tests**: Some tests fail with "document is not defined" errors due to jsdom
  configuration issues
- **Router Integration**: Not yet implemented in render helpers (disabled to avoid SSR issues)
- **Test Utilities**: Working correctly as demonstrated by passing example tests

### Running Tests

```bash
# Run unit tests (some may fail due to environment issues)
bun test

# Run specific test file (recommended approach)
bun test src/test/utils/example.test.tsx

# Run tests with UI interface
bun run test:ui

# Run tests once (no watch mode)
bun run test:run

# Run E2E tests (fully working)
bun run test:e2e
```

### Test Coverage

The project includes comprehensive test coverage reporting using Vitest's built-in coverage support
(via c8/v8).

```bash
# Generate coverage report
bun run test:coverage

# Coverage will be generated in ./coverage directory
# Open ./coverage/index.html in your browser for detailed report
```

#### Coverage Configuration

- **Coverage Thresholds**: 80% for statements, functions, and lines; 70% for branches
- **Output Formats**: text, json, html, and lcov
- **Excluded Files**: Test files, configuration files, type definitions, and test utilities

The coverage configuration can be found in `vitest.config.ts`. Coverage reports are automatically
excluded from version control.

### Test Utilities

We provide comprehensive test utilities in `src/test/utils/`:

- **TauriMock**: Enhanced mocking for Tauri IPC commands
- **Render Helpers**: Utilities for testing SolidJS components
- **Data Factories**: Functions for generating test data
- **Custom Matchers**: Domain-specific assertions

See the [Test Utilities Documentation](src/test/utils/README.md) for detailed usage and known
issues.

---

## 📚 Documentation

### Project Documentation

- **[Planning Document](PLANNING.md)** - Project vision, design decisions, and development phases
- **[Architecture Document](ARCHITECTURE.md)** - Detailed technical architecture and implementation
  specs
- **[Task Tracking](TASKS.md)** - Current development status, upcoming features, and task
  assignments
- **[Business Logic](docs/BUSINESS_LOGIC.md)** - Complex business logic patterns and architectural
  decisions
- **[Component Standards](docs/COMPONENT_STANDARDS.md)** - Guidelines for writing consistent,
  well-documented components

### API Documentation

- **[API Documentation](docs/api/)** - Auto-generated API documentation for TypeScript and Rust code
- **[TypeScript API](docs/api/typescript/)** - Frontend components, stores, and utilities
  documentation
- **[Rust API](docs/api/rust/)** - Backend commands, database operations, and system APIs
  documentation

### Testing Documentation

- **[Test Utilities Guide](src/test/utils/README.md)** - Comprehensive guide to test utilities and
  helpers
- **[Component Testing Guide](src/test/component-testing-guide.md)** - Guide for writing component
  tests
- **[E2E Testing Guide](e2e/README.md)** - Comprehensive guide for end-to-end testing

### User Documentation

- **[User Guide](docs/user-guide.md)** - Comprehensive user documentation (coming soon)

### Generating Documentation

The project uses automated documentation generation tools:

```bash
# Generate all documentation (TypeScript + Rust)
bun run docs

# Generate TypeScript documentation only
bun run docs:typescript

# Generate Rust documentation only
bun run docs:rust

# Serve documentation locally
bun run docs:serve
```

Documentation is automatically generated on push to main/master branches via GitHub Actions.

---

## 🤝 Contributing

I love contributions! EvorBrain is built by the community, for the community.

### How to Contribute

1. **Check existing issues** or create a new one
2. **Fork the repository** and create your branch
3. **Make your changes** following our coding standards
4. **Write/update tests** as needed
5. **Submit a pull request** with a clear description

### Ways to Contribute

- 🐛 **Report bugs** and help me fix them
- 💡 **Suggest features** that would make EvorBrain better
- 📝 **Improve documentation** to help others
- 🎨 **Design UI/UX improvements**
- 🌍 **Translate** to your language (coming soon)
- ⭐ **Star the project** to show your support!

See my [Contributing Guidelines](CONTRIBUTING.md) for more details (coming soon).

---

## 📄 License

EvorBrain is open source software licensed under the [MIT License](LICENSE).

This means you can:

- Use it for personal or commercial purposes
- Modify and distribute it
- Include it in proprietary software

All I ask is that you include the original copyright and license notice in any copy of the software.

---

## 💬 Support

Need help? I'm here for you!

<!-- - 📖 **[Documentation](https://evorbrain.dev/docs)** - Comprehensive guides (coming soon) -->
<!-- - 💬 **[Discord Community](https://discord.gg/evorbrain)** - Get help and chat with users -->

- 🐛 **[Issue Tracker](https://github.com/evorhard/evorbrain/issues)** - Report bugs or request
  features
  <!-- - 📧 **Email** - support@evorbrain.dev -->
  <!-- - 🐦 **Twitter** - [@evorbrain](https://twitter.com/evorbrain) for updates -->

<!-- ### Sponsorship

Love EvorBrain? Consider sponsoring development:

- ☕ **[Buy us a coffee](https://buymeacoffee.com/evorbrain)**
- 💖 **[GitHub Sponsors](https://github.com/sponsors/yourusername)**
- 🎯 **[Open Collective](https://opencollective.com/evorbrain)**

Your support helps us dedicate more time to making EvorBrain amazing! -->

---

<div align="center">
  <br>
  <strong>Built with ❤️ by Evorhard</strong>
  <br>
  <sub>Making task management beautiful, fast, and local-first</sub>
</div>
