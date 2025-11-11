# Othello Game Engine Documentation

## Overview

The **Othello Game Engine** is a standalone, framework-agnostic TypeScript library that implements the complete game logic for Othello (also known as Reversi). It provides a robust, event-driven API for building Othello games in any JavaScript/TypeScript environment.

### Key Features

- ✅ **Complete Game Logic**: All Othello rules including piece flipping, valid move detection, and game over conditions
- ✅ **Event-Driven Architecture**: Subscribe to game events (moves, invalid moves, game over, state changes)
- ✅ **Undo/Redo Support**: Full undo/redo functionality with move history
- ✅ **AI Players**: Built-in AI with three difficulty levels (easy, medium, hard)
- ✅ **State Management**: Export/import game state for persistence or network play
- ✅ **Pass Scenarios**: Automatic handling when players have no valid moves
- ✅ **TypeScript**: Fully typed for excellent IDE support and type safety
- ✅ **Framework Agnostic**: Works with React, Vue, Angular, vanilla JS, or any framework
- ✅ **Zero Dependencies**: No external dependencies for core engine

## Installation

```bash
# Using npm
npm install othello-engine

# Using bun
bun add othello-engine

# Using yarn
yarn add othello-engine
```

## Quick Start

```typescript
import { OthelloGameEngine, B, W } from 'othello-engine';

// Create a new game
const game = new OthelloGameEngine();

// Get current state
const state = game.getState();
console.log(state.currentPlayer); // 'B' (Black starts)
console.log(state.score); // { black: 2, white: 2 }

// Get valid moves
const validMoves = game.getValidMoves();
console.log(validMoves); // [[2, 3], [3, 2], [4, 5], [5, 4]]

// Make a move
const success = game.makeMove([2, 3]);
if (success) {
  console.log('Move successful!');
}

// Check if game is over
if (state.isGameOver) {
  console.log('Winner:', state.winner); // 'B', 'W', or null (tie)
}
```

## Core API Reference

### OthelloGameEngine

The main game engine class that manages game state and logic.

#### Constructor

```typescript
constructor(
  blackPlayerId?: string,
  whitePlayerId?: string
)
```

**Parameters:**

- `blackPlayerId` (optional): Identifier for the black player
- `whitePlayerId` (optional): Identifier for the white player

**Example:**

```typescript
const game = new OthelloGameEngine('player1', 'player2');
```

#### Methods

##### `getState(): GameState`

Returns the current game state.

**Returns:**

```typescript
{
  board: Board;              // Current board configuration
  currentPlayer: 'B' | 'W';  // Whose turn it is
  score: { black: number; white: number };
  isGameOver: boolean;
  winner: 'B' | 'W' | null;  // null = tie
  moveHistory: Move[];       // Array of all moves made
  validMoves: Coordinate[];  // Currently valid moves
}
```

##### `makeMove(coordinate: Coordinate): boolean`

Makes a move at the specified coordinate.

**Parameters:**

- `coordinate`: [x, y] tuple representing board position (0-7)

**Returns:**

- `true` if move was valid and successful
- `false` if move was invalid

**Example:**

```typescript
const success = game.makeMove([2, 3]);
```

##### `getValidMoves(): Coordinate[]`

Returns all valid moves for the current player.

**Returns:**

- Array of [x, y] coordinates

**Example:**

```typescript
const moves = game.getValidMoves();
// [[2, 3], [3, 2], [4, 5], [5, 4]]
```

##### `getAnnotatedBoard(): Board`

Returns a board with valid moves marked as 'P' (possible move).

**Returns:**

- Board object with 'P' markers showing valid moves

**Example:**

```typescript
const board = game.getAnnotatedBoard();
// Use this to display valid move hints to players
```

##### `reset(): void`

Resets the game to initial state.

**Example:**

```typescript
game.reset();
```

##### `undo(): boolean`

Undoes the last move.

**Returns:**

- `true` if undo was successful
- `false` if no moves to undo

**Example:**

```typescript
if (game.canUndo()) {
  game.undo();
}
```

##### `redo(): boolean`

Redoes a previously undone move.

**Returns:**

- `true` if redo was successful
- `false` if no moves to redo

**Example:**

```typescript
if (game.canRedo()) {
  game.redo();
}
```

##### `canUndo(): boolean`

Checks if undo is available.

##### `canRedo(): boolean`

Checks if redo is available.

##### `exportState(): string`

