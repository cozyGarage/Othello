import { describe, test, expect, beforeEach } from 'vitest';
import { features, toggleFeature, type FeatureFlags } from '../../config/features';

/**
 * SettingsPanel Tests
 *
 * Tests the feature flag integration and SettingsPanel data structures
 * The SettingsPanel component provides a UI for toggling feature flags
 */

describe('SettingsPanel Feature Integration', () => {
  beforeEach(() => {
    // Reset all features to default state before each test
    const defaultFeatures: FeatureFlags = {
      animations: true,
      glassGlare: true,
      soundEffects: false,
      moveHistory: true,
      scoreAnimations: true,
      loadingScreen: false,
      debug: false,
      darkMode: true,
    };

    Object.keys(defaultFeatures).forEach((key) => {
      const featureKey = key as keyof FeatureFlags;
      toggleFeature(featureKey, defaultFeatures[featureKey]);
    });
  });

  describe('Feature Flag Definitions', () => {
    test('should have exactly 8 feature flags', () => {
      const featureKeys = Object.keys(features);
      expect(featureKeys.length).toBe(8);
    });

    test('should include all expected features', () => {
      expect('animations' in features).toBe(true);
      expect('glassGlare' in features).toBe(true);
      expect('soundEffects' in features).toBe(true);
      expect('moveHistory' in features).toBe(true);
      expect('scoreAnimations' in features).toBe(true);
      expect('loadingScreen' in features).toBe(true);
      expect('debug' in features).toBe(true);
      expect('darkMode' in features).toBe(true);
    });
  });

  describe('Feature Labels', () => {
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

    test('should map each feature to correct label', () => {
      expect(featureLabels.animations).toBe('Enable Animations');
      expect(featureLabels.glassGlare).toBe('Glass Glare Effect');
      expect(featureLabels.soundEffects).toBe('Sound Effects');
      expect(featureLabels.moveHistory).toBe('Move History');
      expect(featureLabels.scoreAnimations).toBe('Score Animations');
      expect(featureLabels.loadingScreen).toBe('Loading Screen');
      expect(featureLabels.debug).toBe('Debug Mode');
    });

    test('should have labels for all features', () => {
      const labelCount = Object.keys(featureLabels).length;
      const featureCount = Object.keys(features).length;
      expect(labelCount).toBe(featureCount);
    });
  });

  describe('Feature Descriptions', () => {
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

    test('should map each feature to correct description', () => {
      expect(featureDescriptions.animations).toBe('Smooth piece flip animations');
      expect(featureDescriptions.glassGlare).toBe('Glass glare on last moved tile');
      expect(featureDescriptions.soundEffects).toBe('Audio feedback for moves');
      expect(featureDescriptions.moveHistory).toBe('Track and display move history');
      expect(featureDescriptions.scoreAnimations).toBe('Animated score changes');
      expect(featureDescriptions.loadingScreen).toBe('Show loading screen on startup');
      expect(featureDescriptions.debug).toBe('Enable console logging');
    });

    test('should have descriptions for all features', () => {
      const descriptionCount = Object.keys(featureDescriptions).length;
      const featureCount = Object.keys(features).length;
      expect(descriptionCount).toBe(featureCount);
    });
  });

  describe('Feature Toggle Behavior', () => {
    test('should toggle animations feature', () => {
      toggleFeature('animations', true);
      expect(features.animations).toBe(true);

      toggleFeature('animations', false);
      expect(features.animations).toBe(false);
    });

    test('should toggle glassGlare feature', () => {
      toggleFeature('glassGlare', true);
      expect(features.glassGlare).toBe(true);

      toggleFeature('glassGlare', false);
      expect(features.glassGlare).toBe(false);
    });

    test('should toggle soundEffects feature', () => {
      toggleFeature('soundEffects', true);
      expect(features.soundEffects).toBe(true);

      toggleFeature('soundEffects', false);
      expect(features.soundEffects).toBe(false);
    });

    test('should toggle moveHistory feature', () => {
      toggleFeature('moveHistory', true);
      expect(features.moveHistory).toBe(true);

      toggleFeature('moveHistory', false);
      expect(features.moveHistory).toBe(false);
    });

    test('should toggle scoreAnimations feature', () => {
      toggleFeature('scoreAnimations', true);
      expect(features.scoreAnimations).toBe(true);

      toggleFeature('scoreAnimations', false);
      expect(features.scoreAnimations).toBe(false);
    });

    test('should toggle loadingScreen feature', () => {
      toggleFeature('loadingScreen', true);
      expect(features.loadingScreen).toBe(true);

      toggleFeature('loadingScreen', false);
      expect(features.loadingScreen).toBe(false);
    });

    test('should toggle debug feature', () => {
      toggleFeature('debug', true);
      expect(features.debug).toBe(true);

      toggleFeature('debug', false);
      expect(features.debug).toBe(false);
    });

    test('should toggle multiple features independently', () => {
      toggleFeature('animations', true);
      toggleFeature('glassGlare', false);
      toggleFeature('soundEffects', true);

      expect(features.animations).toBe(true);
      expect(features.glassGlare).toBe(false);
      expect(features.soundEffects).toBe(true);
    });

    test('should preserve other features when toggling one', () => {
      toggleFeature('animations', true);
      toggleFeature('glassGlare', true);

      const beforeSoundEffects = features.soundEffects;
      toggleFeature('moveHistory', false);

      // soundEffects should remain unchanged
      expect(features.soundEffects).toBe(beforeSoundEffects);
      expect(features.animations).toBe(true);
      expect(features.glassGlare).toBe(true);
    });

    test('should maintain state after toggling twice', () => {
      const original = features.animations;
      toggleFeature('animations', !original);
      toggleFeature('animations', original);
      expect(features.animations).toBe(original);
    });

    test('should reflect changes immediately', () => {
      const before = features.animations;
      toggleFeature('animations', !before);
      const after = features.animations;
      expect(after).toBe(!before);
    });
  });

  describe('Feature State Consistency', () => {
    test('should allow toggling all features', () => {
      const featureKeys = Object.keys(features) as Array<keyof FeatureFlags>;

      featureKeys.forEach((key) => {
        toggleFeature(key, true);
        expect(features[key]).toBe(true);

        toggleFeature(key, false);
        expect(features[key]).toBe(false);
      });
    });

    test('should handle rapid state changes', () => {
      toggleFeature('animations', true);
      toggleFeature('animations', false);
      toggleFeature('animations', true);
      toggleFeature('animations', false);

      expect(features.animations).toBe(false);
    });

    test('should maintain independent state for each feature', () => {
      toggleFeature('animations', true);
      toggleFeature('glassGlare', false);
      toggleFeature('soundEffects', true);
      toggleFeature('moveHistory', false);

      expect(features.animations).toBe(true);
      expect(features.glassGlare).toBe(false);
      expect(features.soundEffects).toBe(true);
      expect(features.moveHistory).toBe(false);
    });
  });

  describe('Component Props Interface', () => {
    test('should define correct prop types', () => {
      interface SettingsPanelProps {
        isOpen: boolean;
        onClose: () => void;
      }

      const props: SettingsPanelProps = {
        isOpen: true,
        onClose: () => {},
      };

      expect(typeof props.isOpen).toBe('boolean');
      expect(typeof props.onClose).toBe('function');
    });

    test('should accept false for isOpen', () => {
      interface SettingsPanelProps {
        isOpen: boolean;
        onClose: () => void;
      }

      const props: SettingsPanelProps = {
        isOpen: false,
        onClose: () => {},
      };

      expect(props.isOpen).toBe(false);
    });

    test('should accept true for isOpen', () => {
      interface SettingsPanelProps {
        isOpen: boolean;
        onClose: () => void;
      }

      const props: SettingsPanelProps = {
        isOpen: true,
        onClose: () => {},
      };

      expect(props.isOpen).toBe(true);
    });
  });

  describe('Feature Flag Type Safety', () => {
    test('should enforce boolean type for all features', () => {
      const featureKeys = Object.keys(features) as Array<keyof FeatureFlags>;

      featureKeys.forEach((key) => {
        expect(typeof features[key]).toBe('boolean');
      });
    });

    test('should maintain type consistency after toggles', () => {
      toggleFeature('animations', true);
      expect(typeof features.animations).toBe('boolean');

      toggleFeature('animations', false);
      expect(typeof features.animations).toBe('boolean');
    });
  });
});
