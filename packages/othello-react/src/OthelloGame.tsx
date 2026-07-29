import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { LandingHero } from './components/landing/LandingHero';
import { PlayArea } from './components/game/PlayArea';
import { GameOverlays } from './components/game/GameOverlays';
import { LoadingScreen, ScreenReaderAnnouncer, type GameModeConfig } from './components/ui';
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
import { applyTheme, getSavedThemeId } from './config/themes';
import { persistCompletedGame } from './utils/gameStatistics';
import { buildGameOverMessage, buildMoveAnnouncement } from './utils/moveAnnouncements';
import { useGameEngine, useAIPlayer, useTimeControl, useGameShortcuts, useHints } from './hooks';
import {
  OthelloGameEngine,
  type BotDifficulty,
  type Move,
  type TileValue,
  B,
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
import { BlogSection } from './components/layout/BlogSection';
import { blogPosts, type BlogPost } from './config/blogPosts';

/**
 * Functional shell: gameplay hooks + thin chrome orchestration.
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

  const {
    hintsPerGame,
    hintsRemaining,
    hintsEnabled,
    hintMove,
    setHintMove,
    resetHintsForNewGame,
    requestHint,
    setHintsPerGame: setHintsPerGameSetting,
  } = useHints();
  const blogMessageTimeout = useRef<number | null>(null);
  const engineRef = useRef<OthelloGameEngine | null>(null);
  const aiRef = useRef<{ checkAndMakeAIMove: () => void; cancelPendingAIMove: () => void } | null>(
    null
  );

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

      const state = engine.getState();
      const announcement = buildMoveAnnouncement(move, {
        passedOpponent,
        currentPlayer: state.currentPlayer,
        score: state.score,
      });
      if (announcement.timedMessage) {
        showTimedMessage(announcement.timedMessage, announcement.timedMessageMs);
      }
      setSrAnnouncement(announcement.srAnnouncement);
    },
    onInvalidMove: (error) => {
      if (hasSoundEffects()) soundEffects.playInvalidMove();
      showTimedMessage(error, 2000);
    },
    onGameOver: (winner, isTimeout) => {
      const engine = engineRef.current;
      if (!engine) return;

      clearSavedTimeState();
      const state = engine.getState();
      persistCompletedGame({
        winner,
        isTimeout,
        moveTimestamps: statsRef.current.moveTimestamps,
        gameStartTime: statsRef.current.gameStartTime,
        aiEnabled: statsRef.current.aiEnabled,
        aiDifficulty: statsRef.current.aiDifficulty,
        aiPlayer: statsRef.current.aiPlayer,
        spectatorMode: statsRef.current.spectatorMode,
        timeControlEnabled: statsRef.current.timeControlEnabled,
        finalScore: state.score,
        moveHistory: state.moveHistory.map((m) => ({
          player: m.player,
          coordinate: m.coordinate as [number, number],
        })),
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
    resetHintsForNewGame();
    setResultModalOpen(false);
    setGameWinner(null);
    setEndedByTimeout(false);
    setHistoryReplayMoves(null);
    window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
  }, [game, time, ai, resetHintsForNewGame]);

  const scrollToGame = useCallback(() => {
    document.getElementById('play-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleHeroPlayClick = useCallback(() => {
    handleRestart();
    scrollToGame();
  }, [handleRestart, scrollToGame]);

  const handleUndo = useCallback(() => {
    if (game.undo()) {
      setMessage(null);
      window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
    }
  }, [game, ai]);

  const handleRedo = useCallback(() => {
    if (game.redo()) {
      const state = game.engine.getState();
      setMessage(state.isGameOver ? buildGameOverMessage(state.winner) : null);
      window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
    }
  }, [game, ai]);

  const handleOpenSettings = useCallback(() => {
    if (game.engine.hasTimeControl() && !game.gameOver) game.pauseTime();
    ai.cancelPendingAIMove();
    setSettingsOpen(true);
  }, [game, ai]);

  const handleCloseSettings = useCallback(() => {
    if (game.engine.hasTimeControl() && !game.gameOver) game.resumeTime();
    setSettingsOpen(false);
    if (!game.gameOver) window.setTimeout(() => ai.checkAndMakeAIMove(), 300);
  }, [game, ai]);

  const handleModeStart = useCallback(
    (config: GameModeConfig) => {
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
    },
    [ai, handleRestart]
  );

  const closeTopOverlay = useCallback(() => {
    if (settingsOpen) setSettingsOpen(false);
    else if (statsOpen) setStatsOpen(false);
    else if (puzzlesOpen) setPuzzlesOpen(false);
    else if (replayOpen) {
      setReplayOpen(false);
      setReplayBoard(null);
      setHistoryReplayMoves(null);
    } else if (modeSelectorOpen) setModeSelectorOpen(false);
    else if (resultModalOpen) setResultModalOpen(false);
  }, [settingsOpen, statsOpen, puzzlesOpen, replayOpen, modeSelectorOpen, resultModalOpen]);

  const shortcutHandlers = useMemo(
    () => ({
      onNewGame: () => setModeSelectorOpen(true),
      onOpenSettings: handleOpenSettings,
      onUndo: handleUndo,
      onRedo: handleRedo,
      onShowHelp: () =>
        showTimedMessage('⌨️ Shortcuts: N=New, S=Settings, Z=Undo, Y=Redo, Esc=Close', 4000),
      onEscape: closeTopOverlay,
    }),
    [handleOpenSettings, handleUndo, handleRedo, showTimedMessage, closeTopOverlay]
  );

  useGameShortcuts(shortcutHandlers);

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

  const handleGraphMoveClick = (moveNumber: number) => {
    const undoCount = game.moveHistory.length - moveNumber;
    if (undoCount <= 0) return;
    for (let i = 0; i < undoCount; i++) {
      if (!game.undo()) break;
    }
    setMessage(null);
  };

  const engineState = game.engine.getState();
  const currentPlayer = engineState.currentPlayer === B ? 'black' : 'white';
  const blackScore = engineState.score.black;
  const whiteScore = engineState.score.white;
  const annotatedBoard = game.engine.getAnnotatedBoard();
  const displayBoard = replayBoard ? { ...annotatedBoard, tiles: replayBoard } : annotatedBoard;

  return (
    <div className="OthelloGame page-shell">
      <LoadingScreen isLoading={isLoading} />
      <ScreenReaderAnnouncer message={srAnnouncement} />

      {!isLoading && (
        <div className="content-layer">
          <Navbar onPlayClick={handleHeroPlayClick} onStatsClick={() => setStatsOpen(true)} />

          <LandingHero onPlay={handleHeroPlayClick} onJumpToBoard={scrollToGame} />

          <PlayArea
            onReset={handleRestart}
            displayBoard={displayBoard}
            analysisBoard={annotatedBoard}
            onPlayerTurn={game.makeMove}
            lastMove={game.lastMove}
            gameOver={game.gameOver}
            hintMove={hintMove}
            hintsEnabled={hintsEnabled}
            onHintMove={setHintMove}
            currentPlayer={currentPlayer}
            blackScore={blackScore}
            whiteScore={whiteScore}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={game.canUndo()}
            canRedo={game.canRedo()}
            moves={game.moveHistory}
            message={message}
            timeRemaining={time.timeRemaining}
            onTimeOut={() => {
              if (!game.gameOver) game.engine.checkTimeout();
            }}
            onHintRequest={() => requestHint(game.gameOver)}
            hintsRemaining={hintsRemaining}
            aiThinking={ai.thinkingState.isThinking}
            aiThinkingDepth={ai.thinkingState.depth}
            aiThinkingNodes={ai.thinkingState.nodesSearched}
            evaluationHistory={game.evaluationHistory}
            currentMove={game.moveHistory.length}
            onGraphMoveClick={handleGraphMoveClick}
            graphVisible={graphVisible}
            onToggleGraph={() => setGraphVisible((v) => !v)}
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

          <div className="below-fold">
            <BlogSection posts={blogPosts} onRead={handleBlogOpen} />
          </div>

          <GameOverlays
            settingsOpen={settingsOpen}
            onCloseSettings={handleCloseSettings}
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
            onHintsPerGameChange={setHintsPerGameSetting}
            boardTheme={boardTheme}
            onThemeChange={(themeId) => {
              applyTheme(themeId);
              setBoardTheme(themeId);
            }}
            statsOpen={statsOpen}
            onCloseStats={() => setStatsOpen(false)}
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
            puzzlesOpen={puzzlesOpen}
            onClosePuzzles={() => setPuzzlesOpen(false)}
            replayOpen={replayOpen}
            historyReplayMoves={historyReplayMoves}
            onReplayMoveChange={(_idx, board) => setReplayBoard(board)}
            onCloseReplay={() => {
              setReplayOpen(false);
              setReplayBoard(null);
              setHistoryReplayMoves(null);
            }}
            resultModalOpen={resultModalOpen}
            gameWinner={gameWinner}
            blackScore={blackScore}
            whiteScore={whiteScore}
            endedByTimeout={endedByTimeout}
            onPlayAgain={handleRestart}
            onResultReplay={() => {
              setResultModalOpen(false);
              setReplayOpen(true);
            }}
            onCloseResult={() => setResultModalOpen(false)}
            modeSelectorOpen={modeSelectorOpen}
            onModeStart={handleModeStart}
            onCloseModeSelector={() => setModeSelectorOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default OthelloGame;
