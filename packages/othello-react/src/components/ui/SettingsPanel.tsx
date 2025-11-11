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
  timeControlEnabled?: boolean;
  selectedTimePreset?: string;
  onTimeControlToggle?: (enabled: boolean) => void;
  onTimePresetChange?: (presetId: string) => void;
  muteTimeSounds?: boolean;
  onMuteTimeSoundsToggle?: (muted: boolean) => void;
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
}) => {
  const [localFeatures, setLocalFeatures] = useState<FeatureFlags>({ ...features });

  if (!isOpen) return null;

  const handleToggle = (feature: keyof FeatureFlags) => {
    const newValue = !localFeatures[feature];
    toggleFeature(feature, newValue);
    setLocalFeatures({ ...features });

    // Sync sound effects manager with feature flag
    if (feature === 'soundEffects') {
      soundEffects.setEnabled(newValue);
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
  };

  const featureDescriptions: Record<keyof FeatureFlags, string> = {
    animations: 'Smooth piece flip animations',
    glassGlare: 'Glass glare on last moved tile',
    soundEffects: 'Audio feedback for moves',
    moveHistory: 'Track and display move history',
    scoreAnimations: 'Animated score changes',
    loadingScreen: 'Show loading screen on startup',
    debug: 'Enable console logging',
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel shadow border" onClick={(e) => e.stopPropagation()}>
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
                />
                <span className="setting-name">Play vs AI</span>
              </label>
              <p className="setting-description">Enable computer opponent</p>
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
                  Choose from bullet, blitz, rapid, or classical time controls
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
