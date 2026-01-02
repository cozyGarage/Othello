# Othello Engine API Documentation

**Version**: 2.1  
**Last Updated**: January 2, 2026

This document describes the public API of the `othello-engine` package. The engine is a standalone, framework-agnostic game logic implementation with zero UI dependencies.

---

## Table of Contents

1. [Installation](#installation)
2. [Core Classes](#core-classes)
3. [OthelloGameEngine](#othellogameengine)
4. [OthelloBot](#othellobot)
5. [TimeControlManager](#timecontrolmanager)
6. [Types & Interfaces](#types--interfaces)
7. [Event System](#event-system)
8. [Usage Examples](#usage-examples)

---

## Installation

```bash
# From the monorepo root
cd packages/othello-engine
bun install

# Build the package
bun run build
```

## Core Classes

The engine exports three main classes:

- **OthelloGameEngine** - Main game state and logic
- **OthelloBot** - AI opponent with three difficulty levels
- **TimeControlManager** - Chess-style time control system

---

## OthelloGameEngine

The core game engine implementing all Othello rules, state management, and event handling.

### Constructor

```typescript
constructor(options?: {
  enableTimeControl?: boolean;
  timeControlConfig?: TimeControlConfig;
})
```

**Parameters:**

- `options.enableTimeControl` - Whether to enable chess-style time controls (default: `false`)
- `options.timeControlConfig` - Time control configuration (initial time and increment)

**Example:**

```typescript
import { OthelloGameEngine } from 'othello-engine';

// Basic game without time control
const engine = new OthelloGameEngine();

// Game with time control (3 minutes + 2 second increment)
const timedEngine = new OthelloGameEngine({
  enableTimeControl: true,
  timeControlConfig: {
    initialTime: 3 * 60 * 1000, // 3 minutes in milliseconds
    increment: 2 * 1000, // 2 seconds in milliseconds
  },
});
```

### Public Methods

#### Game State & Information

##### `getBoard(): Board`

Returns the current board state as a 2D array.

**Returns:** `Array<Array<'B' | 'W' | 'E'>>` (8x8 grid)

- `'B'` - Black disc
- `'W'` - White disc
- `'E'` - Empty cell

**Example:**

```typescript
const board = engine.getBoard();
console.log(board[3][3]); // "W" (center position)
```

---

##### `getCurrentPlayer(): Player`

Returns the player whose turn it is.

**Returns:** `'B' | 'W'`

**Example:**

```typescript
const player = engine.getCurrentPlayer();
console.log(`It's ${player === 'B' ? 'Black' : 'White'}'s turn`);
```

---

##### `getScore(): Score`

Returns the current score (disc count) for both players.

**Returns:** `{ black: number; white: number }`

**Example:**

```typescript
const score = engine.getScore();
console.log(`Black: ${score.black}, White: ${score.white}`);
```

---

##### `isGameOver(): boolean`

Checks if the game has ended (both players have no valid moves or timeout).

**Returns:** `boolean`

**Example:**

```typescript
if (engine.isGameOver()) {
  console.log('Game over!');
}
```

---

##### `getWinner(): Player | null`

Returns the winner, or `null` if game is not over or it's a tie.

**Returns:** `'B' | 'W' | null`

**Example:**

```typescript
const winner = engine.getWinner();
if (winner) {
  console.log(`${winner === 'B' ? 'Black' : 'White'} wins!`);
} else if (engine.isGameOver()) {
  console.log("It's a tie!");
}
```

---

#### Move Validation & Execution

##### `getValidMoves(player?: Player): Coordinate[]`

Returns all valid moves for the specified player.

**Parameters:**

- `player` - Player to check moves for (default: current player)

**Returns:** `Array<[row: number, col: number]>` - Array of [row, col] coordinates

**Example:**

```typescript
const validMoves = engine.getValidMoves();
console.log(`Current player has ${validMoves.length} valid moves`);

validMoves.forEach(([row, col]) => {
  console.log(`Valid move at row ${row}, col ${col}`);
});
```

---

##### `isValidMove(row: number, col: number, player?: Player): boolean`

Checks if a specific move is valid.

**Parameters:**

- `row` - Row index (0-7)
- `col` - Column index (0-7)
- `player` - Player to check for (default: current player)

**Returns:** `boolean`

**Example:**

```typescript
if (engine.isValidMove(2, 3)) {
  console.log('Move at (2, 3) is valid');
}
```

---

##### `makeMove(row: number, col: number): boolean`

Executes a move and updates the game state.

**Parameters:**

- `row` - Row index (0-7)
- `col` - Column index (0-7)

**Returns:** `boolean` - `true` if move was successful, `false` if invalid

**Side Effects:**

- Updates board state
- Flips opponent discs
- Switches current player
- Adds move to history
- Emits `move` event
- Checks for auto-pass
- Checks for game over
- Updates time control (if enabled)

**Example:**

```typescript
const success = engine.makeMove(2, 3);
if (success) {
  console.log('Move executed successfully');
} else {
  console.log('Invalid move');
}
```

---

#### History Management

##### `getMoveHistory(): Move[]`

Returns the complete move history.

**Returns:** Array of move objects with:

- `coordinate: [number, number]` - Move position
- `player: 'B' | 'W'` - Player who made the move
- `timestamp: number` - Unix timestamp
- `flips: number` - Number of discs flipped
- `scoreAfter: { black: number; white: number }` - Score after move

**Example:**

```typescript
const history = engine.getMoveHistory();
console.log(`Game has ${history.length} moves`);

history.forEach((move, index) => {
  const [row, col] = move.coordinate;
  console.log(`Move ${index + 1}: ${move.player} at (${row}, ${col}), flipped ${move.flips} discs`);
});
```

---

##### `canUndo(): boolean`

Checks if undo is available.

**Returns:** `boolean`

**Example:**

```typescript
if (engine.canUndo()) {
  console.log('Undo available');
}
```

---

##### `undo(): boolean`

Undoes the last move and restores previous state.

**Returns:** `boolean` - `true` if undo successful, `false` if no moves to undo

**Side Effects:**

- Restores board state
- Restores current player
- Restores time state (if time control enabled)
- Emits `undo` event

**Example:**

```typescript
if (engine.undo()) {
  console.log('Move undone');
}
```

---

##### `canRedo(): boolean`

Checks if redo is available.

**Returns:** `boolean`

**Example:**

```typescript
if (engine.canRedo()) {
  console.log('Redo available');
}
```

---

##### `redo(): boolean`

Redoes a previously undone move.

**Returns:** `boolean` - `true` if redo successful, `false` if no moves to redo

**Side Effects:**

- Restores board state
- Restores current player
- Restores time state (if time control enabled)
- Emits `redo` event

**Example:**

```typescript
if (engine.redo()) {
  console.log('Move redone');
}
```

---

#### State Management

##### `reset(): void`

Resets the game to the initial state.

**Side Effects:**

- Clears board
- Places 4 starting discs
- Resets current player to Black
- Clears move history
- Resets time control (if enabled)
- Emits `reset` event

**Example:**

```typescript
engine.reset();
console.log('Game reset to initial state');
```

---

##### `exportState(): string`

Serializes the complete game state to a JSON string.

**Returns:** JSON string containing:

- Board state
- Current player
- Move history
- Time state (if enabled)
- Game over status
- Winner

**Example:**

```typescript
const savedState = engine.exportState();
localStorage.setItem('othello-save', savedState);
```

---

##### `importState(state: string): boolean`

Restores game state from a serialized JSON string.

**Parameters:**

- `state` - JSON string from `exportState()`

**Returns:** `boolean` - `true` if import successful, `false` if invalid state

**Example:**

```typescript
const savedState = localStorage.getItem('othello-save');
if (savedState && engine.importState(savedState)) {
  console.log('Game state restored');
}
```

---

#### Time Control Methods

##### `getTimeRemaining(player: Player): number | null`

Gets the remaining time for a player (in milliseconds).

**Parameters:**

- `player` - `'B'` or `'W'`

**Returns:** `number | null` - Time in milliseconds, or `null` if time control disabled

**Example:**

```typescript
const blackTime = engine.getTimeRemaining('B');
if (blackTime !== null) {
  const minutes = Math.floor(blackTime / 60000);
  const seconds = Math.floor((blackTime % 60000) / 1000);
  console.log(`Black has ${minutes}:${seconds} remaining`);
}
```

---

##### `pauseTime(): void`

Pauses the time control clock.

**Example:**

```typescript
engine.pauseTime(); // Pause when showing settings menu
```

---

##### `resumeTime(): void`

Resumes the time control clock.

**Example:**

```typescript
engine.resumeTime(); // Resume when closing settings menu
```

---

### Event System

The engine uses an event-driven architecture. Subscribe to events using the `on` method:

```typescript
engine.on(eventName, callback);
```

#### Available Events

##### `move`

Emitted when a valid move is made.

**Payload:**

```typescript
{
  coordinate: [number, number];
  player: 'B' | 'W';
  flips: number;
  score: {
    black: number;
    white: number;
  }
}
```

**Example:**

```typescript
engine.on('move', (event) => {
  const [row, col] = event.coordinate;
  console.log(`${event.player} moved to (${row}, ${col}), flipped ${event.flips} discs`);
});
```

---

##### `invalidMove`

Emitted when an invalid move is attempted.

**Payload:**

```typescript
{
  coordinate: [number, number];
  player: 'B' | 'W';
  reason: string;
}
```

**Example:**

```typescript
engine.on('invalidMove', (event) => {
  console.log(`Invalid move: ${event.reason}`);
});
```

---

##### `gameOver`

Emitted when the game ends.

**Payload:**

```typescript
{
  winner: 'B' | 'W' | null; // null = tie
  score: {
    black: number;
    white: number;
  }
  reason: 'no-moves' | 'timeout';
}
```

**Example:**

```typescript
engine.on('gameOver', (event) => {
  if (event.winner) {
    console.log(`${event.winner} wins!`);
  } else {
    console.log("It's a tie!");
  }
});
```

---

##### `pass`

Emitted when a player has no valid moves and must pass.

**Payload:**

```typescript
{
  player: 'B' | 'W';
}
```

**Example:**

```typescript
engine.on('pass', (event) => {
  console.log(`${event.player} has no valid moves and must pass`);
});
```

---

##### `undo` / `redo`

Emitted when undo/redo is executed.

**Payload:**

```typescript
{
  currentPlayer: 'B' | 'W';
  score: {
    black: number;
    white: number;
  }
}
```

---

##### `reset`

Emitted when the game is reset.

**Payload:** None

---

##### `timeUpdate`

Emitted every second when time control is enabled (for UI updates).

**Payload:**

```typescript
{
  blackTime: number; // milliseconds
  whiteTime: number; // milliseconds
  currentPlayer: 'B' | 'W';
}
```

**Example:**

```typescript
engine.on('timeUpdate', (event) => {
  console.log(`Black: ${event.blackTime}ms, White: ${event.whiteTime}ms`);
});
```

---

##### `timeout`

Emitted when a player runs out of time.

**Payload:**

```typescript
{
  player: 'B' | 'W';
  winner: 'B' | 'W';
}
```

**Example:**

```typescript
engine.on('timeout', (event) => {
  console.log(`${event.player} ran out of time! ${event.winner} wins!`);
});
```

---

## OthelloBot

AI opponent with three difficulty levels.

### Constructor

```typescript
constructor(difficulty: 'easy' | 'medium' | 'hard', player: 'B' | 'W')
```

**Parameters:**

- `difficulty` - AI difficulty level
  - `'easy'` - Random valid move
  - `'medium'` - Greedy algorithm (maximize immediate flips)
  - `'hard'` - Minimax with alpha-beta pruning (depth 4)
- `player` - Which color the AI plays as

**Example:**

```typescript
import { OthelloBot } from 'othello-engine';

const bot = new OthelloBot('hard', 'W'); // Hard AI playing as White
```

---

### Methods

##### `getMove(engine: OthelloGameEngine): Coordinate | null`

Calculates and returns the best move for the AI.

**Parameters:**

- `engine` - The game engine instance

**Returns:** `[row, col]` coordinate or `null` if no valid moves

**Example:**

```typescript
const move = bot.getMove(engine);
if (move) {
  const [row, col] = move;
  engine.makeMove(row, col);
}
```

---

## TimeControlManager

Chess-style time control system (used internally by OthelloGameEngine).

### Constructor

```typescript
constructor(config: TimeControlConfig)
```

**Parameters:**

- `config.initialTime` - Starting time per player (milliseconds)
- `config.increment` - Time added after each move (milliseconds)

**Example:**

```typescript
import { TimeControlManager } from 'othello-engine';

const timeControl = new TimeControlManager({
  initialTime: 3 * 60 * 1000, // 3 minutes
  increment: 2 * 1000, // 2 seconds
});
```

---

### Methods

See [OthelloGameEngine Time Control Methods](#time-control-methods) for usage - these methods are exposed through the main engine.

---

## Types & Interfaces

### Core Types

```typescript
// Player colors
type Player = 'B' | 'W';

// Cell states
type Cell = 'B' | 'W' | 'E';

// Board coordinate [row, col]
type Coordinate = [number, number];

// 8x8 game board
type Board = Cell[][];

// Score object
interface Score {
  black: number;
  white: number;
}

// Move object
interface Move {
  coordinate: Coordinate;
  player: Player;
  timestamp: number;
  flips: number;
  scoreAfter: Score;
}

// Time control configuration
interface TimeControlConfig {
  initialTime: number; // milliseconds
  increment: number; // milliseconds
}

// Game state (for serialization)
interface GameState {
  board: Board;
  currentPlayer: Player;
  moveHistory: Move[];
  gameOver: boolean;
  winner: Player | null;
  timeState?: {
    blackTime: number;
    whiteTime: number;
  };
}
```

---

## Usage Examples

### Basic Game

```typescript
import { OthelloGameEngine } from 'othello-engine';

const engine = new OthelloGameEngine();

// Get valid moves
const validMoves = engine.getValidMoves();
console.log('Valid moves:', validMoves);

// Make a move
const [row, col] = validMoves[0];
engine.makeMove(row, col);

// Check score
const score = engine.getScore();
console.log(`Black: ${score.black}, White: ${score.white}`);
```

---

### Game with AI

```typescript
import { OthelloGameEngine, OthelloBot } from 'othello-engine';

const engine = new OthelloGameEngine();
const bot = new OthelloBot('hard', 'W');

// Listen for moves
engine.on('move', (event) => {
  console.log(`${event.player} moved, flipped ${event.flips} discs`);

  // If it's the bot's turn, make a move
  if (engine.getCurrentPlayer() === 'W' && !engine.isGameOver()) {
    setTimeout(() => {
      const move = bot.getMove(engine);
      if (move) {
        engine.makeMove(...move);
      }
    }, 500); // Delay for better UX
  }
});

// Start the game
const humanMove = engine.getValidMoves()[0];
engine.makeMove(...humanMove);
```

---

### Game with Time Control

```typescript
import { OthelloGameEngine } from 'othello-engine';

const engine = new OthelloGameEngine({
  enableTimeControl: true,
  timeControlConfig: {
    initialTime: 3 * 60 * 1000, // 3 minutes
    increment: 2 * 1000, // 2 seconds
  },
});

// Listen for time updates
engine.on('timeUpdate', (event) => {
  console.log(`Black: ${Math.floor(event.blackTime / 1000)}s`);
  console.log(`White: ${Math.floor(event.whiteTime / 1000)}s`);
});

// Listen for timeout
engine.on('timeout', (event) => {
  console.log(`${event.player} ran out of time!`);
});

// Make moves
engine.makeMove(2, 3);
```

---

### Save & Load Game

```typescript
import { OthelloGameEngine } from 'othello-engine';

const engine = new OthelloGameEngine();

// Play some moves
engine.makeMove(2, 3);
engine.makeMove(2, 2);

// Save game
const savedState = engine.exportState();
localStorage.setItem('game', savedState);

// Later... load game
const newEngine = new OthelloGameEngine();
const loadedState = localStorage.getItem('game');
if (loadedState) {
  newEngine.importState(loadedState);
  console.log('Game restored!');
}
```

---

### Event-Driven UI Integration

```typescript
import { OthelloGameEngine } from 'othello-engine';

const engine = new OthelloGameEngine();

// Subscribe to all events
engine.on('move', (e) => updateBoard(e));
engine.on('invalidMove', (e) => showError(e.reason));
engine.on('gameOver', (e) => showWinner(e.winner));
engine.on('pass', (e) => showPassMessage(e.player));
engine.on('undo', () => updateBoard());
engine.on('redo', () => updateBoard());
engine.on('reset', () => updateBoard());

// UI functions (implement based on your framework)
function updateBoard(event) {
  // Re-render board from engine.getBoard()
}

function showError(reason) {
  // Display error message
}

function showWinner(winner) {
  // Display winner announcement
}

function showPassMessage(player) {
  // Show "Player X passes" message
}
```

---

## Testing

The engine includes comprehensive tests. Run them with:

```bash
cd packages/othello-engine
bun test
```

**Test Coverage:**

- 83+ tests covering all game rules
- Move validation (all 8 directions)
- Edge cases (corners, edges, full board)
- AI behavior (deterministic tests)
- Time control accuracy
- Undo/Redo functionality
- State serialization

---

## Performance Characteristics

### Time Complexity

| Operation          | Complexity | Notes                       |
| ------------------ | ---------- | --------------------------- |
| `getValidMoves()`  | O(64)      | Checks all 64 board squares |
| `isValidMove()`    | O(1)       | Checks 8 directions         |
| `makeMove()`       | O(1)       | Updates affected cells only |
| `getBoard()`       | O(64)      | Deep copy of board          |
| `undo()` / `redo() | O(1)       | Restores saved state        |
| AI Easy            | O(n)       | Random from n valid moves   |
| AI Medium          | O(n)       | Evaluate n valid moves      |
| AI Hard            | O(b^d)     | Minimax, b=branching, d=4   |

### Space Complexity

- **Board State**: 64 cells × 1 byte = 64 bytes
- **Move History**: ~60 moves × 80 bytes = ~5KB
- **Time Control**: Negligible (< 1KB)

### Performance Tips

1. **AI Move Time**: Hard AI typically takes 0.5-2 seconds (depends on position complexity)
2. **Event Listeners**: Remove listeners when components unmount to prevent memory leaks
3. **Serialization**: Use `exportState()` / `importState()` sparingly (deep copy overhead)

---

## Browser Compatibility

The engine is pure TypeScript with no browser dependencies. It works in:

- **Node.js** 16+
- **Bun** 1.0+
- **Deno** 1.30+
- **Browsers**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues, questions, or contributions:

- **GitHub Issues**: [github.com/cozyGarage/Othello/issues](https://github.com/cozyGarage/Othello/issues)
- **Documentation**: [README.md](../README.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)

---

**Happy coding! 🎮**
