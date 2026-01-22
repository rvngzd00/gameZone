import React from 'react';
import { Link } from 'react-router-dom';
import './Games.css';

import dominoImg from './gameLogoImages/dominoLogo.png';
import backgammonImg from './gameLogoImages/backgammonLogo.png';
import lotoImg from './gameLogoImages/lotoLogo.png';
import durakImg from './gameLogoImages/durakLogo.png';
import okayImg from './gameLogoImages/okeyLogo.png';
import sekaImg from './gameLogoImages/sekaLogo.png';
import pokerImg from './gameLogoImages/pokerLogo.png';
import { useAppContext } from '../../context/AppContext';



const GAMES = [
  { id: 'domino', name: 'game_domino', img: dominoImg },
  { id: 'backgammon', name: 'game_backgammon', img: backgammonImg },
  { id: 'loto', name: 'game_loto', img: lotoImg },
  { id: 'okey', name: 'game_okey' ,img: okayImg },
  { id: 'durak', name: 'game_durak' ,img: durakImg },
  { id: 'seka', name: 'game_seka', img: sekaImg },
  { id: 'poker', name: 'game_poker', img: pokerImg }
];

function GameCard({ game }) {
  const { t } = useAppContext();

  return (
    <Link to={`/games/${game.id}`} className="game-card" aria-labelledby={`game-${game.id}`}>
      <div className="game-art" aria-hidden>
        <img src={game.img} className='game-image' alt="Game Image" />
        {/* Inline SVG placeholder tuned per game id for variety */}
        {/* {game.id === 'dominoes' && (
          // <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
          //   <rect x="6" y="8" width="18" height="32" rx="3" fill="var(--accent)" />
          //   <rect x="24" y="8" width="18" height="32" rx="3" fill="var(--accent)" />
          //   <circle cx="15" cy="18" r="2" fill="var(--black)" />
          //   <circle cx="15" cy="30" r="2" fill="var(--black)" />
          //   <circle cx="33" cy="19" r="2" fill="var(--black)" />
          //   <circle cx="33" cy="29" r="2" fill="var(--black)" />
          // </svg>
          // <img src="" alt="" />
        )} */}

        {/* {game.id === 'durak' && (
          // <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
          //   <rect x="8" y="8" width="32" height="32" rx="6" fill="var(--accent)" />
          //   <path d="M16 20h16" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
          //   <circle cx="24" cy="30" r="5" fill="var(--black)" />
          // </svg>
        )}

        {game.id === 'okay' && (
          // <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
          //   <circle cx="24" cy="24" r="16" fill="var(--accent)" />
          //   <rect x="12" y="20" width="24" height="8" rx="4" fill="var(--black)" />
          // </svg>
        )}

        {game.id === 'backgammon' && (
          // <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
          //   <rect x="4" y="8" width="40" height="32" rx="6" fill="var(--accent)" />
          //   <g fill="var(--black)">
          //     <polygon points="12,38 16,12 20,38" />
          //     <polygon points="24,38 28,12 32,38" />
          //   </g>
          // </svg>
        )}

        {game.id === 'blackjack' && (
          // <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
          //   <rect x="6" y="8" width="36" height="32" rx="6" fill="var(--accent)" />
          //   <text x="24" y="30" textAnchor="middle" fontSize="14" fontWeight={700} fill="var(--black)">BJ</text>
          // </svg>
        )}

        {game.id === 'poker' && (
          // <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
          //   <rect x="6" y="6" width="36" height="36" rx="6" fill="var(--accent)" />
          //   <g fill="var(--black)">
          //     <circle cx="20" cy="20" r="3" />
          //     <circle cx="28" cy="20" r="3" />
          //     <circle cx="24" cy="28" r="3" />
          //   </g>
          // </svg>
        )}

        {game.id === 'baccarat' && (
          // <svg viewBox="0 0 48 48" className="game-svg" xmlns="http://www.w3.org/2000/svg">
          //   <rect x="8" y="10" width="32" height="28" rx="6" fill="var(--accent)" />
          //   <path d="M16 22h16M16 28h16" stroke="var(--black)" strokeWidth={2} strokeLinecap="round" />
          // </svg>
        )} */}
      </div>
      <h3 id={`game-${game.id}`}>{t(game.name)}</h3>
    </Link>
  );
}

export default function Games() {
  return (
    <div className="container">
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
    </div>
  );
}
