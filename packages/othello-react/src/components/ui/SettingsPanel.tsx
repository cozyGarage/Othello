import React, { useState } from 'react';
import { features, toggleFeature, type FeatureFlags } from '../../config/features';
import { soundEffects } from '../../utils/soundEffects';
import { TIME_PRESETS } from '../../config/timePresets';
import type { BotDifficulty } from 'othello-engine';
import '../../styles/ui.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aiEnabled: boolean;
  aiDifficulty: BotDifficulty;
  aiPlayer: 'W' | 'B';
  onAiToggle: (enabled: boolean) => void;
  onAiDifficultyChange: (difficulty: BotDifficulty) => void;
  onAiPlayerChange: (player: 'W' | 'B') => void;
  // Spectator mode - watch AI vs AI
  spectatorMode?: boolean;
  onSpectatorToggle?: (enabled: boolean) => void;
  // Time control
  timeControlEnabled?: boolean;
  selectedTimePreset?: string;
  onTimeControlToggle?: (enabled: boolean) => void;
  onTimePresetChange?: (presetId: string) => void;
  muteTimeSounds?: boolean;
  onMuteTimeSoundsToggle?: (muted: boolean) => void;
  // Custom time control
  customInitialMinutes?: number;
  customIncrementSeconds?: number;
  onCustomTimeChange?: (initialMinutes: number, incrementSeconds: number) => void;
  // Sound volume
  soundVolume?: number;
  onSoundVolumeChange?: (volume: number) => void;
  // Hints per game
  hintsPerGame?: number;
  onHintsPerGameChange?: (count: number) => void;
}

