import React from 'react';
import {
  SettingsPanel,
  GameReplay,
  GameStatistics,
  GameResultModal,
  GameModeSelector,
  type GameModeConfig,
  Puzzles,
} from '../ui';
import type { BotDifficulty, Move, TileValue } from 'othello-engine';
import { soundEffects } from '../../utils/soundEffects';

export interface GameOverlaysProps {
  // Settings
  settingsOpen: boolean;
  onCloseSettings: () => void;
  aiEnabled: boolean;
  aiDifficulty: BotDifficulty;
  aiPlayer: 'B' | 'W';
  onAiToggle: (enabled: boolean) => void;
  onAiDifficultyChange: (difficulty: BotDifficulty) => void;
  onAiPlayerChange: (player: 'B' | 'W') => void;
  spectatorMode: boolean;
  onSpectatorToggle: (enabled: boolean) => void;
  timeControlEnabled: boolean;
  selectedTimePreset: string;
  onTimeControlToggle: (enabled: boolean) => void;
  onTimePresetChange: (presetId: string) => void;
  onMuteTimeSoundsToggle: (muted: boolean) => void;
  customInitialMinutes: number;
  customIncrementSeconds: number;
  onCustomTimeChange: (initialMinutes: number, incrementSeconds: number) => void;
  soundVolume: number;
  onSoundVolumeChange: (volume: number) => void;
  hintsPerGame: number;
  onHintsPerGameChange: (count: number) => void;
  boardTheme: string;
  onThemeChange: (themeId: string) => void;

  // Stats
  statsOpen: boolean;
  onCloseStats: () => void;
  currentGameMoves: Move[];
  onOpenCurrentReplay: () => void;
  onReplayGame: (moves: Array<{ player: 'B' | 'W'; coordinate: [number, number] }>) => void;

  // Puzzles
  puzzlesOpen: boolean;
  onClosePuzzles: () => void;

  // Replay
  replayOpen: boolean;
  historyReplayMoves: Move[] | null;
  onReplayMoveChange: (idx: number, board: TileValue[][]) => void;
  onCloseReplay: () => void;

  // Result
  resultModalOpen: boolean;
  gameWinner: 'B' | 'W' | null;
  blackScore: number;
  whiteScore: number;
  endedByTimeout: boolean;
  onPlayAgain: () => void;
  onResultReplay: () => void;
  onCloseResult: () => void;

  // Mode selector
  modeSelectorOpen: boolean;
  onModeStart: (config: GameModeConfig) => void;
  onCloseModeSelector: () => void;
}

/**
 * Overlay chrome: settings, stats, puzzles, replay, result, mode picker.
 * Keeps OthelloGame focused on board + session wiring.
 */
export const GameOverlays: React.FC<GameOverlaysProps> = ({
  settingsOpen,
  onCloseSettings,
  aiEnabled,
  aiDifficulty,
  aiPlayer,
  onAiToggle,
  onAiDifficultyChange,
  onAiPlayerChange,
  spectatorMode,
  onSpectatorToggle,
  timeControlEnabled,
  selectedTimePreset,
  onTimeControlToggle,
  onTimePresetChange,
  onMuteTimeSoundsToggle,
  customInitialMinutes,
  customIncrementSeconds,
  onCustomTimeChange,
  soundVolume,
  onSoundVolumeChange,
  hintsPerGame,
  onHintsPerGameChange,
  boardTheme,
  onThemeChange,
  statsOpen,
  onCloseStats,
  currentGameMoves,
  onOpenCurrentReplay,
  onReplayGame,
  puzzlesOpen,
  onClosePuzzles,
  replayOpen,
  historyReplayMoves,
  onReplayMoveChange,
  onCloseReplay,
  resultModalOpen,
  gameWinner,
  blackScore,
  whiteScore,
  endedByTimeout,
  onPlayAgain,
  onResultReplay,
  onCloseResult,
  modeSelectorOpen,
  onModeStart,
  onCloseModeSelector,
}) => (
  <>
    <SettingsPanel
      isOpen={settingsOpen}
      onClose={onCloseSettings}
      aiEnabled={aiEnabled}
      aiDifficulty={aiDifficulty}
      aiPlayer={aiPlayer}
      onAiToggle={onAiToggle}
      onAiDifficultyChange={onAiDifficultyChange}
      onAiPlayerChange={onAiPlayerChange}
      spectatorMode={spectatorMode}
      onSpectatorToggle={onSpectatorToggle}
      timeControlEnabled={timeControlEnabled}
      selectedTimePreset={selectedTimePreset}
      onTimeControlToggle={onTimeControlToggle}
      onTimePresetChange={onTimePresetChange}
      muteTimeSounds={soundEffects.getMuteTimeSounds()}
      onMuteTimeSoundsToggle={onMuteTimeSoundsToggle}
      customInitialMinutes={customInitialMinutes}
      customIncrementSeconds={customIncrementSeconds}
      onCustomTimeChange={onCustomTimeChange}
      soundVolume={soundVolume}
      onSoundVolumeChange={onSoundVolumeChange}
      hintsPerGame={hintsPerGame}
      onHintsPerGameChange={onHintsPerGameChange}
      boardTheme={boardTheme}
      onThemeChange={onThemeChange}
    />

    <GameStatistics
      isVisible={statsOpen}
      onClose={onCloseStats}
      currentGameMoves={currentGameMoves}
      onOpenCurrentReplay={onOpenCurrentReplay}
      onReplayGame={onReplayGame}
    />

    <Puzzles isVisible={puzzlesOpen} onClose={onClosePuzzles} />

    {replayOpen && (currentGameMoves.length > 0 || historyReplayMoves) && (
      <GameReplay
        moves={historyReplayMoves || currentGameMoves}
        isVisible={replayOpen}
        onMoveChange={onReplayMoveChange}
        onClose={onCloseReplay}
      />
    )}

    <GameResultModal
      isOpen={resultModalOpen}
      winner={gameWinner}
      blackScore={blackScore}
      whiteScore={whiteScore}
      endedByTimeout={endedByTimeout}
      onPlayAgain={onPlayAgain}
      onReplay={onResultReplay}
      onClose={onCloseResult}
    />

    <GameModeSelector
      isOpen={modeSelectorOpen}
      onStart={onModeStart}
      onClose={onCloseModeSelector}
      currentConfig={{
        mode: spectatorMode ? 'spectator' : aiEnabled ? 'ai' : 'human',
        aiDifficulty,
        aiPlaysAs: aiPlayer,
      }}
    />
  </>
);
