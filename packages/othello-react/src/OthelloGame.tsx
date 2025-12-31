import { Component } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import Board from './components/layout/Board';
import {
  LoadingScreen,
  SettingsPanel,
  GameReplay,
  PositionAnalysis,
  GameStatistics,
} from './components/ui';
import { hasLoadingScreen, hasSoundEffects } from './config/features';
import { soundEffects } from './utils/soundEffects';
import { getDefaultPreset, getPresetById } from './config/timePresets';
// Phase 3: Import localStorage helpers
import {
  getTimeControlEnabled,
  setTimeControlEnabled,
  getSelectedTimePreset,
  setSelectedTimePreset,
  getMuteTimeSounds,
  setMuteTimeSounds,
  getSoundVolume,
  setSoundVolume,
  getCustomTimeConfig,
  setCustomTimeConfig,
  getSavedTimeState,
  saveTimeState,
  clearSavedTimeState,
} from './utils/timePreferences';
// Phase 4: Import game statistics
import { saveGameRecord } from './utils/gameStatistics';
import {
  OthelloGameEngine,
  OthelloBot,
  type Board as BoardType,
  type Coordinate,
  type GameEvent,
  type Move,
  type MoveEventData,
  type InvalidMoveEventData,
  type GameOverEventData,
  type StateChangeEventData,
  type BotDifficulty,
  type PlayerTime,
  type TimeControlConfig,
  type TileValue,
  B,
  W,
} from 'othello-engine';

// Import new modular CSS
import './styles/variables.css';
import './styles/layout.css';
import './styles/animations.css';
import './styles/navbar.css';
import './styles/board.css';
import './styles/sidebar.css';
import './styles/ui.css';

/**
 * Extend the Window interface to expose the game engine for browser console testing.
 * This is required by the 42 School evaluation criteria for state serialization testing.
 * @see docs/42_SCHOOL_EVALUATION.md - Section 1.4 "State Serialization"
 */
declare global {
  interface Window {
    engine?: OthelloGameEngine;
  }
}

interface OthelloGameState {
  board: BoardType;
  message: string | null;
  gameOver: boolean;
  lastMove: Coordinate | null;
  isLoading: boolean;
  moveHistory: Move[];
  settingsOpen: boolean;
  soundVolume: number;
  aiEnabled: boolean;
  aiDifficulty: BotDifficulty;
  aiPlayer: 'W' | 'B';
  // Spectator mode - both players are AI
  spectatorMode: boolean;
  // Time control
  timeControlEnabled: boolean;
  selectedTimePreset: string;
  timeRemaining: PlayerTime | null;
  // Phase 3: Time warning tracking (prevent repeated warnings)
  blackTimeWarningPlayed: boolean;
  whiteTimeWarningPlayed: boolean;
  // Phase 3.5: Custom time control
  customInitialMinutes: number;
  customIncrementSeconds: number;
  // Phase 4: Level 2 Bonuses
  replayOpen: boolean;
  replayBoard: TileValue[][] | null;
  hintsEnabled: boolean;
  hintMove: Coordinate | null;
  statsOpen: boolean;
  // Track game start time for statistics
  gameStartTime: number;
  moveTimestamps: number[];
}

/**
 * OthelloGame - Clean Chess.com inspired layout
 *
 * Structure:
 * - Navbar (top)
 * - Game Container (grid: board + sidebar)
 *   - Board Area (left, 80vh)
 *   - Sidebar (right, fixed width)
 */
class OthelloGame extends Component<{}, OthelloGameState> {
  private engine: OthelloGameEngine;
  private bot: OthelloBot | null = null;
  // Second bot for spectator mode (AI vs AI)
  private spectatorBotBlack: OthelloBot | null = null;
  private spectatorBotWhite: OthelloBot | null = null;
  private botMoveTimeout: number | null = null;
  private timeUpdateInterval: number | null = null;

  constructor(props: {}) {
    super(props);

    // Phase 3: Load time control preferences from localStorage
    const savedTimeControlEnabled = getTimeControlEnabled();
    const savedTimePreset = getSelectedTimePreset();

    // Phase 3.5: Load sound volume preference
    const savedVolume = getSoundVolume();
    soundEffects.setVolume(savedVolume);

    // Phase 3.5: Load custom time config
    const savedCustomConfig = getCustomTimeConfig();
    const customInitialMinutes = savedCustomConfig?.initialMinutes ?? 5;
    const customIncrementSeconds = savedCustomConfig?.incrementSeconds ?? 0;

    // Determine the time config to use
    let timeConfig: TimeControlConfig | undefined;
    if (savedTimeControlEnabled) {
      if (savedTimePreset === 'custom') {
        timeConfig = {
          initialTime: customInitialMinutes * 60 * 1000,
          increment: customIncrementSeconds * 1000,
        };
      } else {
        const preset = getPresetById(savedTimePreset) || getDefaultPreset();
        timeConfig = preset.config;
      }
    }

    // Initialize the game engine (with time control if enabled in preferences)
    this.engine = new OthelloGameEngine(undefined, undefined, undefined, timeConfig);

    // Phase 3.5: Check for saved time state to restore
    const savedTimeState = getSavedTimeState();
    let restoredTimeRemaining: PlayerTime | null = null;

    if (savedTimeControlEnabled && savedTimeState && savedTimeState.presetId === savedTimePreset) {
      // Restore the saved time state
      // Use type assertion since the method was added to the engine
      const engineWithRestore = this.engine as OthelloGameEngine & {
        restoreTimeState?: (blackTime: number, whiteTime: number, currentPlayer: 'B' | 'W') => void;
      };
      engineWithRestore.restoreTimeState?.(
        savedTimeState.blackTime,
        savedTimeState.whiteTime,
        savedTimeState.currentPlayer
      );
      restoredTimeRemaining = {
        black: savedTimeState.blackTime,
        white: savedTimeState.whiteTime,
      };
    }

    const initialState = this.engine.getState();
    this.state = {
      board: initialState.board,
      message: null,
      gameOver: false,
      lastMove: null,
      isLoading: hasLoadingScreen(),
      moveHistory: [],
      settingsOpen: false,
      soundVolume: savedVolume,
      aiEnabled: false,
      aiDifficulty: 'medium',
      aiPlayer: 'W',
      // Spectator mode - both players are AI
      spectatorMode: false,
      // Phase 3: Initialize from localStorage (user's saved preferences)
      timeControlEnabled: savedTimeControlEnabled,
      selectedTimePreset: savedTimePreset,
      timeRemaining: restoredTimeRemaining,
      // Phase 3: Initialize time warning flags
      blackTimeWarningPlayed: false,
      whiteTimeWarningPlayed: false,
      // Phase 3.5: Custom time control
      customInitialMinutes,
      customIncrementSeconds,
      // Phase 4: Level 2 Bonuses
      replayOpen: false,
      replayBoard: null,
      hintsEnabled: false,
      hintMove: null,
      statsOpen: false,
      gameStartTime: Date.now(),
      moveTimestamps: [],
    };

    // Phase 3: Load and apply mute time sounds preference
    const savedMuteTimeSounds = getMuteTimeSounds();
    soundEffects.setMuteTimeSounds(savedMuteTimeSounds);
  }

  componentDidMount(): void {
    // Subscribe to engine events
    this.engine.on('move', this.handleMoveEvent);
    this.engine.on('invalidMove', this.handleInvalidMoveEvent);
    this.engine.on('gameOver', this.handleGameOverEvent);
    this.engine.on('stateChange', this.handleStateChangeEvent);

    // Expose the engine to the global window object for browser console testing
    // This is required by 42 School evaluation for state serialization testing:
    // window.engine.exportState() and window.engine.importState(state)
    window.engine = this.engine;

    // Add keyboard shortcuts for undo/redo
    document.addEventListener('keydown', this.handleKeyDown);

    // Simulate loading for better UX
    if (hasLoadingScreen()) {
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 1500);
    }

    // Initialize sound effects
    const initSound = () => {
      soundEffects.resume();
      document.removeEventListener('click', initSound);
    };
    document.addEventListener('click', initSound, { once: true });

    soundEffects.setEnabled(hasSoundEffects());

