import React from 'react';
import { Link } from 'react-router-dom';
import './RequireAuth.css';
import { useAppContext } from '../../context/AppContext';

const RequireAuth = () => {
    const { t } = useAppContext();
    let click = new Audio("./Sounds/clickPageSwitch.mp3")
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
                    <h2>🎲 {t('access_required')}</h2>
                    <p>{t('access_prompt')}</p>

                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-icon">🎮</span>
                            <span className="future-text">{t('feature_play_premium')}</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💬</span>
                            <span className="future-text">{t('feature_chat_players')}</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🏆</span>
                            <span className="future-text">{t('feature_play_earn')}</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💰</span>
                            <span className="future-text">{t('feature_manage_wallet')}</span>
                        </div>
                    </div>

                    <div className="auth-buttons">
                        <Link to="/login" className="auth-btn login-btn" onClick={click.play()}>
                            {t('login')}
                        </Link>
                        <Link to="/register" className="auth-btn register-btn" onClick={click.play()}>
                            {t('register_now')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequireAuth;