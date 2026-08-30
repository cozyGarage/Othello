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
import {
  useGameEngine,
  useAIPlayer,
  useTimeControl,
  useGameShortcuts,
  useHints,
  useGameOverlays,
} from './hooks';
import { OthelloGameEngine, type BotDifficulty, B } from 'othello-engine';

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

  const overlays = useGameOverlays();
  const {
    resetOverlaysForNewGame,
    setSettingsOpen,
    setModeSelectorOpen,
    setStatsOpen,
    setPuzzlesOpen,
    setReplayOpen,
    setResultModalOpen,
    setReplayBoard,
    closeTopOverlay,
    closeReplay,
    toggleReplay,
    startHistoryReplay,
  } = overlays;
  const overlaysRef = useRef(overlays);
  overlaysRef.current = overlays;

  const blogMessageTimeout = useRef<number | null>(null);
  const timedMessageTimeout = useRef<number | null>(null);
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
    if (timedMessageTimeout.current !== null) {
      clearTimeout(timedMessageTimeout.current);
      timedMessageTimeout.current = null;
    }
    setMessage(text);
    timedMessageTimeout.current = window.setTimeout(() => {
      timedMessageTimeout.current = null;
      setMessage(null);
    }, ms);
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
      overlaysRef.current.openResult(winner, isTimeout);
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
    onTimeout: () => {
      // Engine already ends the game via checkTimeout(); keep AI from moving.
      aiRef.current?.cancelPendingAIMove();
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
    resetHintsForNewGame();
    resetOverlaysForNewGame();
    window.setTimeout(() => ai.checkAndMakeAIMove(), 500);
  }, [game, time, ai, resetHintsForNewGame, resetOverlaysForNewGame]);

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
    if (game.engine.hasTimeControl() && !game.gameOver) time.pauseTime();
    ai.cancelPendingAIMove();
    setSettingsOpen(true);
  }, [game, time, ai, setSettingsOpen]);

  const handleCloseSettings = useCallback(() => {
    if (game.engine.hasTimeControl() && !game.gameOver) time.resumeTime();
    setSettingsOpen(false);
    if (!game.gameOver) window.setTimeout(() => ai.checkAndMakeAIMove(), 300);
  }, [game, time, ai, setSettingsOpen]);

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
    [ai, handleRestart, setModeSelectorOpen]
  );

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
    [
      handleOpenSettings,
      handleUndo,
      handleRedo,
      showTimedMessage,
      closeTopOverlay,
      setModeSelectorOpen,
    ]
  );

  useGameShortcuts(shortcutHandlers);

  useEffect(() => {
    return () => {
      if (blogMessageTimeout.current !== null) clearTimeout(blogMessageTimeout.current);
      if (timedMessageTimeout.current !== null) clearTimeout(timedMessageTimeout.current);
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
  const displayBoard = overlays.replayBoard
    ? { ...annotatedBoard, tiles: overlays.replayBoard }
    : annotatedBoard;

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
              if (game.engine.hasTimeControl() && !game.gameOver) time.pauseTime();
              setModeSelectorOpen(true);
            }}
            onSettings={handleOpenSettings}
            onStats={() => setStatsOpen(true)}
            onReplay={toggleReplay}
            onPuzzles={() => setPuzzlesOpen((v) => !v)}
          />

          <div className="below-fold">
            <BlogSection posts={blogPosts} onRead={handleBlogOpen} />
          </div>

          <GameOverlays
            settingsOpen={overlays.settingsOpen}
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
            statsOpen={overlays.statsOpen}
            onCloseStats={() => setStatsOpen(false)}
            currentGameMoves={game.moveHistory}
            onOpenCurrentReplay={() => setReplayOpen(true)}
            onReplayGame={startHistoryReplay}
            puzzlesOpen={overlays.puzzlesOpen}
            onClosePuzzles={() => setPuzzlesOpen(false)}
            replayOpen={overlays.replayOpen}
            historyReplayMoves={overlays.historyReplayMoves}
            onReplayMoveChange={(_idx, board) => setReplayBoard(board)}
            onCloseReplay={closeReplay}
            resultModalOpen={overlays.resultModalOpen}
            gameWinner={overlays.gameWinner}
            blackScore={blackScore}
            whiteScore={whiteScore}
            endedByTimeout={overlays.endedByTimeout}
            onPlayAgain={handleRestart}
            onResultReplay={() => {
              setResultModalOpen(false);
              setReplayOpen(true);
            }}
            onCloseResult={() => setResultModalOpen(false)}
            modeSelectorOpen={overlays.modeSelectorOpen}
            onModeStart={handleModeStart}
            onCloseModeSelector={() => setModeSelectorOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default OthelloGame;