    // Phase 3: Start time update interval (updates every 100ms for smooth display)
    // Also checks for low time warnings and plays sound alerts
    this.timeUpdateInterval = window.setInterval(() => {
      if (this.engine.hasTimeControl() && !this.state.gameOver) {
        const timeRemaining = this.engine.getTimeRemaining();
        this.setState({ timeRemaining });

        // Phase 3.5: Save time state periodically for refresh recovery
        const engineState = this.engine.getState();
        if (timeRemaining && !engineState.isGameOver) {
          saveTimeState({
            blackTime: timeRemaining.black,
            whiteTime: timeRemaining.white,
            currentPlayer: engineState.currentPlayer,
            presetId: this.state.selectedTimePreset,
          });
        }

        // Check for low time warning (< 10 seconds = 10000ms)
        // Only play warning sound ONCE per player when they drop below threshold
        const LOW_TIME_THRESHOLD = 10000; // 10 seconds

        if (timeRemaining && hasSoundEffects()) {
          // Check black player time
          if (
            timeRemaining.black < LOW_TIME_THRESHOLD &&
            timeRemaining.black > 0 &&
            !this.state.blackTimeWarningPlayed
          ) {
            soundEffects.playTimeWarning();
            this.setState({ blackTimeWarningPlayed: true });
          }

          // Check white player time
          if (
            timeRemaining.white < LOW_TIME_THRESHOLD &&
            timeRemaining.white > 0 &&
            !this.state.whiteTimeWarningPlayed
          ) {
            soundEffects.playTimeWarning();
            this.setState({ whiteTimeWarningPlayed: true });
          }
        }
      }
    }, 100);
  }

  componentWillUnmount(): void {
    // Clean up event listeners
    this.engine.off('move', this.handleMoveEvent);
    this.engine.off('invalidMove', this.handleInvalidMoveEvent);
    this.engine.off('gameOver', this.handleGameOverEvent);
    this.engine.off('stateChange', this.handleStateChangeEvent);
    document.removeEventListener('keydown', this.handleKeyDown);

    // Clean up window.engine reference
    delete window.engine;

    // Clean up bot timeout
    if (this.botMoveTimeout !== null) {
      clearTimeout(this.botMoveTimeout);
    }

    // Clean up time update interval
    if (this.timeUpdateInterval !== null) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    // Don't handle shortcuts when typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    ) {
      return;
    }

    // Ctrl+Z or Cmd+Z for undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.handleUndo();
      return;
    }

    // Ctrl+Y or Cmd+Shift+Z for redo
    if (
      ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
    ) {
      event.preventDefault();
      this.handleRedo();
      return;
    }

    // N for new game (without modifiers)
    if (event.key === 'n' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.handleRestart();
      return;
    }

    // S for settings (without modifiers)
    if (event.key === 's' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.setState({ settingsOpen: true });
      return;
    }

    // Escape to close settings
    if (event.key === 'Escape') {
      if (this.state.settingsOpen) {
        event.preventDefault();
        this.setState({ settingsOpen: false });
      }
      return;
    }

    // ? or H for help (show keyboard shortcuts)
    if ((event.key === '?' || event.key === 'h') && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.setState({
        message: '⌨️ Shortcuts: N=New, S=Settings, Z=Undo, Y=Redo, Esc=Close',
      });
      setTimeout(() => this.setState({ message: null }), 4000);
      return;
    }
  };

  handleMoveEvent = (event: GameEvent): void => {
    const { move, state } = event.data as MoveEventData;

    // Phase 4: Track move timestamps for statistics
    const now = Date.now();
    const moveTimestamps = [...this.state.moveTimestamps, now];

    // Phase 3: Play move sound and increment sound (if time control active)
    if (hasSoundEffects()) {
      soundEffects.playFlip();

      // Play increment sound if time control is enabled and has increment
      if (this.state.timeControlEnabled) {
        const preset = getPresetById(this.state.selectedTimePreset);
        if (preset && preset.config.increment > 0) {
          // Small delay so increment sound doesn't overlap with flip sound
          setTimeout(() => {
            soundEffects.playTimeIncrement();
          }, 150);
        }
      }
    }

    const moveHistory = this.engine.getMoveHistory();

    // Check if the turn stayed with the same player (opponent had to pass)
    const currentPlayer = state.currentPlayer;
    const previousPlayer = move.player;

    if (currentPlayer === previousPlayer) {
      // Opponent had no valid moves and had to pass
      const opponentName = currentPlayer === 'B' ? 'White' : 'Black';
      this.setState({
        lastMove: move.coordinate,
        moveHistory,
        moveTimestamps,
        message: `${opponentName} has no valid moves and must pass!`,
      });
      setTimeout(() => this.setState({ message: null }), 2500);
    } else {
      this.setState({ lastMove: move.coordinate, moveHistory, moveTimestamps });
    }
  };

  handleInvalidMoveEvent = (event: GameEvent): void => {
    const { error } = event.data as InvalidMoveEventData;

    if (hasSoundEffects()) {
      soundEffects.playInvalidMove();
    }

    this.setState({ message: error });
    setTimeout(() => this.setState({ message: null }), 2000);
  };

  handleGameOverEvent = (event: GameEvent): void => {
    const { winner } = event.data as GameOverEventData;
    let message: string;

    // Phase 3.5: Clear saved time state when game ends
    clearSavedTimeState();

    // Check if game ended due to timeout
    const timeRemaining = this.engine.getTimeRemaining();
    const isTimeout =
      timeRemaining &&
      ((winner === W && timeRemaining.black <= 0) || (winner === B && timeRemaining.white <= 0));

    if (isTimeout) {
      // Game ended due to time running out
      if (winner === B) {
        message = 'Game Over! White ran out of time. Black wins!';
      } else if (winner === W) {
        message = 'Game Over! Black ran out of time. White wins!';
      } else {
        message = "Game Over! It's a tie!";
      }
    } else {
      // Normal game over
      if (winner === B) {
        message = 'Game Over! Black wins!';
      } else if (winner === W) {
        message = 'Game Over! White wins!';
      } else {
        message = "Game Over! It's a tie!";
      }
    }

    // Phase 4: Save game statistics
    this.saveGameStatistics(winner, isTimeout ?? false);

    // Phase 3: Play appropriate sound (timeout alarm or normal game over)
    if (hasSoundEffects()) {
      if (isTimeout) {
        soundEffects.playTimeout(); // Urgent alarm sound for timeout
      } else {
        soundEffects.playGameOver(); // Normal victory fanfare
      }
    }

    this.setState({ gameOver: true, message });
  };

  handleStateChangeEvent = (event: GameEvent): void => {
    const { state } = event.data as StateChangeEventData;
    this.setState({ board: state.board });

    // Check if current player has no valid moves
    if (!state.isGameOver && state.validMoves.length === 0) {
      const nextPlayerName = state.currentPlayer === B ? 'Black' : 'White';
      this.setState({
        message: `No valid moves. ${nextPlayerName}'s turn!`,
      });
      setTimeout(() => this.setState({ message: null }), 2000);
    }

    // Trigger AI move if it's the AI's turn
    this.checkAndMakeAIMove();
  };

  handlePlayerTurn = (coord: Coordinate): void => {
    if (this.state.gameOver) {
      return;
    }
    this.engine.makeMove(coord);
  };

  /**
   * Save game statistics when game ends
   * Calculates average move time and duration, then persists to localStorage
   */
  saveGameStatistics = (winner: 'B' | 'W' | null, endedByTimeout: boolean): void => {
    const { moveTimestamps, gameStartTime, aiEnabled, aiDifficulty, aiPlayer, spectatorMode } =
      this.state;
    const state = this.engine.getState();

    // Calculate average move time
    let avgMoveTime = 0;
    if (moveTimestamps.length > 1) {
      let totalTime = 0;
      for (let i = 1; i < moveTimestamps.length; i++) {
        const prevTime = moveTimestamps[i - 1];
        const currTime = moveTimestamps[i];
        if (prevTime !== undefined && currTime !== undefined) {
          totalTime += currTime - prevTime;
        }
      }
      avgMoveTime = totalTime / (moveTimestamps.length - 1);
    }

    // Calculate game duration
    const gameDuration = Date.now() - gameStartTime;

    // Determine human player (if vs AI)
    let humanPlayer: 'B' | 'W' | null = null;
    if (aiEnabled && !spectatorMode) {
      humanPlayer = aiPlayer === 'B' ? 'W' : 'B';
    }

    saveGameRecord({
      winner,
      humanPlayer,
      aiDifficulty: aiEnabled ? aiDifficulty : null,
      spectatorMode,
      finalScore: state.score,
      totalMoves: state.moveHistory.length,
      avgMoveTime,
      gameDuration,
      timeControlEnabled: this.state.timeControlEnabled,
      endedByTimeout,
    });
  };

  handleRestart = (): void => {
    this.engine.reset();

    // Phase 3.5: Clear saved time state when starting new game
    clearSavedTimeState();

    const initialState = this.engine.getState();
    this.setState({
      board: initialState.board,
      message: null,
      gameOver: false,
      lastMove: null,
      moveHistory: [],
      // Phase 3: Reset time warning flags when starting new game
      blackTimeWarningPlayed: false,
      whiteTimeWarningPlayed: false,
      // Phase 4: Reset game statistics tracking
      gameStartTime: Date.now(),
      moveTimestamps: [],
      replayOpen: false,
      replayBoard: null,
      hintMove: null,
    });

    // Check if AI should make the first move
    setTimeout(() => this.checkAndMakeAIMove(), 500);
  };

  handleUndo = (): void => {
    const success = this.engine.undo();

    if (success) {
      const state = this.engine.getState();
      const lastMoveCoord =
        state.moveHistory.length > 0
          ? (state.moveHistory[state.moveHistory.length - 1]?.coordinate ?? null)
          : null;

      this.setState({
        board: state.board,
        moveHistory: state.moveHistory,
        lastMove: lastMoveCoord,
        gameOver: false,
        message: null,
      });

      // Check if AI should move after undo
      setTimeout(() => this.checkAndMakeAIMove(), 500);
    }
  };

  handleRedo = (): void => {
    const success = this.engine.redo();

    if (success) {
      const state = this.engine.getState();
      const lastMoveCoord =
        state.moveHistory.length > 0
          ? (state.moveHistory[state.moveHistory.length - 1]?.coordinate ?? null)
          : null;

      this.setState({
        board: state.board,
        moveHistory: state.moveHistory,
        lastMove: lastMoveCoord,
        gameOver: state.isGameOver,
        message: state.isGameOver
          ? state.winner === B
            ? 'Game Over! Black wins!'
            : state.winner === W
              ? 'Game Over! White wins!'
              : "Game Over! It's a tie!"
          : null,
      });

      // Check if AI should move after redo
      setTimeout(() => this.checkAndMakeAIMove(), 500);
    }
  };

  handleVolumeChange = (volume: number): void => {
    soundEffects.setVolume(volume);
    setSoundVolume(volume); // Phase 3.5: Save to localStorage
    this.setState({ soundVolume: volume });
  };

  handleAiToggle = (enabled: boolean): void => {
    this.setState({ aiEnabled: enabled });

    if (enabled) {
      // Initialize bot with current settings
      this.bot = new OthelloBot(this.state.aiDifficulty, this.state.aiPlayer);

      // Check if AI should move immediately
      setTimeout(() => this.checkAndMakeAIMove(), 500);
    } else {
      // Clean up bot
      this.bot = null;
      if (this.botMoveTimeout !== null) {
        clearTimeout(this.botMoveTimeout);
        this.botMoveTimeout = null;
      }
    }
  };

  handleAiDifficultyChange = (difficulty: BotDifficulty): void => {
    this.setState({ aiDifficulty: difficulty });

    // Update bot if it exists
    if (this.bot) {
      this.bot.setDifficulty(difficulty);
    }
  };

  handleAiPlayerChange = (player: 'W' | 'B'): void => {
    this.setState({ aiPlayer: player });

    // Update bot if it exists
    if (this.bot) {
      this.bot.setPlayer(player);
    }

    // Check if AI should move immediately
    setTimeout(() => this.checkAndMakeAIMove(), 500);
  };

  handleTimeControlToggle = (enabled: boolean): void => {
    this.setState({ timeControlEnabled: enabled });

    // Phase 3: Save preference to localStorage
    setTimeControlEnabled(enabled);

    // Phase 3.5: Clear saved time state when toggling time control
    clearSavedTimeState();

    if (enabled) {
      // Create new engine with time control
      let config: TimeControlConfig;
      if (this.state.selectedTimePreset === 'custom') {
        config = {
          initialTime: this.state.customInitialMinutes * 60 * 1000,
          increment: this.state.customIncrementSeconds * 1000,
        };
      } else {
        const preset = getPresetById(this.state.selectedTimePreset) || getDefaultPreset();
        config = preset.config;
      }
      this.recreateEngineWithTimeControl(config);
    } else {
      // Create new engine without time control
      this.recreateEngineWithoutTimeControl();
    }
  };

  handleTimePresetChange = (presetId: string): void => {
    this.setState({ selectedTimePreset: presetId });

    // Phase 3: Save preference to localStorage
    setSelectedTimePreset(presetId);

    // Phase 3.5: Clear saved time state when changing preset
    clearSavedTimeState();

    if (this.state.timeControlEnabled) {
      if (presetId === 'custom') {
        // Use custom time config
        const config: TimeControlConfig = {
          initialTime: this.state.customInitialMinutes * 60 * 1000,
          increment: this.state.customIncrementSeconds * 1000,
        };
        this.recreateEngineWithTimeControl(config);
      } else {
        const preset = getPresetById(presetId);
        if (preset) {
          this.recreateEngineWithTimeControl(preset.config);
        }
      }
    }
  };

  handleCustomTimeChange = (initialMinutes: number, incrementSeconds: number): void => {
    this.setState({
      customInitialMinutes: initialMinutes,
      customIncrementSeconds: incrementSeconds,
    });

    // Phase 3.5: Save custom config to localStorage
    setCustomTimeConfig({ initialMinutes, incrementSeconds });

    // Phase 3.5: Clear saved time state when changing custom config
    clearSavedTimeState();

    // If currently using custom preset, update the engine
    if (this.state.timeControlEnabled && this.state.selectedTimePreset === 'custom') {
      const config: TimeControlConfig = {
        initialTime: initialMinutes * 60 * 1000,
        increment: incrementSeconds * 1000,
      };
      this.recreateEngineWithTimeControl(config);
    }
  };

  handleMuteTimeSoundsToggle = (muted: boolean): void => {
    // Phase 3: Save mute preference to localStorage
    setMuteTimeSounds(muted);
    soundEffects.setMuteTimeSounds(muted);
  };

  recreateEngineWithTimeControl = (config: TimeControlConfig): void => {
    // Save current game state
    const currentState = this.engine.exportState();

    // Unsubscribe from old engine
    this.engine.off('move', this.handleMoveEvent);
    this.engine.off('invalidMove', this.handleInvalidMoveEvent);
    this.engine.off('gameOver', this.handleGameOverEvent);
    this.engine.off('stateChange', this.handleStateChangeEvent);

    // Create new engine with time control
    this.engine = new OthelloGameEngine(undefined, undefined, undefined, config);

    // Restore game state (without time control state)
    this.engine.importState(currentState);

    // Subscribe to new engine
    this.engine.on('move', this.handleMoveEvent);
    this.engine.on('invalidMove', this.handleInvalidMoveEvent);
    this.engine.on('gameOver', this.handleGameOverEvent);
    this.engine.on('stateChange', this.handleStateChangeEvent);

    // Update window.engine reference for console testing
    window.engine = this.engine;

    // Update time remaining
    const timeRemaining = this.engine.getTimeRemaining();
    this.setState({ timeRemaining });
  };

  recreateEngineWithoutTimeControl = (): void => {
    // Save current game state
    const currentState = this.engine.exportState();

    // Unsubscribe from old engine
    this.engine.off('move', this.handleMoveEvent);
    this.engine.off('invalidMove', this.handleInvalidMoveEvent);
    this.engine.off('gameOver', this.handleGameOverEvent);
    this.engine.off('stateChange', this.handleStateChangeEvent);

    // Create new engine without time control
    this.engine = new OthelloGameEngine();

    // Restore game state
    this.engine.importState(currentState);

    // Subscribe to new engine
    this.engine.on('move', this.handleMoveEvent);
    this.engine.on('invalidMove', this.handleInvalidMoveEvent);
    this.engine.on('gameOver', this.handleGameOverEvent);
    this.engine.on('stateChange', this.handleStateChangeEvent);

    // Update window.engine reference for console testing
    window.engine = this.engine;

    // Clear time remaining
    this.setState({ timeRemaining: null });
  };

  checkAndMakeAIMove = (): void => {
    const { aiEnabled, aiPlayer, spectatorMode, gameOver } = this.state;

    // Don't make AI move if game is over
    if (gameOver) {
      return;
    }

    const state = this.engine.getState();
    const currentPlayer = state.currentPlayer;

    // Spectator mode: both players are AI
    if (spectatorMode) {
      const bot = currentPlayer === 'B' ? this.spectatorBotBlack : this.spectatorBotWhite;

      if (!bot) {
        return;
      }

      // Add a small delay for better UX
      this.botMoveTimeout = window.setTimeout(() => {
        if (!this.state.spectatorMode || this.state.gameOver) {
          return;
        }

        const currentState = this.engine.getState();
        const currentBot =
          currentState.currentPlayer === 'B' ? this.spectatorBotBlack : this.spectatorBotWhite;

        if (!currentBot) return;

        const move = currentBot.calculateMove(currentState.board);
        if (move) {
          this.engine.makeMove(move);
        }
      }, 800);
      return;
    }

    // Single AI mode
    if (!aiEnabled || !this.bot) {
      return;
    }

    // Only make AI move if it's the AI's turn
    if (currentPlayer !== aiPlayer) {
      return;
    }

    // Add a small delay for better UX
    this.botMoveTimeout = window.setTimeout(() => {
      if (!this.state.aiEnabled || !this.bot) {
        return;
      }

      const currentState = this.engine.getState();
      if (currentState.currentPlayer !== this.state.aiPlayer) {
        return;
      }

      const move = this.bot.calculateMove(currentState.board);
      if (move) {
        this.engine.makeMove(move);
      }
    }, 800);
  };

  handleSpectatorToggle = (enabled: boolean): void => {
    this.setState({ spectatorMode: enabled });

    if (enabled) {
      // Disable regular AI when entering spectator mode
      this.setState({ aiEnabled: false });
      this.bot = null;

      // Initialize bots for both players
      this.spectatorBotBlack = new OthelloBot(this.state.aiDifficulty, 'B');
      this.spectatorBotWhite = new OthelloBot(this.state.aiDifficulty, 'W');

      // Start the AI vs AI game
      setTimeout(() => this.checkAndMakeAIMove(), 500);
    } else {
      // Clean up spectator bots
      this.spectatorBotBlack = null;
      this.spectatorBotWhite = null;

      if (this.botMoveTimeout !== null) {
        clearTimeout(this.botMoveTimeout);
        this.botMoveTimeout = null;
      }
    }
  };

  // Phase 4: Replay handlers
  handleReplayToggle = (): void => {
    this.setState((prev) => ({
      replayOpen: !prev.replayOpen,
      replayBoard: null, // Reset to actual board when closing
    }));
  };

  handleReplayMoveChange = (_moveIndex: number, board: TileValue[][]): void => {
    this.setState({ replayBoard: board });
  };

  // Phase 4: Hints handlers
  handleHintsToggle = (): void => {
    this.setState((prev) => ({
      hintsEnabled: !prev.hintsEnabled,
      hintMove: null,
    }));
  };

  handleHintMoveChange = (move: Coordinate | null): void => {
    this.setState({ hintMove: move });
  };

  // Phase 4: Statistics handlers
  handleStatsToggle = (): void => {
    this.setState((prev) => ({ statsOpen: !prev.statsOpen }));
  };

  render() {
    const state = this.engine.getState();
    const currentPlayer = state.currentPlayer === B ? 'black' : 'white';
    const blackScore = state.score.black;
    const whiteScore = state.score.white;

    // Use replay board if in replay mode, otherwise use actual board
    const displayBoard = this.state.replayBoard
      ? { ...this.engine.getAnnotatedBoard(), tiles: this.state.replayBoard }
      : this.engine.getAnnotatedBoard();

    return (
      <div className="OthelloGame">
        <LoadingScreen isLoading={this.state.isLoading} />

        {!this.state.isLoading && (
          <>
            <Navbar onPlayClick={this.handleRestart} />

            <div className="game-container">
              <div className="board-area">
                <Board
                  board={displayBoard}
                  onPlayerTurn={this.handlePlayerTurn}
                  lastMove={this.state.lastMove}
                  gameOver={this.state.gameOver}
                  hintMove={this.state.hintMove}
                />
              </div>

              <div className="sidebar-area">
                {/* Phase 4: Position Analysis (hints) */}
                {this.state.hintsEnabled && !this.state.gameOver && (
                  <PositionAnalysis
                    board={this.engine.getAnnotatedBoard()}
                    enabled={this.state.hintsEnabled}
                    onHintMove={this.handleHintMoveChange}
                    showPanel={true}
                  />
                )}

                {/* Phase 4: Game Replay (after game over or when toggled) */}
                {this.state.replayOpen && this.state.moveHistory.length > 0 && (
                  <GameReplay
                    moves={this.state.moveHistory}
                    isVisible={this.state.replayOpen}
                    onMoveChange={this.handleReplayMoveChange}
                    onClose={() => this.setState({ replayOpen: false, replayBoard: null })}
                  />
                )}

                <Sidebar
                  currentPlayer={currentPlayer}
                  blackScore={blackScore}
                  whiteScore={whiteScore}
                  onUndo={this.handleUndo}
                  onRedo={this.handleRedo}
                  onNewGame={this.handleRestart}
                  onOpenMenu={() => this.setState({ settingsOpen: true })}
                  canUndo={this.engine.canUndo()}
                  canRedo={this.engine.canRedo()}
                  moves={this.state.moveHistory}
                  message={this.state.message}
                  gameOver={this.state.gameOver}
                  timeRemaining={this.state.timeRemaining}
                  // Phase 4: Level 2 bonus buttons
                  onReplayToggle={this.handleReplayToggle}
                  onHintsToggle={this.handleHintsToggle}
                  onStatsToggle={this.handleStatsToggle}
                  replayEnabled={this.state.replayOpen}
                  hintsEnabled={this.state.hintsEnabled}
                />
              </div>
            </div>

            <SettingsPanel
              isOpen={this.state.settingsOpen}
              onClose={() => this.setState({ settingsOpen: false })}
              aiEnabled={this.state.aiEnabled}
              aiDifficulty={this.state.aiDifficulty}
              aiPlayer={this.state.aiPlayer}
              onAiToggle={this.handleAiToggle}
              onAiDifficultyChange={this.handleAiDifficultyChange}
              onAiPlayerChange={this.handleAiPlayerChange}
              spectatorMode={this.state.spectatorMode}
              onSpectatorToggle={this.handleSpectatorToggle}
              timeControlEnabled={this.state.timeControlEnabled}
              selectedTimePreset={this.state.selectedTimePreset}
              onTimeControlToggle={this.handleTimeControlToggle}
              onTimePresetChange={this.handleTimePresetChange}
              muteTimeSounds={soundEffects.getMuteTimeSounds()}
              onMuteTimeSoundsToggle={this.handleMuteTimeSoundsToggle}
              customInitialMinutes={this.state.customInitialMinutes}
              customIncrementSeconds={this.state.customIncrementSeconds}
              onCustomTimeChange={this.handleCustomTimeChange}
              soundVolume={this.state.soundVolume}
              onSoundVolumeChange={this.handleVolumeChange}
            />

            {/* Phase 4: Game Statistics Modal */}
            <GameStatistics
              isVisible={this.state.statsOpen}
              onClose={() => this.setState({ statsOpen: false })}
            />
          </>
        )}
      </div>
    );
  }
}

export default OthelloGame;
