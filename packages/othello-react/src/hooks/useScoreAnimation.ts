import { useState, useEffect, useRef } from 'react';

interface ScoreChange {
  id: number;
  amount: number;
  timestamp: number;
}

interface UseScoreAnimationResult {
  scoreClass: string;
  scoreChanges: ScoreChange[];
}

/**
 * Custom hook for animating score changes
 * 
 * Tracks score changes and triggers CSS animations
 * Shows floating +X indicators when score increases
 * 
 * @param score - Current score value
 * @returns Object with score CSS class and active score changes
 */
export function useScoreAnimation(score: number): UseScoreAnimationResult {
  const [scoreClass, setScoreClass] = useState('');
  const [scoreChanges, setScoreChanges] = useState<ScoreChange[]>([]);
  const prevScoreRef = useRef(score);
  const changeIdRef = useRef(0);

  useEffect(() => {
    const prevScore = prevScoreRef.current;
    const currentScore = score;

    if (currentScore !== prevScore && prevScore !== 0) {
      const difference = currentScore - prevScore;
      
      if (difference > 0) {
        // Score increased - trigger animation
        setScoreClass('score-change');
        
        // Add floating indicator
        const newChange: ScoreChange = {
          id: changeIdRef.current++,
          amount: difference,
          timestamp: Date.now()
        };
        setScoreChanges(prev => [...prev, newChange]);
        
        // Remove animation class after animation completes
        setTimeout(() => setScoreClass(''), 500);
        
        // Remove floating indicator after animation completes
        setTimeout(() => {
          setScoreChanges(prev => prev.filter(change => change.id !== newChange.id));
        }, 1000);
      }
    }

    prevScoreRef.current = currentScore;
  }, [score]);

  return {
    scoreClass,
    scoreChanges
  };
}
