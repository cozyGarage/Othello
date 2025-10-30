# Othello / Reversi Game

<div align="center">

🎮 **[Play Now](https://cozygarage.github.io/Othello/)** 🎮

*A fully playable implementation of the classic Othello (also known as Reversi) board game built with React*

![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
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

- 🎨 **Clean Interface** - Modern, intuitive design with smooth animations
- 🎯 **Move Validation** - Automatic validation following official Othello rules
- 💡 **Visual Hints** - Animated indicators showing all valid moves
- 🔄 **Auto-Pass** - Automatic turn passing when no valid moves are available
- 🏆 **Winner Detection** - Instant game-over detection with winner announcement
- 📊 **Live Scoring** - Real-time score tracking for both players
- 🔄 **Quick Restart** - One-click game restart functionality
- 📱 **Responsive** - Works seamlessly on desktop and mobile devices

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

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cozyGarage/Othello.git
cd Othello
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💻 Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run deploy` - Deploys to GitHub Pages

### Running Tests

```bash
npm test
```

Tests are written using React Testing Library and Jest.

### Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build` folder.

## 🚀 Deployment

The app is automatically deployed to GitHub Pages. To deploy manually:

```bash
npm run deploy
```

The live version is available at: [https://cozygarage.github.io/Othello/](https://cozygarage.github.io/Othello/)

## 📁 Project Structure

```
Othello/
├── public/           # Static files
├── src/
│   ├── Board.js      # Game board component
│   ├── Row.js        # Board row component
│   ├── Tile.js       # Individual tile component
│   ├── OthelloGame.js # Main game component
│   ├── game-logic.js # Core game logic
│   └── *.test.js     # Test files
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
- Bootstrapped with [Create React App](https://create-react-app.dev/)
- Deployed on [GitHub Pages](https://pages.github.com/)

---

<div align="center">

**Made with ❤️ by cozyGarage**

© 2025 cozyGarage. All rights reserved.

For detailed Create React App documentation, see [CRA_README.md](./CRA_README.md)

</div>