/**
 * SettingsPanel Component
 *
 * Allows users to toggle feature flags at runtime
 * Useful for testing and user preferences
 *
 * @param isOpen - Whether the panel is visible
 * @param onClose - Callback to close the panel
 * @param aiEnabled - Whether AI opponent is enabled
 * @param aiDifficulty - Current AI difficulty level
 * @param aiPlayer - Which player the AI controls
 * @param onAiToggle - Callback when AI is toggled
 * @param onAiDifficultyChange - Callback when difficulty changes
 * @param onAiPlayerChange - Callback when AI player changes
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  aiEnabled,
  aiDifficulty,
  aiPlayer,
  onAiToggle,
  onAiDifficultyChange,
  onAiPlayerChange,
  timeControlEnabled = false,
  selectedTimePreset = 'blitz',
  onTimeControlToggle,
  onTimePresetChange,
  muteTimeSounds = false,
  onMuteTimeSoundsToggle,
  spectatorMode = false,
  onSpectatorToggle,
  customInitialMinutes = 5,
  customIncrementSeconds = 0,
  onCustomTimeChange,
  soundVolume = 100,
  onSoundVolumeChange,
  hintsPerGame = 3,
  onHintsPerGameChange,
}) => {
  const [localFeatures, setLocalFeatures] = useState<FeatureFlags>({ ...features });
  const [localCustomMinutes, setLocalCustomMinutes] = useState(customInitialMinutes);
  const [localCustomIncrement, setLocalCustomIncrement] = useState(customIncrementSeconds);

  if (!isOpen) return null;

  const handleToggle = (feature: keyof FeatureFlags) => {
    const newValue = !localFeatures[feature];
    toggleFeature(feature, newValue);
    setLocalFeatures({ ...features });

    // Sync sound effects manager with feature flag
    if (feature === 'soundEffects') {
      soundEffects.setEnabled(newValue);
    }

    // Apply theme change to document when darkMode is toggled
    if (feature === 'darkMode') {
      if (newValue) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  };

  const featureLabels: Record<keyof FeatureFlags, string> = {
    animations: 'Enable Animations',
    glassGlare: 'Glass Glare Effect',
    soundEffects: 'Sound Effects',
    moveHistory: 'Move History',
    scoreAnimations: 'Score Animations',
    loadingScreen: 'Loading Screen',
    debug: 'Debug Mode',
    darkMode: 'Dark Mode',
  };

  const featureDescriptions: Record<keyof FeatureFlags, string> = {
    animations: 'Smooth piece flip animations',
    glassGlare: 'Glass glare on last moved tile',
    soundEffects: 'Audio feedback for moves',
    moveHistory: 'Track and display move history',
    scoreAnimations: 'Animated score changes',
    loadingScreen: 'Show loading screen on startup',
    debug: 'Enable console logging',
    darkMode: 'Toggle between dark and light theme',
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div
        className="settings-panel shadow border custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <div className="settings-header-content">
            <h2>⚙️ Settings</h2>
            <p className="settings-note">💡 Changes take effect immediately</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* AI Settings Section */}
          <div className="settings-section">
            <h3 className="section-title">🤖 AI Opponent</h3>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => onAiToggle(e.target.checked)}
                  disabled={spectatorMode}
                />
                <span className="setting-name">Play vs AI</span>
              </label>
              <p className="setting-description">Enable computer opponent</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={spectatorMode}
                  onChange={(e) => onSpectatorToggle?.(e.target.checked)}
                />
                <span className="setting-name">🎬 Watch AI vs AI</span>
              </label>
              <p className="setting-description">
                Spectator mode - watch two AIs play against each other
              </p>
            </div>

            {aiEnabled && (
              <>
                <div className="setting-item">
                  <label className="setting-label">
                    <span className="setting-name">AI Difficulty</span>
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => onAiDifficultyChange(e.target.value as BotDifficulty)}
                    className="difficulty-select"
                  >
                    <option value="easy">Easy (Random)</option>
                    <option value="medium">Medium (Greedy)</option>
                    <option value="hard">Hard (Minimax)</option>
                  </select>
                  <p className="setting-description">
                    {aiDifficulty === 'easy' && 'AI makes random valid moves'}
                    {aiDifficulty === 'medium' && 'AI maximizes immediate score'}
                    {aiDifficulty === 'hard' && 'AI uses strategic lookahead'}
                  </p>
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <span className="setting-name">AI Plays As</span>
                  </label>
                  <select
                    value={aiPlayer}
                    onChange={(e) => onAiPlayerChange(e.target.value as 'W' | 'B')}
                    className="difficulty-select"
                  >
                    <option value="B">Black (goes first)</option>
                    <option value="W">White (goes second)</option>
                  </select>
                  <p className="setting-description">Choose which color the AI controls</p>
                </div>
              </>
            )}
          </div>

          {/* Time Control Settings Section */}
          <div className="settings-section">
            <h3 className="section-title">⏱️ Time Control</h3>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={timeControlEnabled}
                  onChange={(e) => onTimeControlToggle?.(e.target.checked)}
                />
                <span className="setting-name">Enable Time Control</span>
              </label>
              <p className="setting-description">Chess-style time limits for competitive play</p>
            </div>

            {timeControlEnabled && (
              <div className="setting-item">
                <label className="setting-label">
                  <span className="setting-name">Time Preset</span>
                </label>
                <select
                  value={selectedTimePreset}
                  onChange={(e) => onTimePresetChange?.(e.target.value)}
                  className="difficulty-select"
                >
                  {TIME_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} - {preset.description}
                    </option>
                  ))}
                </select>
                <p className="setting-description">
                  Choose from bullet, blitz, rapid, classical, or custom time controls
                </p>
              </div>
            )}

            {/* Custom Time Control Inputs */}
            {timeControlEnabled && selectedTimePreset === 'custom' && (
              <div className="setting-item">
                <label className="setting-label">
                  <span className="setting-name">⚙️ Custom Time Settings</span>
                </label>
                <div className="custom-time-inputs">
                  <div className="custom-time-row">
                    <label className="custom-time-label">
                      Initial Time (minutes):
                      <input
                        type="number"
                        min="0.5"
                        max="60"
                        step="0.5"
                        value={localCustomMinutes}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 5;
                          setLocalCustomMinutes(value);
                        }}
                        onBlur={() => {
                          const clamped = Math.max(0.5, Math.min(60, localCustomMinutes));
                          setLocalCustomMinutes(clamped);
                          onCustomTimeChange?.(clamped, localCustomIncrement);
                        }}
                        className="custom-time-input"
                      />
                    </label>
                  </div>
                  <div className="custom-time-row">
                    <label className="custom-time-label">
                      Increment (seconds):
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value={localCustomIncrement}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10) || 0;
                          setLocalCustomIncrement(value);
                        }}
                        onBlur={() => {
                          const clamped = Math.max(0, Math.min(30, localCustomIncrement));
                          setLocalCustomIncrement(clamped);
                          onCustomTimeChange?.(localCustomMinutes, clamped);
                        }}
                        className="custom-time-input"
                      />
                    </label>
                  </div>
                </div>
                <p className="setting-description">
                  Set your own time: {localCustomMinutes} min + {localCustomIncrement} sec/move
                </p>
              </div>
            )}

            {timeControlEnabled && (
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={muteTimeSounds}
                    onChange={(e) => onMuteTimeSoundsToggle?.(e.target.checked)}
                  />
                  <span className="setting-name">Mute Time Sounds</span>
                </label>
                <p className="setting-description">
                  Disable time warning, increment, and timeout sounds (game sounds still play)
                </p>
              </div>
            )}
          </div>

          {/* Sound Settings Section */}
          <div className="settings-section">
            <h3 className="section-title">🔊 Sound</h3>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-name">Volume</span>
                <span className="volume-value">{soundVolume}%</span>
              </label>
              <div className="volume-slider-container">
                <span className="volume-icon">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={soundVolume}
                  onChange={(e) => onSoundVolumeChange?.(parseInt(e.target.value, 10))}
                  className="volume-slider"
                  style={{ '--volume-percent': `${soundVolume}%` } as React.CSSProperties}
                />
                <span className="volume-icon">🔊</span>
              </div>
              <p className="setting-description">Adjust the volume for all game sounds</p>
            </div>
          </div>

          {/* Hints Settings Section */}
          <div className="settings-section">
            <h3 className="section-title">💡 Hints</h3>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-name">Hints Per Game</span>
                <span className="volume-value">{hintsPerGame}</span>
              </label>
              <div className="volume-slider-container">
                <span className="volume-icon">0</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={hintsPerGame}
                  onChange={(e) => onHintsPerGameChange?.(parseInt(e.target.value, 10))}
                  className="volume-slider"
                  style={{ '--volume-percent': `${hintsPerGame * 10}%` } as React.CSSProperties}
                />
                <span className="volume-icon">10</span>
              </div>
              <p className="setting-description">
                Number of AI hints available per game (0 = unlimited)
              </p>
            </div>
          </div>

          {/* Feature Flags Section */}
          <div className="settings-section">
            <h3 className="section-title">🎨 Features</h3>

            {(Object.keys(featureLabels) as Array<keyof FeatureFlags>).map((feature) => (
              <div key={feature} className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={localFeatures[feature]}
                    onChange={() => handleToggle(feature)}
                  />
                  <span className="setting-name">{featureLabels[feature]}</span>
                </label>
                <p className="setting-description">{featureDescriptions[feature]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