Exports the current game state as JSON.

**Returns:**

- JSON string of game state

**Example:**

```typescript
const savedState = game.exportState();
localStorage.setItem('savedGame', savedState);
```

##### `importState(stateJson: string): void`

Imports a previously exported game state.

**Parameters:**

- `stateJson`: JSON string from `exportState()`

**Example:**

```typescript
const savedState = localStorage.getItem('savedGame');
if (savedState) {
  game.importState(savedState);
}
```

##### `getPlayerId(player: 'B' | 'W'): string | undefined`

Gets the player ID for a given color.

### Event System

The engine uses an event-driven architecture for game updates.

#### `on(event: GameEventType, callback: (data) => void): void`

Subscribe to game events.

**Events:**

- `'move'`: Fired when a valid move is made
- `'invalidMove'`: Fired when an invalid move is attempted
- `'gameOver'`: Fired when the game ends
- `'stateChange'`: Fired on any state change

**Example:**

```typescript
game.on('move', (data) => {
  console.log('Move made:', data.coordinate);
  console.log('Pieces flipped:', data.flippedPieces);
});

game.on('gameOver', (data) => {
  console.log('Game over!');
  console.log('Winner:', data.winner);
  console.log('Final score:', data.finalScore);
});

game.on('invalidMove', (data) => {
  console.log('Invalid move attempted:', data.coordinate);
  console.log('Reason:', data.reason);
});

game.on('stateChange', (data) => {
  console.log('State changed:', data.state);
});
```

#### `off(event: GameEventType, callback?: Function): void`

Unsubscribe from events.

**Example:**

```typescript
const handleMove = (data) => console.log(data);
game.on('move', handleMove);

// Later...
game.off('move', handleMove);
```

### AI Bot

The engine includes a built-in AI opponent with three difficulty levels.

#### OthelloBot

```typescript
import { OthelloBot } from 'othello-engine';

const bot = new OthelloBot('medium', 'W');
```

**Constructor:**

```typescript
constructor(
  difficulty: 'easy' | 'medium' | 'hard',
  player: 'B' | 'W'
)
```

**Methods:**

##### `calculateMove(board: Board): Coordinate | null`

Calculates the best move for the current board state.

**Returns:**

- Coordinate of best move, or null if no valid moves

**Example:**

```typescript
const state = game.getState();
const move = bot.calculateMove(state.board);
if (move) {
  game.makeMove(move);
}
```

##### `setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void`

Changes the bot's difficulty level.

##### `setPlayer(player: 'B' | 'W'): void`

Changes which player the bot controls.

**AI Difficulty Levels:**

- **Easy**: Random valid move selection
- **Medium**: Greedy algorithm - maximizes immediate piece gain
- **Hard**: Minimax with alpha-beta pruning - strategic long-term play

## Type Definitions

### Board

```typescript
interface Board {
  playerTurn: 'B' | 'W';
  tiles: TileValue[][];
}
```

### TileValue

```typescript
type TileValue = 'W' | 'B' | 'E' | 'P';
```

- `'W'`: White piece
- `'B'`: Black piece
- `'E'`: Empty space
- `'P'`: Possible move (only in annotated board)

### Coordinate

```typescript
type Coordinate = [number, number]; // [x, y] both 0-7
```

### Move

```typescript
interface Move {
  coordinate: Coordinate;
  player: 'B' | 'W';
  timestamp: number;
  flippedPieces: Coordinate[];
  scoreAfter: { black: number; white: number };
}
```

### Score

```typescript
interface Score {
  black: number;
  white: number;
}
```

## Integration Examples

### Vanilla JavaScript

```typescript
import { OthelloGameEngine } from 'othello-engine';

const game = new OthelloGameEngine();
const boardElement = document.getElementById('board');

function renderBoard() {
  const state = game.getState();
  const board = game.getAnnotatedBoard();

  boardElement.innerHTML = '';

  board.tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      const cell = document.createElement('div');
      cell.className = `cell ${tile.toLowerCase()}`;
      cell.onclick = () => handleClick(x, y);
      boardElement.appendChild(cell);
    });
  });
}

function handleClick(x, y) {
  if (game.makeMove([x, y])) {
    renderBoard();
  }
}

// Subscribe to events
game.on('move', () => renderBoard());
game.on('gameOver', (data) => {
  alert(`Game Over! Winner: ${data.winner}`);
});

// Initial render
renderBoard();
```

