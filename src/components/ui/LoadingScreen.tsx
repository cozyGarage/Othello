import React from 'react';
import '../../styles/game.css';
import '../../styles/animations.css';

interface LoadingScreenProps {
  isLoading: boolean;
}

/**
 * LoadingScreen Component
 * 
 * Displays a loading animation during game initialization
 * Fades in/out smoothly with wooden theme styling
 * 
 * @param isLoading - Whether to show the loading screen
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-piece black"></div>
          <div className="spinner-piece white"></div>
        </div>
        <h1 className="loading-title">Othello</h1>
        <p className="loading-text">Loading game...</p>
      </div>
    </div>
  );
};
