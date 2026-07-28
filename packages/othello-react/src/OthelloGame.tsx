import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import Board from './components/layout/Board';
import { LandingHero } from './components/landing/LandingHero';
import { GameActionBar } from './components/game/GameActionBar';
import {
  LoadingScreen,
  SettingsPanel,
  GameReplay,
  PositionAnalysis,
  GameStatistics,
  GameResultModal,
  ErrorBoundary,
  ScreenReaderAnnouncer,
  GameModeSelector,
  type GameModeConfig,
  EvaluationBar,
  Puzzles,
} from './components/ui';
import { hasLoadingScreen, hasSoundEffects } from './config/features';
import { soundEffects } from './utils/soundEffects';
import { getPresetById } from './config/timePresets';
import {
  getMuteTimeSounds,
  getSoundVolume,
  setSoundVolume,
  clearSavedTimeState,
  getSelectedTimePreset,
} from './utils/timePreferences';
import { getHintsPerGame, setHintsPerGame } from './utils/hintPreferences';
import { applyTheme, getSavedThemeId } from './config/themes';
import { saveGameRecord } from './utils/gameStatistics';
import { useGameEngine, useAIPlayer, useTimeControl } from './hooks';
import {
  OthelloGameEngine,
  type BotDifficulty,
  type Coordinate,
  type Move,
  type TileValue,
  B,
  W,
} from 'othello-engine';

import './styles/variables.css';
import './styles/utilities.css';
import './styles/layout.css';
import './styles/animations.css';
import './styles/navbar.css';
import './styles/board.css';
import './styles/sidebar.css';
import './styles/ui.css';
import './styles/landing.css';
import EvaluationGraph from './components/ui/EvaluationGraph';
import { BlogSection } from './components/layout/BlogSection';
import { blogPosts, type BlogPost } from './config/blogPosts';

/**
 * Functional shell: gameplay hooks + chrome orchestration.
 * window.engine is exposed by useGameEngine for 42 School console testing.
 */
