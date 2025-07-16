# React + TypeScript + Vite Configuration

This document outlines the React + TypeScript + Vite setup for the EvorBrain project.

## Configuration Overview

### TypeScript Configuration (tsconfig.json)
- **Strict Mode**: Enabled with additional strict checks
  - `strict: true`
  - `noImplicitReturns: true`
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - And more...

- **Path Aliases**: Configured for Feature-Sliced Design
  - `@/` → `src/`
  - `@app/` → `src/app/`
  - `@pages/` → `src/pages/`
  - `@widgets/` → `src/widgets/`
  - `@features/` → `src/features/`
  - `@entities/` → `src/entities/`
  - `@shared/` → `src/shared/`

### Vite Configuration (vite.config.ts)
- **Hot Module Replacement (HMR)**: Configured for Tauri development
  - Fixed port: 1420
  - WebSocket protocol for HMR
  - Ignores `src-tauri` directory

- **Build Optimization**:
  - Target: ES2021
  - Source maps for debug builds
  - Manual chunks for React libraries
  - Optimized dependencies

### ESLint Configuration (.eslintrc.cjs)
- TypeScript-aware linting with type checking
- React and React Hooks rules
- React Refresh plugin for HMR
- Strict rules:
  - No `any` types
  - Explicit function return types
  - Consistent type imports
  - Unused variable detection

### Prettier Configuration (.prettierrc.json)
- Consistent code formatting
- 100 character line width
- Semicolons required
- Double quotes for strings
- Trailing commas (ES5)

### Testing Setup (vitest.config.ts)
- Vitest for unit testing
- React Testing Library integration
- jsdom environment
- Global test utilities
- Code coverage configured
- Mocked Tauri API for tests

## Available Scripts

```bash
# Development
npm run dev           # Start Vite dev server
npm run tauri:dev     # Start Tauri in development mode

# Building
npm run build         # Build frontend for production
npm run tauri:build   # Build Tauri application

# Testing
npm run test          # Run tests
npm run test:ui       # Run tests with UI

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run type-check    # Check TypeScript types
npm run check-all     # Run all checks (type, lint, format)
```

## Next Steps

After running `npm install` to install all dependencies:

1. Test the configuration:
   ```bash
   npm run type-check  # Should pass with no errors
   npm run test        # Should run the example test
   npm run dev         # Should start the dev server
   ```

2. Start development:
   ```bash
   npm run tauri:dev   # Start the full Tauri application
   ```

## Project Structure

The project is set up to use Feature-Sliced Design (FSD) architecture. Create the following structure as you develop:

```
src/
├── app/         # Application initialization
├── pages/       # Route pages
├── widgets/     # Complex UI blocks
├── features/    # Business features
├── entities/    # Business entities
├── shared/      # Shared code
└── test/        # Test utilities
```

## Environment Variables

Create a `.env` file based on `.env.example` for any environment-specific configuration:

```bash
cp .env.example .env
```

Environment variables should be prefixed with `VITE_` to be accessible in the application.