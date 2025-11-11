import type { TimeControlConfig } from 'othello-engine';

export interface TimePreset {
  id: string;
  name: string;
  description: string;
  config: TimeControlConfig;
}

/**
 * Time Control Presets
 *
 * Similar to chess time controls:
 * - Bullet: Fast-paced, 1 minute total
 * - Blitz: Quick games with increment
 * - Rapid: Standard competitive play
 * - Classical: Long, thoughtful games
 */
export const TIME_PRESETS: TimePreset[] = [
  {
    id: 'bullet',
    name: 'Bullet',
    description: '1+0 - One minute, no increment',
    config: {
      initialTime: 60000, // 1 minute
      increment: 0,
    },
  },
  {
    id: 'blitz',
    name: 'Blitz',
    description: '3+2 - Three minutes + 2 seconds per move',
    config: {
      initialTime: 180000, // 3 minutes
      increment: 2000, // 2 seconds
    },
  },
  {
    id: 'rapid',
    name: 'Rapid',
    description: '10+5 - Ten minutes + 5 seconds per move',
    config: {
      initialTime: 600000, // 10 minutes
      increment: 5000, // 5 seconds
    },
  },
  {
    id: 'classical',
    name: 'Classical',
    description: '30+0 - Thirty minutes, no increment',
    config: {
      initialTime: 1800000, // 30 minutes
      increment: 0,
    },
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): TimePreset | undefined {
  return TIME_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get default preset (Blitz)
 */
export function getDefaultPreset(): TimePreset {
  const preset = TIME_PRESETS[1]; // Blitz
  if (!preset) {
    throw new Error('Default preset not found');
  }
  return preset;
}

/**
 * Format time for display
 * @param ms - Time in milliseconds
 * @returns Formatted string like "3:45" or "45" for < 1 minute
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);

  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return totalSeconds.toString();
}

/**
 * Get time urgency level
 * @param ms - Time in milliseconds
 * @returns Urgency level for styling
 */
export function getTimeUrgency(ms: number): 'normal' | 'warning' | 'critical' {
  if (ms < 10000) return 'critical'; // < 10 seconds
  if (ms < 30000) return 'warning'; // < 30 seconds
  return 'normal';
}
