/**
 * Feature Flags Configuration
 * 
 * Central place to enable/disable features across the application.
 * Useful for:
 * - A/B testing
 * - Gradual feature rollouts
 * - Development testing
 * - Performance optimization (disable animations on slow devices)
 * - User preferences
 * 
 * Usage:
 * ```tsx
 * import { features } from './config/features';
 * 
 * if (features.animations) {
 *   // Apply animation
 * }
 * ```
 */

export interface FeatureFlags {
  /** Enable/disable all animations (flip, glass glare, UI transitions) */
  animations: boolean;
  
  /** Enable/disable glass glare effect on last moved tile */
  glassGlare: boolean;
  
  /** Enable/disable sound effects (flip, invalid move, game over) */
  soundEffects: boolean;
  
  /** Enable/disable move history tracking and display */
  moveHistory: boolean;
  
  /** Enable/disable score change animations (pop, float) */
  scoreAnimations: boolean;
  
  /** Enable/disable loading screen */
  loadingScreen: boolean;
  
  /** Enable/disable debug mode (console logs, performance metrics) */
  debug: boolean;
}

/**
 * Default feature flag values
 * Modify these to enable/disable features globally
 */
export const features: FeatureFlags = {
  animations: true,
  glassGlare: true,
  soundEffects: true, // Web Audio API - no dependencies needed
  moveHistory: true,  // Now implemented - displays move history with timestamps
  scoreAnimations: false, // Disabled by default (can be overwhelming)
  loadingScreen: false,   // Disabled by default (optional UX)
  debug: false, // Enable for development debugging
};

/**
 * Helper function to check if a feature is enabled
 * @param feature - Feature flag name
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return features[feature];
}

/**
 * Helper function to toggle a feature at runtime
 * Useful for user preferences or testing
 * @param feature - Feature flag name
 * @param enabled - New state
 */
export function toggleFeature(feature: keyof FeatureFlags, enabled: boolean): void {
  features[feature] = enabled;
  
  if (features.debug) {
    console.log(`🚩 Feature "${feature}" ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Export individual feature checks for convenience
 */
export const hasAnimations = () => isFeatureEnabled('animations');
export const hasGlassGlare = () => isFeatureEnabled('glassGlare');
export const hasSoundEffects = () => isFeatureEnabled('soundEffects');
export const hasMoveHistory = () => isFeatureEnabled('moveHistory');
export const hasScoreAnimations = () => isFeatureEnabled('scoreAnimations');
export const hasLoadingScreen = () => isFeatureEnabled('loadingScreen');
export const isDebugMode = () => isFeatureEnabled('debug');
