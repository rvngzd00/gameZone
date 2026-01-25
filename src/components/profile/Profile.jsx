
import React, { useState } from 'react';
import './Profile.css';
import profilePhoto from '../../assets/game-images/profilePhoto.png';
import { useAppContext } from '../../context/AppContext';

import EditProfile from "./EditProfile"

const Profile = () => {
    // // Mock data - replace with real data from your context/API
    const profileData = {
        username: "fUCKERtOFIQ31",
        // level: 31,
        coins: 316972,
        gamesPlayed: 69,
        // achievements: [
        //     { id: 1, name: "First Win", icon: "🏆", description: "Won your first game" },
        //     { id: 2, name: "High Roller", icon: "💰", description: "Won 1000 coins in a single game" },
        //     { id: 3, name: "Streak Master", icon: "🔥", description: "Won 5 games in a row" }
        // ],
        recentGames: [
            { id: 1, game: "Poker", result: "Win", coins: "+500", date: "2h ago" },
            { id: 2, game: "Blackjack", result: "Win", coins: "+300", date: "5h ago" },
            { id: 3, game: "Dominoes", result: "Loss", coins: "-200", date: "8h ago" }
        ]
    };
    const { isAuthenticated, balance, logout, user, saveProfileSelection, t, profileImage, recentGames } = useAppContext();
    const gamesPlayed = (recentGames && recentGames.length) ? recentGames.length : profileData.gamesPlayed;
    const [showEdit, setShowEdit] = useState(false);
    return (
        <div className="container">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-frame">
                            {/* <span className="level-badge">{profileData.level}</span> */}
                            <div className="avatar-image">
                                <img
                                    src={profileImage || profilePhoto}
                                    alt="Profile"
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = profilePhoto; }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="profile-info">
                        <h1>{user?.username || t('loading')}</h1>
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-icon">🎲</span>
                                <span className="stat-value">{gamesPlayed}</span>
                                <span className="stat-label">{t('games')}</span>
                            </div>
                            {/* <div className="stat-item">
                                <span className="stat-icon">⚡</span>
                                <span className="stat-value">{profileData.winRate}</span>
                                <span className="stat-label">Win Rate</span>
                            </div> */}
                            <div className="stat-item">
                                <span className="stat-icon">🪙</span>
                                <span className="stat-value">{balance}</span>
                                <span className="stat-label">{t('coins')}</span>
                            </div>
                        </div>
                        <button className="profile-action-btn edit-btn" onClick={() => setShowEdit(true)}>
                            {t('edit_profile')}
                        </button>
                    </div>
                </div>

                {/* <div className="profile-content"> */}
                {/* <div className="profile-section achievements-section">
                        <h2>Achievements</h2>
                        <div className="achievements-grid">
                            {profileData.achievements.map(achievement => (
                                <div key={achievement.id} className="achievement-card">
                                    <span className="achievement-icon">{achievement.icon}</span>
                                    <h3>{achievement.name}</h3>
                                    <p>{achievement.description}</p>
                                </div>
                            ))}
                        </div>
                    </div> */}

                <div className="profile-section recent-games-section">
                    <h2>{t('recent_games')}</h2>
                    <div className="games-history">
                        {(recentGames && recentGames.length ? recentGames : profileData.recentGames).map(game => (
                            <div key={game.id} className="game-history-item">
                                <div className="game-info">
                                    <span className="game-name">{game.game}</span>
                                    <span className="game-date">{game.date}</span>
                                </div>
                                <div className="game-result">
                                    <span className={`result-badge ${game.result.toLowerCase()}`}>
                                        {game.result === 'Win' ? t('win') : game.result === 'Loss' ? t('loss') : game.result}
                                    </span>
                                    <span className={`coins ${(String(game.coins || '').startsWith('+')) ? 'positive' : 'negative'}`}>
                                        {game.coins}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* </div> */}

                <div className="profile-actions">

                    <button className="profile-action-btn history-btn">
                        {t('full_history')}
                    </button>
                </div>

                {showEdit && (
                    <div className="modal-overlay" onClick={() => setShowEdit(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowEdit(false)}>×</button>
                            <EditProfile onSave={({ profileNo, imageSrc }) => {
                                // persist selection in context and close modal
                                saveProfileSelection(profileNo, imageSrc);
                                setShowEdit(false);
                            }} onCancel={() => setShowEdit(false)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
