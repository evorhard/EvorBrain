# 🧠 EvorBrain

```
███████╗██╗   ██╗ ██████╗ ██████╗ ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
██╔════╝██║   ██║██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
█████╗  ██║   ██║██║   ██║██████╔╝██████╔╝██████╔╝███████║██║██╔██╗ ██║
██╔══╝  ╚██╗ ██╔╝██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
███████╗ ╚████╔╝ ╚██████╔╝██║  ██║██████╔╝██║  ██║██║  ██║██║██║ ╚████║
╚══════╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
```

**A local-first, hierarchical task management system that combines the best of Notion and Obsidian into a blazing-fast desktop application.**

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

## 🤔 What Does This Do?

EvorBrain is your personal life management system that helps you organize everything from big life goals down to daily tasks. Think of it as a digital brain that:

- **Organizes your life** into clear areas (Career, Health, Finance, etc.)
- **Breaks down goals** into achievable projects and tasks
- **Stores everything locally** on your computer - you own your data
- **Syncs automatically** using Git for backups and multi-device access
- **Works offline** with the speed of a native desktop app
- **Reads like Obsidian** with human-readable markdown files
- **Functions like Notion** with a beautiful, intuitive interface

Perfect for anyone who wants the power of Notion's organization with Obsidian's local-first philosophy and the performance of a native app.

---

## ✨ Key Features

### 🚀 Available Now

- **Hierarchical Organization**: Life Areas → Goals → Projects → Tasks → Subtasks
- **Local-First Storage**: All data stored in SQLite + markdown files on your computer
- **Git Integration**: Automatic version control and backup to GitHub/GitLab
- **Beautiful UI**: Modern, responsive interface built with SolidJS and Tailwind CSS
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

| Component              | Technology                                                 | Why I Chose It                                         |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| **Desktop Framework**  | [Tauri 2.0](https://tauri.app)                             | Rust-powered, secure, 50MB apps vs Electron's 150MB+   |
| **Frontend Framework** | [SolidJS](https://solidjs.com)                             | No virtual DOM, fine-grained reactivity, 7KB runtime   |
| **Styling**            | [Tailwind CSS](https://tailwindcss.com)                    | Utility-first, great DX, perfect for rapid development |
| **UI Components**      | [Kobalte](https://kobalte.dev)                             | Accessible, unstyled components for SolidJS            |
| **Database**           | [SQLite](https://sqlite.org)                               | Fast, reliable, zero-config embedded database          |
| **Language**           | [TypeScript](https://typescriptlang.org)                   | Type safety, better DX, fewer runtime errors           |
| **Backend Language**   | [Rust](https://rust-lang.org)                              | Memory safe, blazing fast, excellent for native apps   |
| **Runtime**            | [Bun](https://bun.sh)                                      | Fast all-in-one JavaScript runtime and toolkit         |
| **State Management**   | [Solid Stores](https://www.solidjs.com/docs/latest#stores) | Built-in reactive state management                     |
| **Data Fetching**      | [TanStack Query](https://tanstack.com/query)               | Powerful async state management                        |

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
# Initialize the database and file structure
bun run init

# Start the development server
bun run dev
```

That's it! The app should now be running in development mode.

---

## 🎯 Getting Started

### Quick Start Guide

1. **Launch the App**

   ```bash
   bun run dev
   ```

2. **Create Your First Life Area**

   - Click the "+" button in the sidebar
   - Name it (e.g., "Career", "Health", "Personal")
   - Choose a color and icon

3. **Add a Goal**

   - Select your life area
   - Click "Add Goal"
   - Define what you want to achieve
   - Set a target date

4. **Create a Project**

   - Within your goal, create a project
   - Break it down into actionable tasks
   - Set priorities and deadlines

5. **Start Working!**
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
│   │   ├── commands/      # Tauri IPC commands
│   │   ├── db/           # Database operations
│   │   ├── storage/      # File system operations
│   │   ├── sync/         # Git synchronization
│   │   └── utils/        # Shared utilities
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
│
├── src/                   # SolidJS frontend
│   ├── components/       # UI components
│   ├── stores/          # State management
│   ├── hooks/           # Custom hooks
│   ├── api/             # Tauri command wrappers
│   ├── types/           # TypeScript types
│   ├── styles/          # Global styles
│   └── App.tsx          # Root component
│
├── data/                  # User data (git-ignored)
│   ├── evorbrain.db      # SQLite database
│   ├── areas/           # Life area markdown files
│   ├── attachments/     # File attachments
│   └── config/          # User settings
│
├── public/               # Static assets
├── scripts/             # Build and utility scripts
├── tests/               # Test files
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
└── README.md          # You are here! 👋
```

---

## 💻 Development Workflow

### Running the App

```bash
# Development mode with hot reload
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Lint and format code
bun run lint
bun run format
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
   bun run test
   bun run lint
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

## 📚 Documentation

- **[Planning Document](PLANNING.md)** - Detailed architecture, design decisions, and technical specifications
- **[Task Tracking](TASKS.md)** - Current development status, upcoming features, and task assignments
- **[API Documentation](docs/api.md)** - Tauri command reference (coming soon)
- **[Plugin Development](docs/plugins.md)** - Guide to creating EvorBrain plugins (coming soon)
- **[User Guide](docs/user-guide.md)** - Comprehensive user documentation (coming soon)

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

- 🐛 **[Issue Tracker](https://github.com/evorhard/evorbrain/issues)** - Report bugs or request features
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
