import React, { useState } from 'react';
import '../../styles/navbar.css';

interface NavbarProps {
  onPlayClick?: () => void;
  onStatsClick?: () => void;
}

/**
 * Navbar Component
 * Chess.com inspired top navigation bar
 * Action buttons (New Game, Settings) moved to action bar below game
 */
export const Navbar: React.FC<NavbarProps> = ({ onPlayClick, onStatsClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handlePlayClick = () => {
    setMobileMenuOpen(false);
    onPlayClick?.();
  };

  const handleStatsClick = () => {
    setMobileMenuOpen(false);
    onStatsClick?.();
  };

  return (
    <nav className="navbar">
      <a href="/Othello/" className="navbar-brand">
        ⚫⚪ Othello
      </a>

      {/* Mobile action buttons removed - now in action bar below game */}

      <button className="navbar-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <ul className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <li className="nav-item">
          <a className="nav-link primary" onClick={handlePlayClick}>
            ▶ Play
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#learn">
            Learn
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" onClick={handleStatsClick}>
            📊 Stats
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#about">
            About
          </a>
        </li>
      </ul>
    </nav>
  );
};
