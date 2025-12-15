import React from 'react';
import './TopBar.css';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const TopBar = () => {
  const { isAuthenticated, balance, logout, user } = useAppContext();

  return (
    <div className="top-bar">
      <div className="top-bar-container">
        <div className="top-bar-left">
          {/* Casino brand/name could go here */}
        </div>
        
        <div className="top-bar-right">
          {isAuthenticated ? (
            <>
              <div className="balance-display" title={`Balance: ${balance}`}>
                <div className="coin-icon" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="var(--accent-6)" strokeWidth="1.5"/>
                    <path d="M12 6V18M15 9H9M15 15H9" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="coinGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--accent)"/>
                        <stop offset="1" stopColor="var(--accent)"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="balance-amount">{balance}</span>
              </div>
              {/* <Link to="/profile" className="top-bar-btn profile-btn">{user?.username || 'Profile'}</Link> */}
              <button className="top-bar-btn logout-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="top-bar-btn login-btn-t">Login</Link>
              <Link to="/register" className="top-bar-btn register-btn-t">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;