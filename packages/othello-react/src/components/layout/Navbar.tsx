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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((open) => !open);
  };

  const handlePlayClick = () => {
    closeMobileMenu();
    onPlayClick?.();
  };

  const handleStatsClick = () => {
    closeMobileMenu();
    onStatsClick?.();
  };

  return (
    <nav className="navbar">
      <a href={import.meta.env.BASE_URL} className="navbar-brand">
        ⚫⚪ Othello
      </a>

      <button
        type="button"
        className="navbar-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <ul className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <li className="nav-item">
          <button type="button" className="nav-link primary" onClick={handlePlayClick}>
            ▶ Play
          </button>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#learn" onClick={closeMobileMenu}>
            Learn
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#blog" onClick={closeMobileMenu}>
            Blog
          </a>
        </li>
        <li className="nav-item">
          <button type="button" className="nav-link" onClick={handleStatsClick}>
            📊 Stats
          </button>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#about" onClick={closeMobileMenu}>
            About
          </a>
        </li>
      </ul>
    </nav>
  );
};
