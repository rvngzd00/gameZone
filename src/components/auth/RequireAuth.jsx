import React from 'react';
import { Link } from 'react-router-dom';
import './RequireAuth.css';

const RequireAuth = () => {
    return (
        <div className="require-auth-container" style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <div className="require-auth-card">
                <div className="card-content">
                    <h2>🎲 Access Required</h2>
                    <p>To access exclusive features and join the game, please log in or create an account.</p>

                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-icon">🎮</span>
                            <span className="future-text">Play Premium Games</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💬</span>
                            <span className="future-text">Chat with Players</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🏆</span>
                            <span className="future-text">Play and Earn Coins</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💰</span>
                            <span className="future-text">Manage Your Wallet</span>
                        </div>
                    </div>

                    <div className="auth-buttons">
                        <Link to="/login" className="auth-btn login-btn">
                            Login
                        </Link>
                        <Link to="/register" className="auth-btn register-btn">
                            Register Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequireAuth;