# Othello / Reversi Game 🎮

<div align="center">

🎮 **[Play Now](https://cozygarage.github.io/Othello/)** 🎮

*A fully playable implementation of the classic Othello (Reversi) board game built with React, TypeScript, and Bun*

![Deploy Status](https://github.com/cozyGarage/Othello/actions/workflows/deploy.yml/badge.svg)
![Tests](https://github.com/cozyGarage/Othello/actions/workflows/test.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![Bun](https://img.shields.io/badge/Bun-1.3.1-orange?style=flat-square&logo=bun)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat-square&logo=vite)
![Tests](https://img.shields.io/badge/Tests-63%20passing-success?style=flat-square)

</div>

---

## 🎯 About

Othello (also known as Reversi) is a classic strategy board game for two players. This implementation brings the timeless game to your browser with a clean, modern interface powered by Bun, TypeScript, and Vite for lightning-fast performance.

## ✨ Features

### Game Features
- 🎨 **Clean Interface** - Modern, intuitive design with smooth animations
- 🎯 **Move Validation** - Automatic validation following official Othello rules
- 💡 **Visual Hints** - Animated indicators showing all valid moves
- 🔄 **Auto-Pass** - Automatic turn passing when no valid moves are available
- 🏆 **Winner Detection** - Instant game-over detection with winner announcement
- 📊 **Live Scoring** - Real-time score tracking for both players
- 🔄 **Quick Restart** - One-click game restart functionality
- 📱 **Responsive** - Works seamlessly on desktop and mobile devices

### Technical Features
- ⚡ **Lightning Fast** - Powered by Bun runtime (10-100x faster than npm)
- 🔥 **Instant Dev Server** - Vite hot reload in ~128ms
- 🛡️ **Type-Safe** - Full TypeScript with strict mode enabled
- ✅ **Well-Tested** - 63 tests including unit and integration tests
- 🤖 **CI/CD** - Automated testing and deployment via GitHub Actions
- 📦 **Modern Tooling** - Bun + Vite + TypeScript + React

## 🎮 How to Play

### Rules

1. **Starting Position**: The game begins with 4 discs in the center (2 black, 2 white in diagonal pattern)
2. **Valid Moves**: Place your disc to flip at least one opponent's disc by sandwiching them between your discs
3. **Taking Turns**: Black moves first, then players alternate
4. **Passing**: If no valid moves are available, your turn is automatically skipped
5. **Game End**: The game ends when neither player can make a valid move
6. **Winner**: The player with the most discs wins!

### Strategy Tips

- 🎯 Corner positions are the most valuable - they can't be flipped!
- 🛡️ Edge positions are also strong but can be more vulnerable
- 🤔 Think ahead - consider how your opponent might respond
- ⚖️ Balance offense and defense throughout the game

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0 or higher) - A fast all-in-one JavaScript runtime

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cozyGarage/Othello.git
cd Othello
```

2. Install dependencies with Bun:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Why Bun? ⚡

This project now uses **Bun**, a fast all-in-one JavaScript runtime that replaces Node.js, npm, and bundlers:
- � **10-100x faster** package installation than npm
- ⚡ **Built-in test runner** - no need for Jest
- 📦 **Native bundler** via Vite integration
- 🔥 **Hot module reloading** out of the box

## �💻 Development

### Available Scripts

```bash
bun run dev      # Start development server
bun test         # Run all tests
bun run build    # Build for production
bun run preview  # Preview production build
```

## 📁 Project Structure

```
src/
├── game-logic.ts              # Core game logic (TypeScript)
├── game-logic.test.ts         # Unit tests
├── game-logic.advanced.test.ts # Advanced tests
├── integration.test.ts        # Integration tests
├── OthelloGame.tsx            # Main game component
├── Board.tsx                  # Board component
├── Row.tsx                    # Row component
├── Tile.tsx                   # Tile component
└── index.tsx                  # Entry point
```

## 🧪 Testing

**63 tests** covering unit, advanced, and integration scenarios:
- Game logic validation
- Move detection and validation
- Multi-directional flipping
- Game over detection
- DOM rendering

```bash
bun test                # Run all tests
bun test --watch        # Watch mode
bun test game-logic     # Run specific test file
```

## 🚀 Deployment

Automatic deployment to GitHub Pages on push to `main` via GitHub Actions.

**Live:** [https://cozygarage.github.io/Othello/](https://cozygarage.github.io/Othello/)

## � Documentation

- **[STATUS.md](./STATUS.md)** - Development history and what we've built
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Future enhancement ideas

---

<div align="center">

**Made with ❤️ by cozyGarage**

</div>
