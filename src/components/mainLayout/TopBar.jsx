import React, { useState } from 'react';
import './TopBar.css';
import { Link } from 'react-router-dom';

import { useAppContext } from '../../context/AppContext';

import AddBalance from '../wallet/AddBalance';

const TopBar = () => {
  const { isAuthenticated, balance, logout, user, language, setAppLanguage, t } = useAppContext();

  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="top-bar">
      <div className="top-bar-container">
        <div className="top-bar-left">
          <div className="language-select">

            <select
              id="language"
              value={language || 'en'}
              onChange={(e) => setAppLanguage(e.target.value)}
              aria-label="Select language"
              className="lang-select"
            >
              <option value="az">🇦🇿 AZ</option>
              <option value="en">🇬🇧 EN</option>
              <option value="tr">🇹🇷 TR</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="ar">🇸🇦 AR</option>
              <option value="ru">🇷🇺 RU</option>
              <option value="uz">🇺🇿 UZ</option>
            </select>
          </div>
        </div>

        <div className="top-bar-right">
          {isAuthenticated ? (
            <>
              <div className="balance-display" title={`${t('balance')}: ${balance}`}>
                <div className="coin-icon" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="var(--accent-6)" strokeWidth="1.5" />
                    <path d="M12 6V18M15 9H9M15 15H9" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="coinGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--accent)" />
                        <stop offset="1" stopColor="var(--accent)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="balance-amount">{balance}</span>
                <button className="add-balance-btn-top" onClick={() => setIsAddOpen(true)} aria-label={t('add_balance')}>+</button>

              </div>
              {/* <Link to="/profile" className="top-bar-btn profile-btn">{user?.username || 'Profile'}</Link> */}
              <button className="top-bar-btn logout-btn" onClick={logout}>{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="top-bar-btn login-btn-t">{t('login')}</Link>
              <Link to="/register" className="top-bar-btn register-btn-t">{t('register')}</Link>
            </>
          )}
        </div>
      </div>
      {isAddOpen && (
        <AddBalance
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          username={user?.username}
          walletAddress={user?.walletAddress}
        />
      )}
    </div>
  );
};

export default TopBar;