function OthelloGame() {
  const [message, setMessage] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(hasLoadingScreen);
  const [soundVolume, setSoundVolumeState] = useState(() => {
    const saved = getSoundVolume();
    soundEffects.setVolume(saved);
    return saved;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [replayOpen, setReplayOpen] = useState(false);
  const [replayBoard, setReplayBoard] = useState<TileValue[][] | null>(null);
  const [historyReplayMoves, setHistoryReplayMoves] = useState<Move[] | null>(null);
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [hintMove, setHintMove] = useState<Coordinate | null>(null);
  const [hintsPerGame, setHintsPerGameState] = useState(getHintsPerGame);
  const [hintsRemaining, setHintsRemaining] = useState(() => {
    const count = getHintsPerGame();
    return count === 0 ? 999 : count;
  });
  const [statsOpen, setStatsOpen] = useState(false);
  const [puzzlesOpen, setPuzzlesOpen] = useState(false);
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [gameWinner, setGameWinner] = useState<'B' | 'W' | null>(null);
  const [endedByTimeout, setEndedByTimeout] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(() => Date.now());
  const [moveTimestamps, setMoveTimestamps] = useState<number[]>([]);
  const [graphVisible, setGraphVisible] = useState(true);
  const [boardTheme, setBoardTheme] = useState(getSavedThemeId);

  const blogMessageTimeout = useRef<number | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const engineRef = useRef<OthelloGameEngine | null>(null);
  const aiRef = useRef<{ checkAndMakeAIMove: () => void; cancelPendingAIMove: () => void } | null>(
    null
  );

  // Stable refs for engine callbacks (avoid closing over hook return before assignment)
  const statsRef = useRef({
    moveTimestamps,
    gameStartTime,
    aiEnabled: false,
    aiDifficulty: 'medium' as BotDifficulty,
    aiPlayer: 'W' as 'B' | 'W',
    spectatorMode: false,
    timeControlEnabled: false,
    selectedTimePreset: getSelectedTimePreset(),
  });

  const showTimedMessage = useCallback((text: string, ms = 2000) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), ms);
  }, []);

  const saveGameStatistics = useCallback(
    (
      winner: 'B' | 'W' | null,
      isTimeout: boolean,
      opts: {
        engine: OthelloGameEngine;
        aiEnabled: boolean;
        aiDifficulty: BotDifficulty;
        aiPlayer: 'B' | 'W';
        spectatorMode: boolean;
        timeControlEnabled: boolean;
        moveTimestamps: number[];
        gameStartTime: number;
      }
    ) => {
      const {
        engine,
        aiEnabled,
        aiDifficulty,
        aiPlayer,
        spectatorMode,
        timeControlEnabled,
        moveTimestamps: stamps,
        gameStartTime: start,
      } = opts;
      const state = engine.getState();

      let avgMoveTime = 0;
      if (stamps.length > 1) {
        let totalTime = 0;
        for (let i = 1; i < stamps.length; i++) {
          const prevTime = stamps[i - 1];
          const currTime = stamps[i];
          if (prevTime !== undefined && currTime !== undefined) {
            totalTime += currTime - prevTime;
          }
        }
        avgMoveTime = totalTime / (stamps.length - 1);
      }

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
        gameDuration: Date.now() - start,
        timeControlEnabled,
        endedByTimeout: isTimeout,
        moves: state.moveHistory.map((move) => ({
          player: move.player,
          coordinate: move.coordinate as [number, number],
        })),
      });
    },
    []
  );

  const game = useGameEngine({
    onMove: (move, passedOpponent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const now = Date.now();
      setMoveTimestamps((prev) => {
        const next = [...prev, now];
        statsRef.current.moveTimestamps = next;
        return next;
      });

      if (hasSoundEffects()) {
        soundEffects.playFlip();
        if (statsRef.current.timeControlEnabled) {
          const preset = getPresetById(statsRef.current.selectedTimePreset);
          if (preset && preset.config.increment > 0) {
            window.setTimeout(() => soundEffects.playTimeIncrement(), 150);
          }
        }
      }

      const [col, row] = move.coordinate;
      const colLabel = String.fromCharCode(97 + col);
      const rowLabel = 8 - row;
      const playerName = move.player === 'B' ? 'Black' : 'White';
      const state = engine.getState();

      if (passedOpponent) {
        const opponentName = state.currentPlayer === 'B' ? 'White' : 'Black';
        showTimedMessage(`${opponentName} has no valid moves and must pass!`, 2500);
        setSrAnnouncement(
          `${playerName} played ${colLabel}${rowLabel}. ${opponentName} must pass. Score: Black ${state.score.black}, White ${state.score.white}.`
        );
      } else {
        const nextPlayer = state.currentPlayer === 'B' ? 'Black' : 'White';
        setSrAnnouncement(
          `${playerName} played ${colLabel}${rowLabel}. ${nextPlayer}'s turn. Score: Black ${state.score.black}, White ${state.score.white}.`
        );
      }
    },
    onInvalidMove: (error) => {
      if (hasSoundEffects()) soundEffects.playInvalidMove();
      showTimedMessage(error, 2000);
    },
    onGameOver: (winner, isTimeout) => {
      const engine = engineRef.current;
      if (!engine) return;

      clearSavedTimeState();
      saveGameStatistics(winner, isTimeout, {
        engine,
        aiEnabled: statsRef.current.aiEnabled,
        aiDifficulty: statsRef.current.aiDifficulty,
        aiPlayer: statsRef.current.aiPlayer,
        spectatorMode: statsRef.current.spectatorMode,
        timeControlEnabled: statsRef.current.timeControlEnabled,
        moveTimestamps: statsRef.current.moveTimestamps,
        gameStartTime: statsRef.current.gameStartTime,
      });
      if (hasSoundEffects()) {
        if (isTimeout) soundEffects.playTimeout();
        else soundEffects.playGameOver();
      }
      setResultModalOpen(true);
      setGameWinner(winner);
      setEndedByTimeout(isTimeout);
      setMessage(null);
    },
    onStateChange: () => {
      const engine = engineRef.current;
      if (!engine) return;
      const state = engine.getState();
      if (!state.isGameOver && state.validMoves.length === 0) {
        const nextPlayerName = state.currentPlayer === B ? 'Black' : 'White';
        showTimedMessage(`No valid moves. ${nextPlayerName}'s turn!`, 2000);
      }
      aiRef.current?.checkAndMakeAIMove();
    },
  });

  engineRef.current = game.engine;

  const time = useTimeControl({
    engine: game.engine,
    gameOver: game.gameOver,
    onTimeWarning: () => {
      if (hasSoundEffects()) soundEffects.playTimeWarning();
    },
  });

  const ai = useAIPlayer({
    engine: game.engine,
    gameOver: game.gameOver,
  });

  aiRef.current = {
    checkAndMakeAIMove: ai.checkAndMakeAIMove,
    cancelPendingAIMove: ai.cancelPendingAIMove,
  };

  // Keep statsRef in sync for engine callbacks / game-over persistence
  useEffect(() => {
    statsRef.current = {
      moveTimestamps,
      gameStartTime,
      aiEnabled: ai.aiEnabled,
      aiDifficulty: ai.aiDifficulty,
      aiPlayer: ai.aiPlayer,
      spectatorMode: ai.spectatorMode,
      timeControlEnabled: time.timeControlEnabled,
      selectedTimePreset: time.selectedTimePreset,
    };
  }, [
    moveTimestamps,
    gameStartTime,
    ai.aiEnabled,
    ai.aiDifficulty,
    ai.aiPlayer,
    ai.spectatorMode,
    time.timeControlEnabled,
    time.selectedTimePreset,
  ]);

  // Theme, loading, sounds, mute restore
  useEffect(() => {
    applyTheme(boardTheme);
    soundEffects.setMuteTimeSounds(getMuteTimeSounds());
    soundEffects.setEnabled(hasSoundEffects());

    const initSound = () => {
      soundEffects.resume();
      document.removeEventListener('click', initSound);
    };
    document.addEventListener('click', initSound, { once: true });

    if (hasLoadingScreen()) {
      const t = window.setTimeout(() => setIsLoading(false), 1500);
      return () => {
        clearTimeout(t);
        document.removeEventListener('click', initSound);
      };
    }
    setIsLoading(false);
    return () => document.removeEventListener('click', initSound);
  }, [boardTheme]);

  const handleRestart = useCallback(() => {
    clearSavedTimeState();
    game.reset();
    time.resetTimeWarnings();
    setMessage(null);
    setGameStartTime(Date.now());
    setMoveTimestamps([]);
    setReplayOpen(false);
    setReplayBoard(null);
    setHintMove(null);
    setHintsEnabled(false);
    setHintsRemaining(hintsPerGame === 0 ? 999 : hintsPerGame);
    setResultModalOpen(false);
    setGameWinner(null);
    setEndedByTimeout(false);
    setHistoryReplayMoves(null);
    window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
  }, [game, time, ai, hintsPerGame]);

  const scrollToGame = useCallback(() => {
    document.getElementById('play-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleHeroPlayClick = useCallback(() => {
    handleRestart();
    scrollToGame();
  }, [handleRestart, scrollToGame]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      if (event.key === 'Escape') {
        if (settingsOpen) setSettingsOpen(false);
        else if (statsOpen) setStatsOpen(false);
        else if (puzzlesOpen) setPuzzlesOpen(false);
        else if (replayOpen) {
          setReplayOpen(false);
          setReplayBoard(null);
          setHistoryReplayMoves(null);
        } else if (modeSelectorOpen) setModeSelectorOpen(false);
        else if (resultModalOpen) setResultModalOpen(false);
        return;
      }

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        setModeSelectorOpen(true);
        return;
      }
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        if (game.engine.hasTimeControl() && !game.gameOver) game.pauseTime();
        ai.cancelPendingAIMove();
        setSettingsOpen(true);
        return;
      }
      if ((event.key === 'z' || event.key === 'Z') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        if (game.undo()) {
          setMessage(null);
          window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
        }
        return;
      }
      if ((event.key === 'y' || event.key === 'Y') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        if (game.redo()) {
          setMessage(null);
          window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
        }
        return;
      }
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        showTimedMessage('⌨️ Shortcuts: N=New, S=Settings, Z=Undo, Y=Redo, Esc=Close', 4000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    settingsOpen,
    statsOpen,
    puzzlesOpen,
    replayOpen,
    modeSelectorOpen,
    resultModalOpen,
    game,
    ai,
    showTimedMessage,
  ]);

  useEffect(() => {
    return () => {
      if (blogMessageTimeout.current !== null) clearTimeout(blogMessageTimeout.current);
    };
  }, []);

  const handleBlogOpen = (_post: BlogPost) => {
    if (blogMessageTimeout.current) clearTimeout(blogMessageTimeout.current);
    setMessage('📝 Blog posts coming soon! Stay tuned for strategy guides and updates.');
    blogMessageTimeout.current = window.setTimeout(() => setMessage(null), 4000);
  };

  const handleUndo = () => {
    if (game.undo()) {
      setMessage(null);
      window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
    }
  };

  const handleRedo = () => {
    if (game.redo()) {
      const state = game.engine.getState();
      setMessage(
        state.isGameOver
          ? state.winner === B
            ? 'Game Over! Black wins!'
            : state.winner === W
              ? 'Game Over! White wins!'
              : "Game Over! It's a tie!"
          : null
      );
      window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
    }
  };

  const handleOpenSettings = () => {
    if (game.engine.hasTimeControl() && !game.gameOver) game.pauseTime();
    ai.cancelPendingAIMove();
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    if (game.engine.hasTimeControl() && !game.gameOver) game.resumeTime();
    setSettingsOpen(false);
    if (!game.gameOver) window.setTimeout(() => ai.checkAndMakeAIMove(), 300);
  };

  const handleModeStart = (config: GameModeConfig) => {
    setModeSelectorOpen(false);
    if (config.mode === 'ai') {
      ai.setSpectatorMode(false);
      ai.setAIDifficulty(config.aiDifficulty);
      ai.setAIPlayer(config.aiPlaysAs);
      ai.setAIEnabled(true);
    } else if (config.mode === 'spectator') {
      ai.setAIEnabled(false);
      ai.setAIDifficulty(config.aiDifficulty);
      ai.setSpectatorMode(true);
    } else {
      ai.setAIEnabled(false);
      ai.setSpectatorMode(false);
    }
    handleRestart();
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) handleUndo();
      else handleRedo();
    }
  };

  const handleGraphMoveClick = (moveNumber: number) => {
    const undoCount = game.moveHistory.length - moveNumber;
    if (undoCount <= 0) return;
    for (let i = 0; i < undoCount; i++) {
      if (!game.undo()) break;
    }
    setMessage(null);
  };

  const handleHintRequest = () => {
    if (hintsRemaining <= 0 || game.gameOver) return;
    setHintsEnabled(true);
    setHintsRemaining((prev) => prev - 1);
    window.setTimeout(() => {
      setHintsEnabled(false);
      setHintMove(null);
    }, 5000);
  };

  const engineState = game.engine.getState();
  const currentPlayer = engineState.currentPlayer === B ? 'black' : 'white';
  const blackScore = engineState.score.black;
  const whiteScore = engineState.score.white;
  const displayBoard = replayBoard
    ? { ...game.engine.getAnnotatedBoard(), tiles: replayBoard }
    : game.engine.getAnnotatedBoard();

  return (
    <div className="OthelloGame page-shell">
      <LoadingScreen isLoading={isLoading} />
      <ScreenReaderAnnouncer message={srAnnouncement} />

      {!isLoading && (
        <div className="content-layer">
          <Navbar onPlayClick={handleHeroPlayClick} onStatsClick={() => setStatsOpen(true)} />

          <LandingHero onPlay={handleHeroPlayClick} onJumpToBoard={scrollToGame} />

          <div className="game-wrapper" id="play-area">
            <ErrorBoundary onReset={handleRestart}>
              <div
                className="game-container"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="board-area">
                  <EvaluationBar
                    evaluation={blackScore - whiteScore}
                    currentPlayer={currentPlayer}
                  />
                  <Board
                    board={displayBoard}
                    onPlayerTurn={game.makeMove}
                    lastMove={game.lastMove}
                    gameOver={game.gameOver}
                    hintMove={hintMove}
                  />
                </div>

                <div className="sidebar-area">
                  {hintsEnabled && !game.gameOver && (
                    <PositionAnalysis
                      board={game.engine.getAnnotatedBoard()}
                      enabled={hintsEnabled}
                      onHintMove={setHintMove}
                      showPanel={true}
                    />
                  )}

                  <Sidebar
                    currentPlayer={currentPlayer}
                    blackScore={blackScore}
                    whiteScore={whiteScore}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={game.canUndo()}
                    canRedo={game.canRedo()}
                    moves={game.moveHistory}
                    message={message}
                    gameOver={game.gameOver}
                    timeRemaining={time.timeRemaining}
                    onTimeOut={() => {
                      if (!game.gameOver) game.engine.checkTimeout();
                    }}
                    onHintRequest={handleHintRequest}
                    hintsRemaining={hintsRemaining}
                    hintsEnabled={hintsEnabled}
                    aiThinking={ai.thinkingState.isThinking}
                    aiThinkingDepth={ai.thinkingState.depth}
                    aiThinkingNodes={ai.thinkingState.nodesSearched}
                  />

                  <EvaluationGraph
                    history={game.evaluationHistory}
                    currentMove={game.moveHistory.length}
                    onMoveClick={handleGraphMoveClick}
                    isVisible={graphVisible}
                    onToggle={() => setGraphVisible((v) => !v)}
                  />
                </div>
              </div>

              <GameActionBar
                onNewGame={() => {
                  if (game.engine.hasTimeControl() && !game.gameOver) game.pauseTime();
                  setModeSelectorOpen(true);
                }}
                onSettings={handleOpenSettings}
                onStats={() => setStatsOpen(true)}
                onReplay={() =>
                  setReplayOpen((open) => {
                    if (open) {
                      setReplayBoard(null);
                      setHistoryReplayMoves(null);
                      setResultModalOpen(false);
                    }
                    return !open;
                  })
                }
                onPuzzles={() => setPuzzlesOpen((v) => !v)}
              />
            </ErrorBoundary>
          </div>

          <div className="below-fold">
            <BlogSection posts={blogPosts} onRead={handleBlogOpen} />
          </div>

          <SettingsPanel
            isOpen={settingsOpen}
            onClose={handleCloseSettings}
            aiEnabled={ai.aiEnabled}
            aiDifficulty={ai.aiDifficulty}
            aiPlayer={ai.aiPlayer}
            onAiToggle={ai.setAIEnabled}
            onAiDifficultyChange={ai.setAIDifficulty}
            onAiPlayerChange={ai.setAIPlayer}
            spectatorMode={ai.spectatorMode}
            onSpectatorToggle={ai.setSpectatorMode}
            timeControlEnabled={time.timeControlEnabled}
            selectedTimePreset={time.selectedTimePreset}
            onTimeControlToggle={time.setTimeControlEnabled}
            onTimePresetChange={time.setTimePreset}
            muteTimeSounds={soundEffects.getMuteTimeSounds()}
            onMuteTimeSoundsToggle={(muted) => {
              time.setMuteTimeSounds(muted);
              soundEffects.setMuteTimeSounds(muted);
            }}
            customInitialMinutes={time.customInitialMinutes}
            customIncrementSeconds={time.customIncrementSeconds}
            onCustomTimeChange={time.setCustomTime}
            soundVolume={soundVolume}
            onSoundVolumeChange={(volume) => {
              soundEffects.setVolume(volume);
              setSoundVolume(volume);
              setSoundVolumeState(volume);
            }}
            hintsPerGame={hintsPerGame}
            onHintsPerGameChange={(count) => {
              setHintsPerGame(count);
              setHintsPerGameState(count);
              setHintsRemaining(count === 0 ? 999 : count);
            }}
            boardTheme={boardTheme}
            onThemeChange={(themeId) => {
              applyTheme(themeId);
              setBoardTheme(themeId);
            }}
          />

          <GameStatistics
            isVisible={statsOpen}
            onClose={() => setStatsOpen(false)}
            currentGameMoves={game.moveHistory}
            onOpenCurrentReplay={() => setReplayOpen(true)}
            onReplayGame={(moves) => {
              setHistoryReplayMoves(
                moves.map((m) => ({
                  player: m.player,
                  coordinate: m.coordinate,
                  timestamp: 0,
                  scoreAfter: { black: 0, white: 0 },
                }))
              );
              setReplayOpen(true);
              setReplayBoard(null);
              setStatsOpen(false);
            }}
          />

          <Puzzles isVisible={puzzlesOpen} onClose={() => setPuzzlesOpen(false)} />

          {replayOpen && (game.moveHistory.length > 0 || historyReplayMoves) && (
            <GameReplay
              moves={historyReplayMoves || game.moveHistory}
              isVisible={replayOpen}
              onMoveChange={(_idx, board) => setReplayBoard(board)}
              onClose={() => {
                setReplayOpen(false);
                setReplayBoard(null);
                setHistoryReplayMoves(null);
              }}
            />
          )}

          <GameResultModal
            isOpen={resultModalOpen}
            winner={gameWinner}
            blackScore={blackScore}
            whiteScore={whiteScore}
            endedByTimeout={endedByTimeout}
            onPlayAgain={handleRestart}
            onReplay={() => {
              setResultModalOpen(false);
              setReplayOpen(true);
            }}
            onClose={() => setResultModalOpen(false)}
          />

          <GameModeSelector
            isOpen={modeSelectorOpen}
            onStart={handleModeStart}
            onClose={() => setModeSelectorOpen(false)}
            currentConfig={{
              mode: ai.spectatorMode ? 'spectator' : ai.aiEnabled ? 'ai' : 'human',
              aiDifficulty: ai.aiDifficulty,
              aiPlaysAs: ai.aiPlayer,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default OthelloGame;
