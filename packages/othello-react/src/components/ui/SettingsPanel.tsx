import React, { useState } from 'react';
import { features, toggleFeature, type FeatureFlags } from '../../config/features';
import { soundEffects } from '../../utils/soundEffects';
import '../../styles/game.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SettingsPanel Component
 * 
 * Allows users to toggle feature flags at runtime
 * Useful for testing and user preferences
 * 
 * @param isOpen - Whether the panel is visible
 * @param onClose - Callback to close the panel
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
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
          <button className="close-button" onClick={onClose} aria-label="Close settings">✕</button>
        </div>
        
        <div className="settings-content">
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
  );
};