### React (Class Component)

```typescript
import React from 'react';
import { OthelloGameEngine } from 'othello-engine';

class OthelloGame extends React.Component {
  engine = new OthelloGameEngine();

  state = {
    board: this.engine.getAnnotatedBoard(),
    score: this.engine.getState().score,
    gameOver: false
  };

  componentDidMount() {
    this.engine.on('stateChange', () => {
      const state = this.engine.getState();
      this.setState({
        board: this.engine.getAnnotatedBoard(),
        score: state.score,
        gameOver: state.isGameOver
      });
    });
  }

  handleClick = (x, y) => {
    this.engine.makeMove([x, y]);
  };

  render() {
    return (
      <div>
        <div className="score">
          Black: {this.state.score.black} | White: {this.state.score.white}
        </div>
        <div className="board">
          {this.state.board.tiles.map((row, y) => (
            <div key={y} className="row">
              {row.map((tile, x) => (
                <div
                  key={x}
                  className={`cell ${tile.toLowerCase()}`}
                  onClick={() => this.handleClick(x, y)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
```

### React (Hooks)

```typescript
import { useState, useEffect } from 'react';
import { OthelloGameEngine } from 'othello-engine';

function OthelloGame() {
  const [engine] = useState(() => new OthelloGameEngine());
  const [state, setState] = useState(engine.getState());

  useEffect(() => {
    const handleChange = () => setState(engine.getState());
    engine.on('stateChange', handleChange);
    return () => engine.off('stateChange', handleChange);
  }, [engine]);

  const handleClick = (x, y) => {
    engine.makeMove([x, y]);
  };

  return (
    <div>
      <div>Score: {state.score.black} - {state.score.white}</div>
      {/* Render board... */}
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <div>
    <div>Score: {{ score.black }} - {{ score.white }}</div>
    <div class="board">
      <div v-for="(row, y) in board.tiles" :key="y">
        <div
          v-for="(tile, x) in row"
          :key="x"
          :class="['cell', tile.toLowerCase()]"
          @click="handleClick(x, y)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { OthelloGameEngine } from 'othello-engine';

const engine = new OthelloGameEngine();
const board = ref(engine.getAnnotatedBoard());
const score = ref(engine.getState().score);

const handleClick = (x: number, y: number) => {
  engine.makeMove([x, y]);
};

const updateState = () => {
  board.value = engine.getAnnotatedBoard();
  score.value = engine.getState().score;
};

onMounted(() => {
  engine.on('stateChange', updateState);
});

onUnmounted(() => {
  engine.off('stateChange', updateState);
});
</script>
```

## Multiplayer Support

The engine is designed to support multiplayer games:

### Local Multiplayer

```typescript
const game = new OthelloGameEngine('Player 1', 'Player 2');

// Players take turns on the same device
game.on('move', (data) => {
  const state = game.getState();
  console.log(`${state.currentPlayer}'s turn`);
});
```

### Network Multiplayer (WebSocket Example)

```typescript
// Client side
import { OthelloGameEngine } from 'othello-engine';

const game = new OthelloGameEngine();
const socket = new WebSocket('ws://game-server.com');

// Send moves to server
game.on('move', (data) => {
  if (data.player === myPlayer) {
    socket.send(
      JSON.stringify({
        type: 'move',
        coordinate: data.coordinate,
      })
    );
  }
});

// Receive opponent moves
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'move') {
    game.makeMove(message.coordinate);
  }
};

// Sync state on reconnect
socket.onopen = () => {
  const state = game.exportState();
  socket.send(JSON.stringify({ type: 'sync', state }));
};
```

### Online Multiplayer (REST API Example)

```typescript
class OnlineGame {
  private engine: OthelloGameEngine;
  private gameId: string;
  private myPlayer: 'B' | 'W';

  constructor(gameId: string, myPlayer: 'B' | 'W') {
    this.engine = new OthelloGameEngine();
    this.gameId = gameId;
    this.myPlayer = myPlayer;

    // Poll for opponent moves
    setInterval(() => this.pollForUpdates(), 1000);
  }

  async makeMove(coordinate: Coordinate) {
    if (this.engine.getState().currentPlayer !== this.myPlayer) {
      return false;
    }

    const success = this.engine.makeMove(coordinate);
    if (success) {
      await fetch(`/api/games/${this.gameId}/move`, {
        method: 'POST',
        body: JSON.stringify({ coordinate }),
      });
    }
    return success;
  }

