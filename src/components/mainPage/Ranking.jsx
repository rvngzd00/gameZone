import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Ranking.css';

// API config
const API_BASE = "https://nehemiah-paginal-alan.ngrok-free.dev";
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

const Ranking = () => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyData, setWeeklyData] = useState([]);
  const [alltimeData, setAlltimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        console.log('🎯 [RANKING] Fetching leaderboard...');
        
        // Fetch both weekly and alltime data
        const [weeklyResponse, alltimeResponse] = await Promise.all([
          api.get('/api/leaderboard/all/weekly'),
          api.get('/api/leaderboard/all/alltime')
        ]);
        
        // console.log('🎯 [RANKING] Weekly Data:', weeklyResponse.data);
        // console.log('🎯 [RANKING] Alltime Data:', alltimeResponse.data);
        
        setWeeklyData(weeklyResponse.data.slice(0, 5)); // Top 5
        setAlltimeData(alltimeResponse.data.slice(0, 5)); // Top 5
        
      } catch (error) {
        console.error('❌ [RANKING] Error fetching leaderboard:', error);
        setWeeklyData([]);
        setAlltimeData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    const icons = {
      'Beginner': '🥉',
      'Bronze': '🥉',
      'Silver': '🥈',
      'Gold': '🥇',
      'Platinum': '💎',
      'Diamond': '💠',
      'Master': '👑',
      'Grandmaster': '🏆'
    };
    return icons[rank] || '🎮';
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const RankingItem = ({ player, index }) => {
    const winRate = player.totalGamesPlayed > 0
      ? ((player.totalWins / player.totalGamesPlayed) * 100).toFixed(1)
      : 0;

    return (
      <div className={`ranking-item rank-${index + 1}`}>
        <div className="rank-badge">
          {getMedalEmoji(index)}
        </div>
        
        <div className="player-avatar">
          {player.username ? player.username.charAt(0).toUpperCase() : '?'}
        </div>
        
        <div className="player-info">
          <div className="player-name">{player.username || 'Anonim'}</div>
          <div className="player-rank">
            {getRankIcon(player.currentRank)} {player.currentRank || 'Beginner'}
          </div>
        </div>
        
        <div className="player-stats">
          <div className="stat-item">
            <span className="stat-label">XP</span>
            <span className="stat-value">{player.experiencePoints || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Qazanc</span>
            <span className="stat-value stat-earnings">{(player.totalEarnings || 0).toFixed(2)} ₼</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Qalib %</span>
            <span className="stat-value stat-winrate">{winRate}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">🏆 TOP OYUNÇULAR</h2>
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === 'weekly' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            📅 Bu Həftə
          </button>
          <button
            className={`tab-button ${activeTab === 'alltime' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('alltime')}
          >
            ♾️ Bütün Vaxtlar
          </button>
        </div>
      </div>

      <div className="leaderboard-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Yüklənir...</p>
          </div>
        ) : (
          <div className="ranking-list">
            {(activeTab === 'weekly' ? weeklyData : alltimeData).length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎮</span>
                <p>Məlumat tapılmadı</p>
              </div>
            ) : (
              (activeTab === 'weekly' ? weeklyData : alltimeData).map((player, index) => (
                <RankingItem key={player.id || index} player={player} index={index} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;