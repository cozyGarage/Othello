import React from 'react';
import { formatTime, getTimeUrgency } from '../../config/timePresets';
import '../../styles/ui.css';

interface TimeControlProps {
  /** Time remaining in milliseconds */
  timeRemaining: number;
  /** Player color ('black' | 'white') */
  playerColor: 'black' | 'white';
  /** Whether it's this player's turn (activates countdown) */
  isActive: boolean;
  /** Optional callback when time runs out */
  onTimeOut?: () => void;
}

/**
 * TimeControl Component (Phase 3 Enhanced)
 *
 * Displays chess-style time control for a player with visual/audio feedback
 *
 * Features:
 * - Shows time in MM:SS or HH:MM:SS format
 * - Visual indicators when running low on time (normal → warning → critical)
 * - Pulses when time < 10 seconds (draws attention to urgency)
 * - Flash animation when time is added (increment feedback)
 *
 * State Management:
 * - Tracks previous time to detect when increment is added
 * - Triggers flash animation briefly (300ms) when time increases
 * - Applies pulse animation continuously when critical (< 10s)
 *
 * Usage:
 * ```tsx
 * <TimeControl
 *   timeRemaining={180000} // 3 minutes in ms
 *   playerColor="black"
 *   isActive={currentPlayer === 'black'}
 *   onTimeOut={() => handleTimeout('black')}
 * />
 * ```
 */
export const TimeControl: React.FC<TimeControlProps> = ({
  timeRemaining,
  playerColor,
  isActive,
  onTimeOut,
}) => {
  const urgency = getTimeUrgency(timeRemaining);
  const formattedTime = formatTime(timeRemaining);

  // Track previous time to detect increment (time increasing)
  const prevTimeRef = React.useRef<number>(timeRemaining);
  const [isFlashing, setIsFlashing] = React.useState(false);

  // Detect when time is added (increment) and trigger flash animation
  React.useEffect(() => {
    const prevTime = prevTimeRef.current;
    const currentTime = timeRemaining;

    // Time increased = increment was added
    // Only flash if time actually increased (not just initial render)
    if (currentTime > prevTime && prevTime > 0) {
      setIsFlashing(true);

      // Remove flash class after animation completes (300ms)
      const timeoutId = setTimeout(() => {
        setIsFlashing(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }

    // Update ref for next comparison
    prevTimeRef.current = currentTime;

    // No cleanup needed if time didn't increase
    return undefined;
  }, [timeRemaining]);

  // Trigger timeout callback when time runs out
  React.useEffect(() => {
    if (timeRemaining <= 0 && onTimeOut) {
      onTimeOut();
    }
  }, [timeRemaining, onTimeOut]);

  // Determine if we should pulse (critical time AND active player)
  const shouldPulse = urgency === 'critical' && isActive;

  return (
    <div
      className={`time-control ${playerColor} ${isActive ? 'active' : ''} ${urgency} ${shouldPulse ? 'pulsing' : ''} ${isFlashing ? 'flashing' : ''}`}
      data-player={playerColor}
      title={`${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}'s time`}
    >
      <div className="time-icon">⏱️</div>
      <div className="time-display">{formattedTime}</div>
    </div>
  );
};
