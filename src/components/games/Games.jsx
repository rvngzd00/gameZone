import React from 'react';
import { Link } from 'react-router-dom';
import './Games.css';

const GAMES = [
  { id: 'dominoes', name: 'Dominoes' },
  { id: 'durak', name: 'Durak' },
  { id: 'okay', name: 'Okay' },
  { id: 'turkish-backgammon', name: 'Turkish Backgammon' },
  { id: 'blackjack', name: 'Blackjack' },
  { id: 'poker', name: 'Poker' },
  { id: 'baccarat', name: 'Baccarat' }
];

function GameCard({ game }) {
  return (
    <Link to={`/games/${game.id}`} className="game-card" aria-labelledby={`game-${game.id}`}>
      <div className="game-art" aria-hidden>
        {/* Inline SVG placeholder tuned per game id for variety */}
        {game.id === 'dominoes' && (
          <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="8" width="18" height="32" rx="3" fill="#ffe39f" />
            <rect x="24" y="8" width="18" height="32" rx="3" fill="#ffd166" />
            <circle cx="15" cy="18" r="2" fill="#1a1a2e" />
            <circle cx="15" cy="30" r="2" fill="#1a1a2e" />
            <circle cx="33" cy="19" r="2" fill="#1a1a2e" />
            <circle cx="33" cy="29" r="2" fill="#1a1a2e" />
          </svg>
        )}

        {game.id === 'durak' && (
          <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="32" height="32" rx="6" fill="#ffd166" />
            <path d="M16 20h16" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="30" r="5" fill="#1a1a2e" />
          </svg>
        )}

        {game.id === 'okay' && (
          <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="16" fill="#ffd166" />
            <rect x="12" y="20" width="24" height="8" rx="4" fill="#1a1a2e" />
          </svg>
        )}

        {game.id === 'turkish-backgammon' && (
          <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="40" height="32" rx="6" fill="#ffc857" />
            <g fill="#1a1a2e">
              <polygon points="12,38 16,12 20,38" />
              <polygon points="24,38 28,12 32,38" />
            </g>
          </svg>
        )}

        {game.id === 'blackjack' && (
          <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="8" width="36" height="32" rx="6" fill="#ffd166" />
            <text x="24" y="30" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1a1a2e">BJ</text>
          </svg>
        )}

        {game.id === 'poker' && (
          <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="36" height="36" rx="6" fill="#ffd166" />
            <g fill="#1a1a2e">
              <circle cx="20" cy="20" r="3" />
              <circle cx="28" cy="20" r="3" />
              <circle cx="24" cy="28" r="3" />
            </g>
          </svg>
        )}

        {game.id === 'baccarat' && (
          <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="32" height="28" rx="6" fill="#ffd166" />
            <path d="M16 22h16M16 28h16" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 id={`game-${game.id}`}>{game.name}</h3>
    </Link>
  );
}

export default function Games() {
  return (
    <section className="games-page">
      {GAMES.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
      {/* <header className="games-header">
        <h1>Table Games</h1>
        <p className="intro">Choose a game and test your luck — every table promises golden rewards.</p>
      </header> */}

      {/* <div className="games-grid">
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div> */}
    </section>
  );
}
