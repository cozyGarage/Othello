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
  SOUND_VOLUME: 'othello:soundVolume',
  CUSTOM_TIME_CONFIG: 'othello:customTimeConfig',
  GAME_TIME_STATE: 'othello:gameTimeState',
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
  window.localStorage.removeItem(STORAGE_KEYS.SOUND_VOLUME);
  window.localStorage.removeItem(STORAGE_KEYS.CUSTOM_TIME_CONFIG);
  window.localStorage.removeItem(STORAGE_KEYS.GAME_TIME_STATE);
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

// ============================================================
// SOUND VOLUME (Phase 3.5)
// ============================================================

/**
 * Get sound volume preference from localStorage
 *
 * @returns Stored volume (0-100) or 100 (default to full volume)
 * @example
 * const volume = getSoundVolume(); // 100 if never set
 */
export function getSoundVolume(): number {
  if (!isLocalStorageAvailable()) return 100;

  const stored = window.localStorage.getItem(STORAGE_KEYS.SOUND_VOLUME);
  if (stored === null) return 100;

  const volume = parseInt(stored, 10);
  return isNaN(volume) ? 100 : Math.max(0, Math.min(100, volume));
}

/**
 * Save sound volume preference to localStorage
 *
 * @param volume - Volume level (0-100)
 * @example
 * setSoundVolume(50); // Set to 50% volume
 */
export function setSoundVolume(volume: number): void {
  if (!isLocalStorageAvailable()) return;

  const clampedVolume = Math.max(0, Math.min(100, Math.round(volume)));
  window.localStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, clampedVolume.toString());
}

// ============================================================
// CUSTOM TIME CONTROLS (Phase 3.5)
// ============================================================

/** Custom time control configuration */
export interface CustomTimeConfig {
  initialMinutes: number;
  incrementSeconds: number;
}

/**
 * Get custom time config from localStorage
 *
 * @returns Stored custom config or null if not set
 * @example
 * const custom = getCustomTimeConfig(); // null if never set
 */
export function getCustomTimeConfig(): CustomTimeConfig | null {
  if (!isLocalStorageAvailable()) return null;

  const stored = window.localStorage.getItem(STORAGE_KEYS.CUSTOM_TIME_CONFIG);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as CustomTimeConfig;
    // Validate the structure
    if (
      typeof parsed.initialMinutes === 'number' &&
      typeof parsed.incrementSeconds === 'number' &&
      parsed.initialMinutes >= 0.5 &&
      parsed.initialMinutes <= 60 &&
      parsed.incrementSeconds >= 0 &&
      parsed.incrementSeconds <= 30
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save custom time config to localStorage
 *
 * @param config - Custom time configuration
 * @example
 * setCustomTimeConfig({ initialMinutes: 5, incrementSeconds: 3 });
 */
export function setCustomTimeConfig(config: CustomTimeConfig): void {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.setItem(STORAGE_KEYS.CUSTOM_TIME_CONFIG, JSON.stringify(config));
}

/**
 * Clear custom time config from localStorage
 */
export function clearCustomTimeConfig(): void {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.removeItem(STORAGE_KEYS.CUSTOM_TIME_CONFIG);
}

// ============================================================
// GAME TIME STATE PERSISTENCE (Phase 3.5)
// ============================================================

/** Saved game time state for restoration on refresh */
export interface SavedTimeState {
  blackTime: number;
  whiteTime: number;
  currentPlayer: 'B' | 'W';
  presetId: string;
  timestamp: number; // When it was saved (for staleness check)
}

/**
 * Get saved game time state from localStorage
 *
 * @returns Stored time state or null if not available/stale
 * @remarks
 * Time state is considered stale after 1 hour (game likely abandoned)
 * @example
 * const state = getSavedTimeState();
 * if (state) { /* restore game *\/ }
 */
export function getSavedTimeState(): SavedTimeState | null {
  if (!isLocalStorageAvailable()) return null;

  const stored = window.localStorage.getItem(STORAGE_KEYS.GAME_TIME_STATE);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as SavedTimeState;

    // Validate structure
    if (
      typeof parsed.blackTime !== 'number' ||
      typeof parsed.whiteTime !== 'number' ||
      (parsed.currentPlayer !== 'B' && parsed.currentPlayer !== 'W') ||
      typeof parsed.presetId !== 'string' ||
      typeof parsed.timestamp !== 'number'
    ) {
      return null;
    }

    // Check staleness (1 hour = 3600000ms)
    const ONE_HOUR = 3600000;
    if (Date.now() - parsed.timestamp > ONE_HOUR) {
      clearSavedTimeState();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save current game time state to localStorage
 *
 * @param state - Current time state to save
 * @example
 * saveTimeState({
 *   blackTime: 120000,
 *   whiteTime: 115000,
 *   currentPlayer: 'W',
 *   presetId: 'blitz',
 *   timestamp: Date.now()
 * });
 */
export function saveTimeState(state: Omit<SavedTimeState, 'timestamp'>): void {
  if (!isLocalStorageAvailable()) return;

  const stateWithTimestamp: SavedTimeState = {
    ...state,
    timestamp: Date.now(),
  };

  window.localStorage.setItem(STORAGE_KEYS.GAME_TIME_STATE, JSON.stringify(stateWithTimestamp));
}

/**
 * Clear saved game time state from localStorage
 * Should be called when game ends or new game starts
 */
export function clearSavedTimeState(): void {
  if (!isLocalStorageAvailable()) return;

  window.localStorage.removeItem(STORAGE_KEYS.GAME_TIME_STATE);
}
