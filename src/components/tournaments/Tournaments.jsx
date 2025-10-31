import React from 'react'
import './Tournaments.css'
import { Link } from 'react-router-dom'

const SAMPLE_TOURNAMENTS = [
  { id: 'tx-high-roller', name: "Texas High Roller", prize: '10,000', buyin: '100', time: 'Today 20:00' },
  { id: 'lone-star-pro', name: 'Lone Star Pro', prize: '25,000', buyin: '250', time: 'Tomorrow 18:00' },
  { id: 'river-ride', name: 'River Ride', prize: '5,000', buyin: '25', time: 'Fri 21:00' },
  { id: 'dusty-trail', name: 'Dusty Trail Showdown', prize: '15,000', buyin: '75', time: 'Sat 19:30' }
]

function TournamentCard({ t }) {
  const gradId = `coinGradient-${t.id}`;
  return (
    <article className="t-card" aria-labelledby={`t-${t.id}`}>
      <div className="t-card-visual" aria-hidden>
        <div className="neon-bar" />
        <svg className="t-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="10" width="52" height="44" rx="6" fill="#1a1a2e" opacity="0.06" />
          <g fill="#ffd166">
            <circle cx="22" cy="28" r="4" />
            <circle cx="42" cy="28" r="4" />
            <path d="M24 40c3-6 13-6 16 0" stroke="#ffd166" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <div className="t-card-body">
        <h3 id={`t-${t.id}`} className="t-title">{t.name}</h3>

        <div className="t-prize-row">
          <div className="t-coin-badge" aria-hidden>
            <svg className="t-coin-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD700" />
                  <stop offset="1" stopColor="#FF8B35" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="9" fill={`url(#${gradId})`} stroke="#FFB800" strokeWidth="1" />
              <path d="M12 7V17" stroke="#6b3f00" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="t-prize-amt">${t.prize}</span>
          </div>

          <div className="t-buyin">Buy-in: <strong>${t.buyin}</strong></div>
        </div>

        <p className="t-time">{t.time}</p>
        <div className="t-actions">
          <Link to={`/tournaments/${t.id}`} className="t-join" aria-label={`Join ${t.name}`}>Join</Link>
          <button className="t-watch" aria-label={`Watch ${t.name}`}>Watch</button>
        </div>
      </div>
    </article>
  )
}

export default function Tournaments() {
  return (
    <section className="tournaments-page">
      <header className="t-header">
        <h1>Texas Tournaments</h1>
        <p className="t-intro">Feel the heat of the Lone Star tables — glowing lights, big prizes, and fast action.</p>
      </header>

      <div className="t-list">
        {SAMPLE_TOURNAMENTS.map(t => (
          <TournamentCard key={t.id} t={t} />
        ))}
      </div>

      <footer className="t-footer">
        <p>Want a seat at the next table? Top up your wallet and ride the river.</p>
      </footer>
    </section>
  )
}
