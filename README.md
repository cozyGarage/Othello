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
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Maintained](https://img.shields.io/badge/Maintained-Yes-brightgreen?style=flat-square)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [How to Play](#-how-to-play)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🎯 About

Othello (also known as Reversi) is a classic strategy board game for two players. This implementation brings the timeless game to your browser with a clean, intuitive interface and smooth gameplay. Challenge yourself against another player and master the art of strategic disc flipping!

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

- `bun run dev` - Runs the app in development mode with hot reload
- `bun test` - Runs all tests once
- `bun test --watch` - Runs tests in watch mode
- `bun run build` - Builds the app for production
- `bun run preview` - Preview the production build locally
- `bun run deploy` - Deploys to GitHub Pages

### Running Tests

Run tests once:
```bash
bun test
```

Run tests in watch mode:
```bash
bun test --watch
```

Tests are written using Bun's built-in test runner with a Jest-compatible API.

### Test Coverage

The project includes comprehensive tests:
- **Basic tests** (`game-logic.test.js`) - Core game mechanics
- **Advanced tests** (`game-logic.advanced.test.js`) - Complex scenarios including:
  - Valid move detection
  - Game over conditions
  - Winner determination
  - Multi-directional piece flipping
  - Edge cases and corner scenarios

### Building for Production

```bash
bun run build
```

Creates an optimized production build in the `dist` folder with:
- Minified JavaScript and CSS
- Source maps for debugging
- Optimized assets

Preview the production build:
```bash
bun run preview
```

## 🚀 Deployment

The app is automatically deployed to GitHub Pages. To deploy manually:

```bash
bun run deploy
```

The live version is available at: [https://cozygarage.github.io/Othello/](https://cozygarage.github.io/Othello/)

## 📁 Project Structure

```
Othello/
├── public/                    # Static assets
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── Board.js              # Game board component
│   ├── Row.js                # Board row component
│   ├── Tile.js               # Individual tile component
│   ├── OthelloGame.js        # Main game component
│   ├── game-logic.js         # Core game logic
│   ├── game-logic.test.js    # Basic tests
│   └── game-logic.advanced.test.js  # Advanced tests
├── index.html                 # Vite entry point
├── vite.config.js            # Vite configuration
├── bunfig.toml               # Bun configuration
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- Bundled with [Vite](https://vitejs.dev/) - Next generation frontend tooling
- Deployed on [GitHub Pages](https://pages.github.com/)

---

<div align="center">

**Made with ❤️ by cozyGarage**

© 2025 cozyGarage. All rights reserved.

For detailed Create React App documentation, see [CRA_README.md](./CRA_README.md)

</div>
