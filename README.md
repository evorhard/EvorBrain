# 🧠 EvorBrain

> 🚀 A powerful life management system inspired by the Zettelkasten method and Getting Things Done (GTD) principles

[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-24C8DB?style=for-the-badge&logo=tauri)](https://tauri.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SolidJS](https://img.shields.io/badge/SolidJS-2C4F7C?style=for-the-badge&logo=solid&logoColor=white)](https://www.solidjs.com/)

## 📋 Overview

EvorBrain is a desktop application that brings the power of interconnected thinking to your daily life management. Built with modern web technologies and wrapped in a lightweight native shell, it offers the perfect blend of performance and user experience.

### ✨ Key Features

- 🎯 **Life Areas Management** - Organize your life into distinct areas (Work, Personal, Health, etc.)
- 📌 **Smart Goals** - Set and track SMART goals with automatic progress monitoring
- 📂 **Project Organization** - Break down goals into actionable projects
- ✅ **Task Management** - GTD-inspired task system with priorities and dependencies
- 🔗 **Knowledge Connections** - Link related items across different areas
- 📅 **Calendar Integration** - Visualize your tasks and commitments over time
- 🔍 **Powerful Search** - Find anything instantly with full-text search
- 🎨 **Beautiful UI** - Clean, Obsidian-inspired interface with dark mode support

## 🛠️ Tech Stack

- **Frontend**: 🟦 TypeScript + ⚡ SolidJS
- **Desktop Framework**: 🦀 Tauri 2.0 (Rust)
- **Styling**: 🎨 Tailwind CSS
- **Build Tool**: ⚡ Vite
- **Package Manager**: 🍞 Bun
- **Database**: 📊 SQLite (local storage)

## 🚀 Getting Started

### Prerequisites

- 📦 [Bun](https://bun.sh/) (v1.0+)
- 🦀 [Rust](https://www.rust-lang.org/) (latest stable)
- 🔧 Platform-specific dependencies:
  - **Windows**: Microsoft C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `build-essential`, `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/evorbrain.git
   cd evorbrain
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run in development mode**
   ```bash
   bun run tauri dev
   ```

4. **Build for production**
   ```bash
   bun run tauri build
   ```

## 📁 Project Structure

```
evorbrain/
├── 📂 src/              # Frontend source code
│   ├── 🎨 components/   # SolidJS components
│   ├── 🏪 stores/       # State management
│   ├── 🎯 types/        # TypeScript definitions
│   └── 🛠️ utils/        # Utility functions
├── 📂 src-tauri/        # Rust backend
│   ├── 🔧 src/          # Rust source code
│   └── 📋 Cargo.toml    # Rust dependencies
├── 📂 public/           # Static assets
└── 📄 package.json      # Node dependencies
```

## 🎯 Core Concepts

### 🌍 Life Areas
Organize your life into distinct areas like Work, Personal, Health, Finance, etc. Each area can contain its own goals, projects, and tasks.

### 🎯 Goals
Set SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals within each life area. Track progress automatically based on completed tasks.

### 📁 Projects
Break down goals into manageable projects. Each project contains tasks that contribute to achieving your goals.

### ✅ Tasks
Individual action items with:
- 🏷️ Priorities (High, Medium, Low)
- 📅 Due dates
- 🔗 Dependencies
- 📝 Notes and attachments
- ⏰ Time tracking

## 🧪 Development

### 🔧 Available Scripts

- `bun run tauri dev` - Start development server
- `bun run tauri build` - Build for production
- `bun run test` - Run tests
- `bun run lint` - Lint code
- `bun run format` - Format code

### 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 📚 Inspired by the Zettelkasten method
- 📋 GTD principles by David Allen
- 🎨 UI inspired by Obsidian.md
- 🦀 Built with the amazing Tauri framework

---

<p align="center">
  Made with ❤️ and ☕
</p>

<p align="center">
  🌟 Star this project on GitHub — it helps!
</p>