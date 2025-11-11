/**
 * Local Storage Helper for Time Control Preferences
 *
 * Phase 3: Persist user preferences across sessions
 *
 * Storage Keys:
 * - othello:timeControlEnabled - Boolean for time control on/off
 * - othello:selectedTimePreset - String ID of selected preset
 *
 * Design Philosophy:
 * - Save preferences immediately when changed (no "save" button needed)
 * - Graceful degradation if localStorage unavailable (private browsing)
 * - Type-safe getters with sensible defaults
 *
 * @module localStorage
 */

/** Storage keys - centralized to avoid typos */
const STORAGE_KEYS = {
  TIME_CONTROL_ENABLED: 'othello:timeControlEnabled',
  SELECTED_TIME_PRESET: 'othello:selectedTimePreset',
  MUTE_TIME_SOUNDS: 'othello:muteTimeSounds',
} as const;

/**
 * Check if localStorage is available
 *
 * @returns true if localStorage is supported and accessible
 * @remarks
 * Some browsers block localStorage in private/incognito mode or with strict privacy settings
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;

    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage not available:', error);
    return false;
  }
}

/**
 * Get time control enabled preference from localStorage
 *
 * @returns Stored value or false (default to disabled)
 * @example
 * const enabled = getTimeControlEnabled(); // false if never set
 */
export function getTimeControlEnabled(): boolean {
  if (!isLocalStorageAvailable()) return false;

  const stored = window.localStorage.getItem(STORAGE_KEYS.TIME_CONTROL_ENABLED);
  return stored === 'true'; // String 'true' → boolean true
}

/**
 * Save time control enabled preference to localStorage
 *
 * @param enabled - Whether time control is enabled
 * @example
 * setTimeControlEnabled(true); // Saved immediately
 */
export function setTimeControlEnabled(enabled: boolean): void {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.setItem(STORAGE_KEYS.TIME_CONTROL_ENABLED, enabled.toString());
}

/**
 * Get selected time preset preference from localStorage
 *
 * @returns Stored preset ID or 'blitz' (default)
 * @example
 * const preset = getSelectedTimePreset(); // 'blitz' if never set
 */
export function getSelectedTimePreset(): string {
  if (!isLocalStorageAvailable()) return 'blitz'; // Default preset

  const stored = window.localStorage.getItem(STORAGE_KEYS.SELECTED_TIME_PRESET);
  return stored || 'blitz'; // Fallback to blitz if null
}

/**
 * Save selected time preset preference to localStorage
 *
 * @param presetId - ID of the preset ('bullet', 'blitz', 'rapid', 'classical')
 * @example
 * setSelectedTimePreset('rapid'); // Saved immediately
 */
export function setSelectedTimePreset(presetId: string): void {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.setItem(STORAGE_KEYS.SELECTED_TIME_PRESET, presetId);
}

/**
 * Clear all time control preferences from localStorage
 *
 * @remarks
 * Useful for testing or "reset to defaults" functionality
 * @example
 * clearTimeControlPreferences(); // Back to defaults
 */
export function clearTimeControlPreferences(): void {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.removeItem(STORAGE_KEYS.TIME_CONTROL_ENABLED);
  window.localStorage.removeItem(STORAGE_KEYS.SELECTED_TIME_PRESET);
  window.localStorage.removeItem(STORAGE_KEYS.MUTE_TIME_SOUNDS);
}

/**
 * Get mute time sounds preference from localStorage
 *
 * @returns Stored value or false (default to not muted)
 * @example
 * const muted = getMuteTimeSounds(); // false if never set
 */
export function getMuteTimeSounds(): boolean {
  if (!isLocalStorageAvailable()) return false;

  const stored = window.localStorage.getItem(STORAGE_KEYS.MUTE_TIME_SOUNDS);
  return stored === 'true'; // String 'true' → boolean true
}

/**
 * Save mute time sounds preference to localStorage
 *
 * @param muted - Whether time control sounds should be muted
 * @example
 * setMuteTimeSounds(true); // Mute time warnings/increments
 */
export function setMuteTimeSounds(muted: boolean): void {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.setItem(STORAGE_KEYS.MUTE_TIME_SOUNDS, muted.toString());
}
