# Othello / Reversi Game 🎮

<div align="center">

🎮 **[Play Now](https://cozygarage.github.io/Othello/)** 🎮

_A fully playable implementation of the classic Othello (Reversi) board game built with React, TypeScript, and Bun_

**Latest Update:** January 2, 2026 – **CSS Refactoring & UI Polish!** Created reusable utility classes (DRY), updated defaults (sound ON, glare OFF), slowed AI vs AI for human viewing, 3 React hooks extracted for maintainability.

![Deploy Status](https://github.com/cozyGarage/Othello/actions/workflows/deploy.yml/badge.svg)
![Tests](https://github.com/cozyGarage/Othello/actions/workflows/test.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![Bun](https://img.shields.io/badge/Bun-1.3.4-orange?style=flat-square&logo=bun)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat-square&logo=vite)
![Tests](https://img.shields.io/badge/Engine%20Tests-144%20passing-success?style=flat-square)
![Tests](https://img.shields.io/badge/React%20Tests-169%20passing-success?style=flat-square)

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
- 🤖 **AI Opponents** - Three difficulty levels:
  - Easy: Random valid move
  - Medium: Greedy (maximize immediate score)
  - Hard: Minimax with alpha-beta pruning & positional heuristics
- ⏱️ **Time Controls** - Chess-style time limits with:
  - 4 presets: Bullet (1+0), Blitz (3+2), Rapid (10+5), Classical (30+20)
  - Visual urgency indicators (colors + pulse animation)
  - Audio warnings at 10 seconds
  - Time increment per move (Fischer increment)
  - Automatic timeout detection
  - Optional mute for time sounds
- 🏆 **Winner Detection** - Instant game-over detection with winner announcement
- 📊 **Live Scoring** - Real-time score tracking for both players
- 🔄 **Undo/Redo** - Full move history with keyboard shortcuts
- 🔄 **Quick Restart** - One-click game restart functionality
- 📱 **Responsive** - Works seamlessly on desktop and mobile devices
- 💾 **Persistence** - Remembers your preferences (time settings, AI settings)

### Technical Features

- ⚡ **Lightning Fast** - Powered by Bun runtime (10-100x faster than npm)
- 🔥 **Instant Dev Server** - Vite hot reload in ~128ms
- 🛡️ **Type-Safe** - Full TypeScript with strict mode enabled
- ✅ **Well-Tested** - 267+ tests passing across engine and UI
- 🤖 **CI/CD** - Automated testing and deployment via GitHub Actions
- 📦 **Modern Tooling** - Bun + Vite + TypeScript + React
- 🧠 **Minimax AI** - Depth-limited with alpha-beta pruning for efficient decision making
- 🧪 **Comprehensive Tests** - Engine, UI, integration, and edge case coverage
- 🎵 **Web Audio API** - Programmatic sound generation (no audio files needed)
- 🎨 **CSS Animations** - GPU-accelerated for 60fps performance
- 💾 **localStorage** - Graceful degradation for privacy modes

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

## 📁 Project Structure (Monorepo)

```
packages/
	othello-engine/        # Pure game logic, AI bot (OthelloBot), tests
		src/
			index.ts           # Public API (game functions, exports)
			OthelloGameEngine.ts # Event-driven engine with undo/redo
			OthelloBot.ts      # AI implementation (easy/medium/hard)
			*.test.ts          # Engine + AI + pass scenario tests
	othello-react/         # React UI application
		src/
			OthelloGame.tsx    # Main game container
			components/        # Board, Sidebar, SettingsPanel, UI widgets
			config/features.ts # Feature flags (animations ON, sound OFF by default)
			styles/            # CSS for layout & animations
			*.test.ts(x)       # UI & feature tests
```

## 🧪 Testing

**Hybrid Testing Strategy** - Engine uses Bun Test, React uses Vitest

- 144 engine tests (logic, AI, undo/redo, time control, pass scenarios)
- 169+ React tests (board, sidebar, settings, integration, features)

```bash
bun test                                          # Run all tests
bun run test:engine                               # Engine tests only
bun run test:react                                # React tests only
bun test --watch                                  # Watch mode
```

See [docs/TESTING.md](./docs/TESTING.md) for comprehensive testing guide.

## 🚀 Deployment

Automatic deployment to GitHub Pages on push to `main` via GitHub Actions.

**Live:** [https://cozygarage.github.io/Othello/](https://cozygarage.github.io/Othello/)

## 🔐 Configuration & Feature Flags

Feature flags live in `packages/othello-react/src/config/features.ts`.
Default snapshot:

```ts
export const features = {
  animations: true,
  glassGlare: false, // disabled by default (less distracting)
  soundEffects: true, // enabled by default for feedback
  moveHistory: true,
  scoreAnimations: true,
  loadingScreen: false,
  debug: false,
  darkMode: true,
};
```

Toggle at runtime:

```ts
import { toggleFeature } from './config/features';
toggleFeature('soundEffects', true);
```

## 🧠 AI Overview

`OthelloBot` strategies:

- Easy: Uniform random over valid moves.
- Medium: Greedy immediate score delta.
- Hard: Minimax (depth-limited) with alpha-beta pruning; heuristic weights corners > edges > inner tiles.

Safety considerations:

- Depth limit prevents exponential blowup.
- Pass handling integrated in simulated turns.
- Evaluation combines material (disc counts) + positional weights.

## 🐛 Critical Rule Fix: Pass Scenarios

Fixed logic where a player without moves now properly passes. If both players have no moves, game ends immediately. Dedicated test suite ensures correctness.

## 🧹 Runtime Safety Improvements

- Removed non-null assertions in engine code.
- Added bounds checks in `tile()` helper.
- Defensive listener registration without `!`.

## 🛡 Future Stability & Hardening (Brainstorm)

Potential edge cases & mitigations:

| Edge Case                                        | Risk                           | Mitigation                                                   |
| ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| Extremely rapid clicks on board                  | Race conditions updating state | Debounce moves, ignore input during AI turn                  |
| AI depth causing long compute on low-end devices | UI freeze                      | Web Worker / async off-main-thread execution                 |
| Corrupted imported game state JSON               | Runtime errors                 | Validate schema before import (zod)                          |
| Browser tab sleep/resume mid-AI evaluation       | Out-of-sync timer/events       | Revalidate board + recompute valid moves on visibilitychange |
| Sound API not available (e.g., SSR, headless)    | Exceptions                     | Feature flag default off + try/catch around audio init       |
| Undo/Redo stack memory growth                    | Performance degradation        | Cap stack size (e.g., 200 moves) & drop oldest               |
| Mobile viewport resize during move               | Misaligned board               | Recompute board layout on resize + CSS flex safeguards       |
| Minimax encountering no moves recursively        | Infinite loop risk             | Explicit pass detection + terminal state check               |
| Invalid coordinates passed from UI               | Crash                          | Guard in `makeMove` and `tile()` (already added)             |
| Network latency (future multiplayer)             | Desync                         | Pending move queue + server ACK model                        |

Future improvements:

- Switch AI to iterative deepening + time budget.
- Add Web Worker for hard AI moves.
- Schema validation for saved/imported states.
- Error Boundary around React root to catch unexpected failures.

---

<div align="center">

**Made with ❤️ by cozyGarage**

</div>