  async pollForUpdates() {
    const response = await fetch(`/api/games/${this.gameId}`);
    const data = await response.json();
    this.engine.importState(data.state);
  }
}
```

## Advanced Features

### Custom Game Rules

While the engine implements standard Othello rules, you can extend it for variants:

```typescript
import { OthelloGameEngine, Board } from 'othello-engine';

class CustomOthelloEngine extends OthelloGameEngine {
  // Example: Different initial board setup
  constructor() {
    super();
    // Modify initial board after construction
  }

  // Example: Custom scoring
  customScore(board: Board): { black: number; white: number } {
    // Your custom scoring logic
    return super.getState().score;
  }
}
```

### Performance Monitoring

```typescript
const game = new OthelloGameEngine();

game.on('move', (data) => {
  console.time('move-processing');
  // Process move
  console.timeEnd('move-processing');
});
```

### Save/Load Games

```typescript
// Save game
const saveGame = () => {
  const state = game.exportState();
  localStorage.setItem('savedGame', state);
  const moveHistory = game.getState().moveHistory;
  localStorage.setItem('moveHistory', JSON.stringify(moveHistory));
};

// Load game
const loadGame = () => {
  const state = localStorage.getItem('savedGame');
  if (state) {
    game.importState(state);
  }
};
```

## Future-Proof Architecture

The engine is designed with extensibility in mind:

### Planned Features (Roadmap)

1. **Time Controls**: Add chess-style time controls
2. **Game Variants**: Support for different board sizes and rule variants
3. **Replay System**: Full game replay with seek functionality
4. **Tournament Mode**: Bracket management and multi-game series
5. **Rating System**: ELO/Glicko rating calculations
6. **Opening Book**: Pre-calculated optimal openings
7. **Analysis Mode**: Post-game analysis with AI suggestions
8. **Mobile Optimization**: Touch-optimized input handling

### Extension Points

The engine provides several extension points:

```typescript
// Custom event handlers
game.on('move', customMoveHandler);
game.on('invalidMove', customInvalidMoveHandler);

// Custom AI
class CustomBot extends OthelloBot {
  calculateMove(board: Board): Coordinate | null {
    // Your custom AI logic
    return super.calculateMove(board);
  }
}

// State serialization
const state = game.exportState();
// Modify state externally if needed
game.importState(modifiedState);
```

## Best Practices

### 1. Always Check Move Validity

```typescript
const validMoves = game.getValidMoves();
if (validMoves.some(([x, y]) => x === clickX && y === clickY)) {
  game.makeMove([clickX, clickY]);
}
```

### 2. Use Event Listeners for UI Updates

```typescript
game.on('stateChange', () => {
  updateUI(game.getState());
});
```

### 3. Clean Up Event Listeners

```typescript
componentWillUnmount() {
  this.engine.off('stateChange', this.handleStateChange);
}
```

### 4. Handle Pass Scenarios

```typescript
game.on('move', (data) => {
  if (data.wasPass) {
    console.log('Player passed - no valid moves');
  }
});
```

### 5. Validate Before Making Moves

```typescript
const handlePlayerMove = (coordinate: Coordinate) => {
  const state = game.getState();

  if (state.isGameOver) {
    console.log('Game is over');
    return;
  }

  if (state.currentPlayer !== myPlayer) {
    console.log('Not your turn');
    return;
  }

  game.makeMove(coordinate);
};
```

## Testing

The engine includes comprehensive test coverage (83 tests):

```bash
# Run engine tests
cd packages/othello-engine
bun test
```

Test coverage includes:

- ✅ Game logic (valid moves, piece flipping)
- ✅ Game over conditions
- ✅ Undo/Redo functionality
- ✅ Event system
- ✅ AI algorithms (all difficulty levels)
- ✅ Edge cases and pass scenarios
- ✅ State serialization

## License

MIT License - Feel free to use in commercial and personal projects.

## Support

For issues, feature requests, or questions:

- GitHub Issues: [github.com/cozyGarage/Othello](https://github.com/cozyGarage/Othello)
- Documentation: See this file
- Examples: See `packages/othello-react` for a complete implementation

## Version History

- **1.0.0**: Initial release with complete game logic and AI
  - Full Othello rules implementation
  - Event-driven architecture
  - Undo/Redo support
  - AI with 3 difficulty levels
  - State serialization
  - Pass scenario handling
