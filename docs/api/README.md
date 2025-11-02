# API Reference

This section contains detailed API documentation for the Othello game components and functions.

## Game Logic API

### Core Functions

#### `initializeBoard()`
Initializes a new 8x8 Othello board with starting positions.

**Returns:** `number[][]` - 2D array representing the board state

#### `isValidMove(board, row, col, player)`
Validates if a move is legal for the given player.

**Parameters:**
- `board` (`number[][]`): Current board state
- `row` (`number`): Target row (0-7)
- `col` (`number`): Target column (0-7)
- `player` (`number`): Player number (1 or 2)

**Returns:** `boolean` - True if move is valid

#### `makeMove(board, row, col, player)`
Executes a move and updates the board state.

**Parameters:**
- `board` (`number[][]`): Current board state
- `row` (`number`): Target row (0-7)
- `col` (`number`): Target column (0-7)
- `player` (`number`): Player number (1 or 2)

**Returns:** `number[][]` - Updated board state

#### `getValidMoves(board, player)`
Gets all valid moves for a player.

**Parameters:**
- `board` (`number[][]`): Current board state
- `player` (`number`): Player number (1 or 2)

**Returns:** `Array<{row: number, col: number}>` - Array of valid move positions

#### `getScore(board)`
Calculates the current score for both players.

**Parameters:**
- `board` (`number[][]`): Current board state

**Returns:** `{player1: number, player2: number}` - Score object

## React Components

### OthelloGame
Main game component that manages overall game state.

**Props:** None

**State:**
- `board`: Current board state
- `currentPlayer`: Current player (1 or 2)
- `gameOver`: Whether game has ended
- `scores`: Current player scores

### Board
Renders the game board and handles tile interactions.

**Props:**
- `board` (`number[][]`): Board state to render
- `onTileClick` (`function`): Callback for tile clicks

### Tile
Individual game piece component.

**Props:**
- `value` (`number`): Tile state (0=empty, 1=player1, 2=player2)
- `onClick` (`function`): Click handler
- `isValidMove` (`boolean`): Whether this tile represents a valid move

## Sound Effects API

### SoundEffects Class

#### `constructor()`
Initializes the audio context and sound generators.

#### `setVolume(volume)`
Sets the master volume for all sound effects.

**Parameters:**
- `volume` (`number`): Volume level (0.0 to 1.0)

#### `getVolume()`
Gets the current master volume.

**Returns:** `number` - Current volume level

#### `playFlipSound()`
Plays the sound for flipping game pieces.

#### `playInvalidMoveSound()`
Plays the sound for invalid moves.

#### `playGameOverSound()`
Plays the game over sound.

## Constants

### Player Constants
- `EMPTY = 0`
- `PLAYER1 = 1`
- `PLAYER2 = 2`

### Board Constants
- `BOARD_SIZE = 8`