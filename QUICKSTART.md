# 🚀 Quick Start Guide - Othello with Bun

## Prerequisites

Install Bun (if not already installed):
```bash
curl -fsSL https://bun.sh/install | bash
```

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
bun install
```
⚡ Takes ~2-5 seconds (vs 30-60s with npm)

### 2. Start Development Server
```bash
bun run dev
```
🚀 Ready in ~100ms! Opens at http://localhost:3000/Othello/

### 3. Run Tests
```bash
bun test
```
✅ 28 tests pass in ~20-80ms

## All Available Commands

```bash
# Development
bun run dev          # Start dev server with HMR
bun run build        # Build for production
bun run preview      # Preview production build

# Testing
bun test             # Run all tests once
bun test --watch     # Run tests in watch mode

# Deployment
bun run deploy       # Deploy to GitHub Pages
```

## Project Structure

```
Othello/
├── src/
│   ├── game-logic.js              # Core game logic
│   ├── game-logic.test.js         # Basic tests
│   ├── game-logic.advanced.test.js # Advanced tests
│   ├── OthelloGame.js             # Main game component
│   ├── Board.js                   # Board component
│   ├── Row.js                     # Row component
│   ├── Tile.js                    # Tile component
│   └── index.js                   # Entry point
├── public/                        # Static assets
├── index.html                     # HTML entry point
├── vite.config.js                 # Vite configuration
├── bunfig.toml                    # Bun configuration
└── package.json                   # Dependencies & scripts
```

## What Changed from Create React App?

| Aspect | Before (CRA) | After (Bun) |
|--------|-------------|-------------|
| Runtime | Node.js | Bun |
| Bundler | Webpack | Vite |
| Test Runner | Jest | Bun Test |
| Install Time | 30-60s | 2-5s |
| Dev Server | 10-20s | ~100ms |
| Test Speed | Slow | ~20-80ms |

## Need Help?

- 📖 **Full docs**: See `BUN_MIGRATION.md`
- 💡 **Improvements**: See `IMPROVEMENTS.md`
- 🐛 **Issues**: Check the GitHub issues
- 🌐 **Play online**: https://cozygarage.github.io/Othello/

## Tips

### Hot Module Reloading
Just save any file - changes appear instantly! No page refresh needed.

### Test Watch Mode
```bash
bun test --watch
```
Tests re-run automatically when you change files.

### Build & Preview
```bash
bun run build && bun run preview
```
Test your production build locally before deploying.

---

**Happy coding! 🎮**
