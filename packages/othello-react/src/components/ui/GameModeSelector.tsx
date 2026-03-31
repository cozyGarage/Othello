import React, { useState } from 'react';
import type { BotDifficulty } from 'othello-engine';

export type GameMode = 'human' | 'ai' | 'spectator';

export interface GameModeConfig {
  mode: GameMode;
  aiDifficulty: BotDifficulty;
  aiPlaysAs: 'W' | 'B';
}

interface GameModeSelectorProps {
  isOpen: boolean;
  onStart: (config: GameModeConfig) => void;
  onClose: () => void;
  currentConfig: GameModeConfig;
}

const DIFFICULTY_LABELS: Record<BotDifficulty, { label: string; desc: string }> = {
  easy: { label: 'Easy', desc: 'Random moves — great for learning' },
  medium: { label: 'Medium', desc: 'Greedy play — picks the most flips' },
  hard: { label: 'Hard', desc: 'Minimax search — thinks ahead' },
};

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  isOpen,
  onStart,
  onClose,
  currentConfig,
}) => {
  const [mode, setMode] = useState<GameMode>(currentConfig.mode);
  const [difficulty, setDifficulty] = useState<BotDifficulty>(currentConfig.aiDifficulty);
  const [aiPlaysAs, setAiPlaysAs] = useState<'W' | 'B'>(currentConfig.aiPlaysAs);

  if (!isOpen) return null;

  const handleStart = () => {
    onStart({ mode, aiDifficulty: difficulty, aiPlaysAs });
  };

  return (
    <div
      className="mode-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose game mode"
    >
      <div className="mode-panel" onClick={(e) => e.stopPropagation()}>
        <div className="mode-header">
          <h2>New Game</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mode-cards">
          {/* vs Human */}
          <button
            className={`mode-card ${mode === 'human' ? 'selected' : ''}`}
            onClick={() => setMode('human')}
          >
            <span className="mode-icon">🤝</span>
            <span className="mode-title">vs Human</span>
            <span className="mode-desc">Pass and play locally</span>
          </button>

          {/* vs Computer */}
          <button
            className={`mode-card ${mode === 'ai' ? 'selected' : ''}`}
            onClick={() => setMode('ai')}
          >
            <span className="mode-icon">🤖</span>
            <span className="mode-title">vs Computer</span>
            <span className="mode-desc">Play against the AI</span>
          </button>

          {/* Watch AI vs AI */}
          <button
            className={`mode-card ${mode === 'spectator' ? 'selected' : ''}`}
            onClick={() => setMode('spectator')}
          >
            <span className="mode-icon">👁</span>
            <span className="mode-title">Watch AI vs AI</span>
            <span className="mode-desc">Spectate two bots</span>
          </button>
        </div>

        {/* AI options — shown for ai and spectator modes */}
        {(mode === 'ai' || mode === 'spectator') && (
          <div className="mode-options">
            <div className="mode-option-group">
              <label className="mode-option-label">Difficulty</label>
              <div className="difficulty-chips">
                {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((d) => (
                  <button
                    key={d}
                    className={`difficulty-chip ${difficulty === d ? 'selected' : ''}`}
                    onClick={() => setDifficulty(d)}
                  >
                    <span className="chip-label">{DIFFICULTY_LABELS[d].label}</span>
                    <span className="chip-desc">{DIFFICULTY_LABELS[d].desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'ai' && (
              <div className="mode-option-group">
                <label className="mode-option-label">You play as</label>
                <div className="color-chips">
                  <button
                    className={`color-chip black ${aiPlaysAs === 'W' ? 'selected' : ''}`}
                    onClick={() => setAiPlaysAs('W')}
                    aria-label="Play as Black (AI plays White)"
                  >
                    <span className="piece-dot black" />
                    Black
                  </button>
                  <button
                    className={`color-chip white ${aiPlaysAs === 'B' ? 'selected' : ''}`}
                    onClick={() => setAiPlaysAs('B')}
                    aria-label="Play as White (AI plays Black)"
                  >
                    <span className="piece-dot white" />
                    White
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button className="mode-start-btn" onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  );
};
