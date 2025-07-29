# EvorBrain

A life management system that integrates seamlessly with how you think and work.

## Tech Stack

- **Frontend**: SolidJS + TypeScript + Tailwind CSS
- **Desktop**: Tauri (Rust)
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Database**: SQLite (coming soon)

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime & package manager
- [Rust](https://www.rust-lang.org/) - Required for Tauri
- [Node.js](https://nodejs.org/) - Required for some tooling

### Getting Started

1. Install dependencies:
```bash
bun install
```

2. Run development server:
```bash
bun run tauri dev
```

3. Build for production:
```bash
bun run tauri build
```

## Project Structure

```
evorbrain/
├── src/                    # Frontend source code
│   ├── components/         # UI components
│   ├── lib/               # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── index.tsx          # Application entry point
├── src-tauri/             # Rust backend
│   ├── src/               # Rust source code
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static assets
└── package.json           # Project dependencies
```

## Features (Planned)

- **Life Areas**: Organize your life into meaningful categories
- **Goals & Projects**: Break down your aspirations into actionable items
- **Task Management**: GTD-inspired task system with contexts and priorities
- **Markdown Notes**: Rich note-taking with full markdown support
- **Calendar View**: Visualize your tasks and events
- **Search**: Fast, full-text search across all your data
- **Git Integration**: Version control for your life data
- **AI Assistant**: Claude-powered insights and suggestions

## Development Progress

Phase 1: Foundation ✅
- [x] Initialize Tauri project with SolidJS template
- [x] Configure Bun as package manager
- [x] Set up TypeScript configuration
- [x] Configure Tailwind CSS
- [ ] Set up development environment scripts
- [ ] Configure Git with .gitignore

See [TASKS.md](./TASKS.md) for detailed development progress.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) 
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## License

MIT License - see [LICENSE](./LICENSE) for details
