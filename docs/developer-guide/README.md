# Developer Guide

This section contains technical documentation for developers working on the Othello game project.

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Bun runtime (for testing and development)
- Git

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Run tests: `npm test`

## Project Structure

```
src/
├── game-logic.js          # Core game engine and rules
├── OthelloGame.js         # Main React component
├── Board.js              # Game board component
├── Row.js                # Board row component
├── Tile.js               # Individual tile component
├── soundEffects.js       # Audio management
└── *.css                 # Component styles
```

## Development Workflow

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky pre-commit hooks
- Commitlint for conventional commits

### Testing
- Bun test runner
- Comprehensive test coverage (>85%)
- Unit tests for components and logic
- Integration tests for game flows

### Building
- `npm run build` - Production build
- `npm run test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report

## Architecture

### Game Engine
The core game logic is implemented in `game-logic.js` with the following key components:
- Board state management
- Move validation
- AI opponent logic
- Game state transitions

### React Components
- `OthelloGame`: Main game container and state management
- `Board`: Renders the 8x8 game board
- `Row`: Renders a single row of tiles
- `Tile`: Individual game piece with click handling

### Audio System
Sound effects are managed through `soundEffects.js` using the Web Audio API for:
- Move sounds
- Invalid move feedback
- Game over notifications
- Volume control

## API Reference

See the [API documentation](../api/) for detailed component and function references.