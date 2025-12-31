# Othello - 42 School Project Subject

```
███████╗████████╗██╗  ██╗███████╗██╗     ██╗      ██████╗
██╔═══██╗╚══██╔══╝██║  ██║██╔════╝██║     ██║     ██╔═══██╗
██║   ██║   ██║   ███████║█████╗  ██║     ██║     ██║   ██║
██║   ██║   ██║   ██╔══██║██╔══╝  ██║     ██║     ██║   ██║
╚██████╔╝   ██║   ██║  ██║███████╗███████╗███████╗╚██████╔╝
 ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝
```

**A modern web implementation of the classic Othello (Reversi) board game**

**Version**: 2.0 (Time Control Update)  
**Difficulty**: Intermediate to Advanced  
**Skills**: TypeScript, React, Game Logic, AI, Real-time Systems  
**Estimated Time**: 60-80 hours

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Objectives](#project-objectives)
3. [Mandatory Requirements](#mandatory-requirements)
4. [Technical Constraints](#technical-constraints)
5. [Architecture Requirements](#architecture-requirements)
6. [Feature Specifications](#feature-specifications)
7. [Bonus Features](#bonus-features)
8. [Forbidden Actions](#forbidden-actions)
9. [Submission Guidelines](#submission-guidelines)
10. [Evaluation Criteria](#evaluation-criteria)

---

## Introduction

### What is Othello?

Othello (also known as Reversi) is a classic two-player strategy board game. Players take turns placing discs on an 8×8 board, with the goal of flipping opponent discs to their own color. The game ends when no more moves are possible, and the player with the most discs wins.

**Rules Summary**:

- 8×8 board, starts with 4 discs in center (2 black, 2 white)
- Players alternate placing discs
- A valid move must flip at least one opponent disc
- Flipping occurs in straight lines (horizontal, vertical, diagonal)
- If a player has no valid moves, they pass
- Game ends when board is full or both players have no moves
- Player with most discs wins

### Project Goal

You will create a **complete, production-ready** web application that:

1. Implements perfect Othello game logic with zero bugs
2. Provides a beautiful, responsive user interface
3. Includes AI opponents with varying difficulty levels
4. Features chess-style time controls for competitive play
5. Demonstrates mastery of TypeScript, React, and software architecture

This project tests your ability to:

- Design clean, maintainable code architectures
- Implement complex game logic correctly
- Handle edge cases and error states gracefully
- Create intuitive user experiences
- Write comprehensive tests
- Document code professionally

---

## Project Objectives

### Primary Learning Goals

1. **Game Logic Implementation**
   - Understand and implement complex rule systems
   - Handle state management for turn-based games
   - Validate moves according to strict game rules
   - Detect game-over conditions accurately

2. **TypeScript Mastery**
   - Use advanced TypeScript features (generics, union types, type guards)
   - Achieve 100% type safety (no `any` types allowed)
   - Design clear, self-documenting type interfaces
   - Leverage TypeScript for compile-time error prevention

3. **React Architecture**
   - Structure applications using component hierarchy
   - Manage complex application state
   - Implement event-driven architectures
   - Optimize performance (avoid unnecessary re-renders)

4. **Algorithm Design**
   - Implement minimax algorithm with alpha-beta pruning
   - Design efficient move validation algorithms
   - Create heuristic evaluation functions
   - Balance algorithm complexity vs performance

5. **User Experience**
   - Create intuitive, self-explanatory interfaces
   - Provide helpful visual feedback
   - Handle errors gracefully
   - Ensure accessibility (keyboard navigation, screen readers)

6. **Testing & Quality**
   - Write comprehensive unit tests
   - Test edge cases thoroughly
   - Maintain high code coverage
   - Use TDD (Test-Driven Development) where appropriate

---

## Mandatory Requirements

### Part 1: Core Game Engine (40 points)

You must implement a **standalone game engine** that is completely independent of the UI.

#### 1.1 Board Representation (10 points)

- 8×8 grid stored as 2D array or equivalent
- Cells contain: Black (`'B'`), White (`'W'`), or Empty (`'E'`)
- Efficient access to any cell `O(1)`
- Deep copy capability for move exploration

#### 1.2 Move Validation (10 points)

```typescript
/**
 * Determines if a move is valid according to Othello rules
 * A valid move must:
 * - Be on an empty cell
 * - Flip at least one opponent disc in any direction
 */
isValidMove(coordinate: [row, col], player: 'B' | 'W'): boolean
```

**Requirements**:

- Check all 8 directions (N, NE, E, SE, S, SW, W, NW)
- Must flip opponent pieces sandwiched between move and existing piece
- Return false if no flips possible
- Handle edge cases (board edges, occupied cells)

#### 1.3 Move Execution (10 points)

```typescript
/**
 * Execute a move and flip all affected discs
 * Must update board state atomically
 */
makeMove(coordinate: [row, col], player: 'B' | 'W'): boolean
```

**Requirements**:

- Validate move before execution
- Flip all captured discs in all valid directions
- Alternate player turns
- Emit events for state changes
- Support move history tracking

#### 1.4 Game State Management (10 points)

```typescript
/**
 * Track complete game state including:
 * - Current board configuration
 * - Active player
 * - Move history
 * - Score (disc counts)
 * - Game-over status
 */
getState(): GameState
```

**Requirements**:

- Immutable state updates
- Full game state export/import (serialization)
- Undo/Redo functionality (navigate move history)
- Pass detection (player has no valid moves)
- Game-over detection (both players have no moves, or board full)

### Part 2: User Interface (30 points)

#### 2.1 Board Display (10 points)

- 8×8 grid with clear visual separation
- Distinct colors for Black and White discs
- Highlight valid moves for current player
- Show last move indicator
- Responsive design (desktop, tablet, mobile)

#### 2.2 Game Controls (10 points)

- New Game button (reset board)
- Undo/Redo buttons (with disabled states)
- Settings panel for features/preferences
- Clear player turn indicator
- Score display (real-time updates)

#### 2.3 Move History & Feedback (10 points)

- Display move history with algebraic notation (a1-h8)
- Show timestamps for each move
- Visual feedback for move execution (animation)
- Error messages for invalid moves
- Game-over message with winner announcement

### Part 3: AI Opponent (20 points)

Implement **three difficulty levels** of AI:

#### 3.1 Easy AI (5 points)

- Random valid move selection
- Unpredictable play (no strategy)
- Should be easily beatable by beginners

#### 3.2 Medium AI (7 points)

- Greedy algorithm (maximize immediate flips)
- Deterministic behavior (same board → same move)
- Challenging for casual players

#### 3.3 Hard AI (8 points)

- Minimax algorithm with alpha-beta pruning
- Search depth: minimum 4 plies
- Position-based evaluation (corners, edges valuable)
- Should defeat most human players

**AI Requirements**:

- Configurable player (Black or White)
- Reasonable move time (< 2 seconds for hard AI)
- No cheating (AI follows same rules as human)

### Part 4: Time Controls (10 points)

#### 4.1 Clock System (5 points)

```typescript
/**
 * Chess-style time control with Fischer increment
 * - Each player starts with initial time
 * - After each move, increment is added
 * - Clock ticks while it's your turn
 * - Game ends when time expires
 */
interface TimeControlConfig {
  initialTime: number; // milliseconds
  increment: number; // milliseconds added per move
}
```

**Requirements**:

- Accurate time tracking (within 100ms precision)
- Automatic clock switching on moves
- Timeout detection (game-over when time expires)
- Time preserved in undo/redo
- State serialization (save/restore time)

#### 4.2 UI Integration (5 points)

- Real-time time display (updates smoothly)
- Visual urgency indicators (colors: green → yellow → red)
- Sound alerts (warning at 10s, timeout alarm)
- Preset time controls (Bullet, Blitz, Rapid, Classical)
- Settings persistence (localStorage)

---

## Technical Constraints

### Language & Framework

- **TypeScript 5.0+** (strict mode required)
- **React 18+** (class OR functional components)
- **Build Tool**: Vite, Webpack, or similar
- **Testing**: Bun, Jest, Vitest, or equivalent
- **Linting**: ESLint with strict rules

### Code Quality

- **Zero `any` types** (except when absolutely necessary with justification)
- **100% type coverage** (all functions, variables typed)
- **Descriptive naming** (no single-letter variables except loops)
- **Comprehensive comments** (JSDoc for all exported functions)
- **DRY principle** (no code duplication)
- **SOLID principles** (clean architecture)

### Testing Requirements

- **Minimum 80% code coverage**
- **All game rules tested** (valid/invalid moves)
- **Edge cases covered** (corners, edges, full board)
- **AI behavior verified** (deterministic tests for medium/hard)
- **Time control accuracy** (within ±100ms tolerance)

### Performance

- **Initial load**: < 3 seconds
- **Move execution**: < 100ms (including animation)
- **Hard AI move time**: < 2 seconds
- **Memory**: No memory leaks (long-running games)
- **60 FPS animations** (smooth visual feedback)

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- **No Internet Explorer support required**

---

## Architecture Requirements

### Separation of Concerns

Your codebase MUST be organized into clear layers:

```
packages/
├── othello-engine/          # Game logic (zero UI dependencies)
│   ├── src/
│   │   ├── OthelloGameEngine.ts    # Main engine class
│   │   ├── OthelloBot.ts           # AI implementation
│   │   ├── TimeControlManager.ts   # Time tracking
│   │   └── index.ts                # Public API exports
│   └── tests/                      # Engine tests
│
└── othello-react/           # UI layer (uses engine as dependency)
    ├── src/
    │   ├── OthelloGame.tsx         # Main component
    │   ├── components/             # React components
    │   ├── styles/                 # CSS modules
    │   └── utils/                  # UI utilities
    └── tests/                      # UI tests
```

**Critical Rule**: The engine package MUST NOT import anything from the UI package.

### Event-Driven Communication

Use the **Observer pattern** for engine ↔ UI communication:

```typescript
// Engine emits events
engine.on('move', (event) => {
  /* handle move */
});
engine.on('gameOver', (event) => {
  /* handle game over */
});
engine.on('invalidMove', (event) => {
  /* handle error */
});

// UI listens and updates
```

**Forbidden**: Direct coupling (UI calling engine methods that directly manipulate DOM)

### State Management

- **Single source of truth**: Engine owns game state
- **Immutable updates**: Never mutate state directly
- **Unidirectional data flow**: State flows down, events flow up

---

## Feature Specifications

### 1. Move History

Track every move made in the game:

```typescript
interface Move {
  coordinate: [number, number]; // [row, col]
  player: 'B' | 'W';
  timestamp: number; // Unix timestamp
  flips: number; // How many discs flipped
  scoreAfter: { black: number; white: number };
}
```

**Display Format**: Algebraic notation (e.g., "d5", "e6")

- Rows: 8 (top) to 1 (bottom)
- Columns: a (left) to h (right)

### 2. Undo/Redo System

- Maintain full history stack
- Undo returns to previous state (board, player, time)
- Redo re-applies undone move
- Making a new move clears redo stack
- Undo/Redo buttons disabled when unavailable

### 3. Settings Panel

Configurable features:

- **Animations**: Enable/disable piece flip animations
- **Sound Effects**: Enable/disable audio feedback
- **Glass Glare**: Decorative glare effect on pieces
- **Move History**: Show/hide move list
- **Score Animations**: Animate score changes
- **Debug Mode**: Show extra developer info

### 4. Sound System

Implement using Web Audio API (no external files):

| Event          | Sound Description                           |
| -------------- | ------------------------------------------- |
| Valid move     | Mid-frequency "tick" (800Hz, 0.1s)          |
| Invalid move   | Low buzz (150Hz sawtooth, 0.15s)            |
| Game over      | Ascending chord (C-E-G, 0.5s)               |
| Time warning   | Two-tone beep (1000Hz → 800Hz, 0.3s)        |
| Time increment | Subtle ding (1200Hz, 0.2s)                  |
| Timeout        | Alarm pattern (alternating 900/700Hz, 0.6s) |

### 5. Animations

CSS-based animations for performance:

| Animation              | Duration  | Effect                     |
| ---------------------- | --------- | -------------------------- |
| Piece flip             | 0.6s      | rotateY(180deg) with scale |
| Glass glare            | 5s cycle  | Sweep across piece surface |
| Score change           | 0.5s      | Scale up + color pulse     |
| Time pulse (critical)  | 1.5s loop | Scale + red glow           |
| Time flash (increment) | 0.3s      | Yellow highlight           |

### 6. Time Presets

| Preset    | Time  | Increment | Description               |
| --------- | ----- | --------- | ------------------------- |
| Bullet    | 1:00  | 0s        | Fast-paced, one minute    |
| Blitz     | 3:00  | 2s        | Quick game with increment |
| Rapid     | 10:00 | 5s        | Standard competitive      |
| Classical | 30:00 | 0s        | Long, thoughtful game     |

### 7. localStorage Persistence

Save user preferences automatically:

- Time control enabled/disabled
- Selected time preset
- Feature toggles (sound, animations, etc.)
- AI difficulty and player selection

**Key**: Use namespaced keys (`othello:settingName`)  
**Fallback**: Graceful degradation if localStorage unavailable

---

## Bonus Features

### Level 1 Bonuses (+10 points)

- [x] **Mobile responsiveness** (touch controls, portrait/landscape)
- [x] **Keyboard shortcuts** (arrow keys, undo/redo hotkeys)
- [x] **Dark mode** (theme toggle)
- [x] **Spectator mode** (watch AI vs AI)

### Level 2 Bonuses (+15 points)

- [x] **Game replay system** (step through moves at any speed)
- [x] **Position analysis** (show best move hints)
- [x] **Custom time controls** (user-defined time/increment)
- [x] **Game statistics** (win/loss record, average move time)

### Level 3 Bonuses (+20 points)

- [ ] **Multiplayer** (WebSocket-based online play)
- [ ] **Tournament mode** (bracket system, multiple games)
- [ ] **Opening book** (database of standard openings)
- [ ] **Position editor** (set up custom board positions)

### Expert Bonuses (+30 points)

- [ ] **Endgame solver** (perfect play in final moves)
- [ ] **Machine learning AI** (neural network-based)
- [ ] **3D board rendering** (Three.js or WebGL)
- [ ] **Mobile app** (React Native or PWA)

---

## Forbidden Actions

### ❌ Absolutely Prohibited

1. **Using External Othello Libraries**
   - No othello-js, reversi-ai, or similar
   - You must implement ALL game logic yourself
   - Exception: Testing libraries (Jest, Vitest, etc.)

2. **Type Safety Violations**
   - No `any` types without explicit justification
   - No `@ts-ignore` or `@ts-nocheck`
   - No implicit `any` from poor type inference

3. **Code Quality Issues**
   - No copy-pasted code (DRY principle)
   - No magic numbers (use named constants)
   - No functions > 50 lines (extract smaller functions)
   - No files > 500 lines (split into modules)

4. **Testing Shortcuts**
   - No mocking the game engine in tests
   - No skipping edge case tests
   - No fake test coverage (tests must be meaningful)

5. **Performance Violations**
   - No O(n²) algorithms where O(n) exists
   - No memory leaks (clean up intervals/listeners)
   - No blocking the main thread (> 100ms)

### ⚠️ Strongly Discouraged

1. **Poor Architecture**
   - Mixing game logic and UI code
   - Global state (use proper state management)
   - Tight coupling between components

2. **Bad Practices**
   - Commented-out code in production
   - Console.log statements (use proper logging)
   - Hardcoded values that should be configurable

3. **Documentation Neglect**
   - Missing README
   - No inline comments for complex logic
   - Undocumented public APIs

---

## Submission Guidelines

### Repository Structure

```
Othello/
├── README.md                    # Project overview
├── docs/
│   ├── TIME_CONTROL_DESIGN.md   # Design decisions
│   ├── USER_TESTING_GUIDE.md    # Testing instructions
│   └── API.md                   # Engine API documentation
├── packages/
│   ├── othello-engine/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   └── tests/
│   └── othello-react/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── src/
│       └── tests/
├── package.json                 # Root package.json (workspace)
└── .gitignore
```

### Required Files

1. **README.md** (minimum sections):
   - Project description
   - Installation instructions
   - How to run (dev server)
   - How to test
   - How to build for production
   - Technology stack
   - Project structure

2. **Documentation** (`docs/`):
   - Design decisions document
   - API documentation (engine public methods)
   - Testing guide for evaluators

3. **Configuration Files**:
   - `tsconfig.json` (strict mode enabled)
   - `eslint.config.js` (no warnings allowed)
   - `package.json` (all dependencies listed)

### Git Requirements

- Clean commit history (meaningful messages)
- No sensitive data (API keys, passwords)
- No `node_modules` or build artifacts
- `.gitignore` properly configured
- Main branch should be production-ready

### Testing Before Submission

Run this checklist:

```bash
# 1. Clean install
rm -rf node_modules
bun install

# 2. Run linter (must pass)
bun run lint

# 3. Run tests (must pass)
bun test

# 4. Build for production (must succeed)
bun run build

# 5. Start dev server (must load)
bun run dev
```

**All steps must complete without errors.**

---

## Evaluation Criteria

### Functionality (50 points)

| Category     | Points | Criteria                             |
| ------------ | ------ | ------------------------------------ |
| Game Engine  | 20     | All rules correctly implemented      |
| UI/UX        | 15     | Intuitive, responsive, accessible    |
| AI           | 10     | Three difficulty levels working      |
| Time Control | 5      | Accurate tracking, timeout detection |

### Code Quality (30 points)

| Category      | Points | Criteria                           |
| ------------- | ------ | ---------------------------------- |
| Type Safety   | 10     | 100% TypeScript, no `any`          |
| Architecture  | 10     | Clean separation, SOLID principles |
| Documentation | 5      | Comprehensive comments, README     |
| Testing       | 5      | 80%+ coverage, edge cases tested   |

### Correctness (20 points)

| Category         | Points | Criteria                        |
| ---------------- | ------ | ------------------------------- |
| Move Validation  | 5      | All valid/invalid moves handled |
| State Management | 5      | Undo/redo, serialization work   |
| Edge Cases       | 5      | Corners, passes, full board     |
| No Bugs          | 5      | Zero crashes, no error states   |

### Bonuses (up to +75 points)

See [Bonus Features](#bonus-features) section.

---

## Common Mistakes to Avoid

### 1. Incorrect Flipping Logic

**Mistake**: Only flipping in one direction  
**Fix**: Check all 8 directions, flip in each valid direction

### 2. Missing Pass Detection

**Mistake**: Game gets stuck when player has no moves  
**Fix**: Automatically pass if no valid moves exist

### 3. Game-Over Logic Errors

**Mistake**: Game doesn't end when both players pass  
**Fix**: Track consecutive passes, end game after 2

### 4. Memory Leaks

**Mistake**: Not removing event listeners on unmount  
**Fix**: Always clean up in `componentWillUnmount` or useEffect cleanup

### 5. AI Timeout

**Mistake**: Hard AI taking > 5 seconds per move  
**Fix**: Limit search depth, optimize evaluation function

### 6. Type Safety Bypass

**Mistake**: Using `as any` to "fix" type errors  
**Fix**: Design proper types, use type guards

### 7. Poor State Management

**Mistake**: Mutating state directly  
**Fix**: Always create new objects/arrays for state updates

### 8. Untested Edge Cases

**Mistake**: Only testing "happy path"  
**Fix**: Test corners, edges, full board, empty board, etc.

---

## Success Criteria

To pass this project, you must:

✅ Implement all Mandatory Requirements (100 points minimum)  
✅ Pass all automated tests (yours and evaluator's)  
✅ Have zero linting errors  
✅ Demonstrate working application live  
✅ Explain design decisions clearly  
✅ Code follows 42 School norms (clean, readable, documented)

**Grade Breakdown**:

- 100-110: Pass (all mandatory features)
- 110-125: Excellent (some bonuses)
- 125+: Outstanding (significant bonuses)
- 150+: Exceptional (all bonuses, flawless execution)

---

## Resources

### Game Rules

- [Othello Official Rules](https://www.worldothello.org/about/about-othello/othello-rules/official-rules/english)
- [Reversi Strategy Guide](https://en.wikipedia.org/wiki/Reversi)

### Algorithms

- [Minimax Algorithm](https://en.wikipedia.org/wiki/Minimax)
- [Alpha-Beta Pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)

### TypeScript/React

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- [Testing Library](https://testing-library.com/)

### Web Audio API

- [MDN Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Good luck, and may the best strategy win! 🎮**

_Remember: At 42, we learn by doing. Don't be afraid to make mistakes - they're how we grow._
