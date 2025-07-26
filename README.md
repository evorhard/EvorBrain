# 🧠 EvorBrain

*A powerful desktop task management system built with Tauri, SolidJS, and Rust* ⚡

**Status**: 🚧 In active development (Started: July 26, 2025)

## 🌟 Overview

EvorBrain is a hybrid desktop application that combines the organizational capabilities of Notion with the local-first philosophy of Obsidian. I'm building this to provide a hierarchical task management system with life areas, goals, projects, and tasks - all stored locally on your machine. The application prioritizes performance, offline functionality, and personal extensibility while maintaining a modern, intuitive user interface.

## 🎉 Core Features (Planned)

### 🎯 Hierarchical Organization System
- **🌈 Life Areas**: Top-level categories for organizing different aspects of life (Career, Health, Personal, etc.)
- **🎪 Goals**: Measurable objectives linked to life areas
- **📁 Projects**: Concrete initiatives to achieve goals
- **✅ Tasks**: Actionable items with optional subtasks
- **🔗 Flexible Linking**: Items can exist independently or be connected in the hierarchy

### 💾 Local-First Storage
- 📂 All data stored as human-readable files on your local filesystem
- 🏗️ File structure mirrors the organizational hierarchy
- ⚡ Instant access without internet connection
- 🔐 Full control over data location and backups

### 🚀 Key Features
- **⭐ Priority System**: Configurable priority levels with visual indicators
- **📅 Calendar View**: Day/week/month views with drag-and-drop scheduling
- **📊 Dashboard**: At-a-glance overview with customizable widgets
- **🔄 Git Backup**: Automatic version control for all changes
- **🔍 Search**: Fast full-text search across all content
- **⌨️ Keyboard Navigation**: Efficient keyboard-first workflow

## 💻 Technology Stack

### 🖥️ Desktop Framework
- **[Tauri 2.0](https://tauri.app/)** 🦀: Provides a lightweight, secure, and performant desktop runtime
- **Rust Backend** ⚙️: Powers file operations, system integration, and performance-critical features
- **Native OS Integration** 🖼️: System tray, notifications, and file system access

### 🎨 Frontend Stack
- **[SolidJS](https://www.solidjs.com/)** ⚛️: Fine-grained reactivity for blazing-fast UI updates
- **[Vite](https://vitejs.dev/)** ⚡: Lightning-fast build tool with HMR
- **[Bun](https://bun.sh/)** 🍞: Modern JavaScript runtime and package manager
- **[Tailwind CSS](https://tailwindcss.com/)** 🎨: Utility-first CSS framework
- **TypeScript** 📘: Type-safe development experience

### 🗄️ Data Layer
- **📝 File Storage**: JSON/Markdown files for human readability
- **🗃️ SQLite**: Performance layer for indexing and fast queries
- **🌿 Git Integration**: Built-in version control

## 📈 Development Status

I'm currently in **Phase 1: MVP Foundation** 🏗️

### ✅ Completed
- [x] 🎉 Project initialization with Tauri and SolidJS
- [x] ⚙️ Basic Tauri configuration
- [x] 🍞 Bun package manager setup

### 🚧 In Progress
- [ ] 📘 TypeScript strict mode configuration
- [ ] 🎨 Tailwind CSS integration
- [ ] 🏗️ Core data models implementation
- [ ] 📁 Basic file system operations

### 📋 Upcoming
- [ ] 🔌 IPC communication layer
- [ ] 🎨 Basic UI components
- [ ] 💾 CRUD operations for entities
- [ ] 🗃️ SQLite integration

## 🚀 Getting Started

### 📦 Prerequisites
- [Bun](https://bun.sh/) 🍞 (v1.2.19 or later)
- [Rust](https://www.rust-lang.org/) 🦀 (v1.88.0 or later)
- Node.js 💚 (for development tools)

### 🔧 Installation

```bash
# Clone the repository 📥
git clone https://github.com/yourusername/evorbrain.git
cd evorbrain

# Install dependencies 📦
bun install

# Run in development mode 🔥
bun run tauri dev

# Build for production 🏗️
bun run tauri build
```

## 📁 Project Structure

```
evorbrain/
├── src/                 # 🎨 SolidJS frontend code
│   ├── components/      # 🧩 UI components
│   ├── stores/          # 🗄️ State management
│   └── utils/           # 🛠️ Utilities
├── src-tauri/           # 🦀 Rust backend code
│   ├── src/             # 📝 Rust source files
│   └── Cargo.toml       # 📦 Rust dependencies
├── public/              # 🖼️ Static assets
├── .taskmaster/         # 📋 Task management system
├── package.json         # 📦 JavaScript dependencies
├── vite.config.ts       # ⚡ Vite configuration
└── tauri.conf.json      # 🔧 Tauri configuration
```

## 💭 Development Philosophy

I believe in:
- **🏠 Local-First**: Your data stays on your machine
- **⚡ Performance**: Sub-500ms startup, instant operations
- **🔒 Privacy**: No telemetry, no cloud requirements
- **🧩 Extensibility**: Plugin system for custom workflows
- **✨ Simplicity**: Clean UI that gets out of your way

## 🗺️ Roadmap

### 📍 Phase 1: MVP Foundation (Current)
- 🏗️ Core infrastructure and data models
- 💾 Basic CRUD operations
- 🎨 Simple UI components

### 📍 Phase 2: Enhanced Functionality
- 📊 Dashboard and calendar views
- ⭐ Priority system
- 🔄 Git auto-backup
- 🔍 Advanced search

### 📍 Phase 3: Polish and Optimization
- ⚡ Performance improvements
- ✨ UI refinements
- 🧪 Comprehensive testing
- 📤 Import/export tools

### 📍 Phase 4: Future Enhancements
- 🧩 Plugin system
- 🤖 AI integration for smart suggestions
- 📊 Analytics and visualizations
- 📱 Mobile companion apps

## 🤝 Contributing

This project is currently in early development. I welcome feedback and ideas! Feel free to open issues for bugs or feature requests. 💡

## 📄 License

MIT License - see LICENSE file for details 📜

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/) 🦀 for desktop capabilities
- Powered by [SolidJS](https://www.solidjs.com/) ⚛️ for reactive UI
- Accelerated by [Vite](https://vitejs.dev/) ⚡ and [Bun](https://bun.sh/) 🍞
- Inspired by the best features of Notion 📝 and Obsidian 🔮

---

*🚀 EvorBrain is actively being developed. Follow the progress and contribute on GitHub!*