import React from 'react';

interface LandingHeroProps {
  onPlay: () => void;
  onJumpToBoard: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onPlay, onJumpToBoard }) => {
  return (
    <section className="landing-section">
      <div className="hero" id="learn">
        <div className="hero-panel">
          <div className="meta-strip">
            <span className="meta-chip">Deployment fixed</span>
            <span className="meta-chip">Fresh UI</span>
            <span className="meta-chip">Blog drafts</span>
          </div>
          <h1>Focus on the fight, let the interface disappear.</h1>
          <p>
            A calmer board, richer sidebar, and quicker actions tuned for blitz or thoughtful play.
            Stay in flow while the evaluation graph and stats keep you informed.
          </p>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={onPlay}>
              Start a match
            </button>
            <button className="hero-btn" onClick={onJumpToBoard}>
              Jump to board
            </button>
            <button
              className="hero-btn"
              onClick={() =>
                document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Read updates
            </button>
          </div>
          <div className="info-badges" style={{ marginTop: 12 }}>
            <span className="info-badge">Evaluation graph</span>
            <span className="info-badge">Time controls</span>
            <span className="info-badge">Replay + stats</span>
          </div>
        </div>

        <div className="secondary-panel">
          <h3>Playing rhythm</h3>
          <div className="insight-grid">
            <div className="insight-card">
              <strong>Sharper board</strong>
              <span>Elevated contrast on tiles and stones for faster scanning mid-game.</span>
            </div>
            <div className="insight-card">
              <strong>Smarter pacing</strong>
              <span>
                Action bar and keyboard shortcuts keep you moving; spectator bots stay ready.
              </span>
            </div>
            <div className="insight-card">
              <strong>Game analysis</strong>
              <span>Evaluation graph, move replay, and position hints as you learn.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
