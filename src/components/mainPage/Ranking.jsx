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
        {/* Rank Badge */}
        <div className="rank-badge">
          {getMedalEmoji(index)}
        </div>
        
        {/* Player Avatar */}
        <div className="player-avatar">
          {player.username ? player.username.charAt(0).toUpperCase() : '?'}
        </div>
        
        {/* Player Info */}
        <div className="player-info">
          <div className="player-name">{player.username || 'Anonim'}</div>
          <div className="player-rank">
            {getRankIcon(player.currentRank)} {player.currentRank || 'Beginner'}
          </div>
        </div>
        
        {/* Qazanc - sadəcə rəqəm */}
        <div className="table-cell">
          <span className="cell-value earnings">
            {(player.totalEarnings || 0).toFixed(2)} 
          </span>
        </div>
        
        {/* Qalib % - sadəcə rəqəm */}
        <div className="table-cell">
          <span className="cell-value winrate">{winRate}%</span>
        </div>
        
        {/* Oyunlar - sadəcə rəqəm */}
        <div className="table-cell">
          <span className="cell-value games">{player.totalGamesPlayed || 0}</span>
        </div>
      </div>
    );
  };

  const currentData = activeTab === 'weekly' ? weeklyData : alltimeData;

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
        ) : currentData.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎮</span>
            <p>Məlumat tapılmadı</p>
          </div>
        ) : (
          <div className="ranking-list">
            {/* Table Header */}
            {/* <div className="ranking-header">
              <span>Sıra</span>
              <span>Avatar</span>
              <span>Oyunçu</span>
              <span>Qazanc</span>
              <span>Qalib %</span>
              <span>Oyunlar</span>
            </div> */}
            
            {/* Table Rows */}
            {currentData.map((player, index) => (
              <RankingItem key={player.id || index} player={player} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;