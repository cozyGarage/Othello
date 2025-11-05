import React, { useState } from 'react';
import '../../styles/navbar.css';

interface NavbarProps {
  onPlayClick?: () => void;
}

/**
 * Navbar Component
 * Chess.com inspired top navigation bar
 */
export const Navbar: React.FC<NavbarProps> = ({ onPlayClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handlePlayClick = () => {
    setMobileMenuOpen(false);
    onPlayClick?.();
  };

  return (
    <nav className="navbar">
      <a href="/othello" className="navbar-brand">
        ⚫⚪ Othello
      </a>

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
          <a className="nav-link" href="#stats">
            Stats
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
