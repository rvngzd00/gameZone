import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import './../../index.css'

const AdminDashboard = () => {
  // Sample user data
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'PlayerOne',
      email: 'playerone@gamezone.com',
      registrationDate: '2024-01-15',
      coins: 5000,
    },
    {
      id: 2,
      username: 'GoldenWinner',
      email: 'goldenwinner@gamezone.com',
      registrationDate: '2024-02-20',
      coins: 12500,
    },
    {
      id: 3,
      username: 'LuckyAce',
      email: 'luckyace@gamezone.com',
      registrationDate: '2024-03-10',
      coins: 8300,
    },
    {
      id: 4,
      username: 'CasinoKing',
      email: 'casinoking@gamezone.com',
      registrationDate: '2024-01-25',
      coins: 25000,
    },
    {
      id: 5,
      username: 'ThrillerJack',
      email: 'thrillerjack@gamezone.com',
      registrationDate: '2024-04-05',
      coins: 3500,
    },
    {
      id: 6,
      username: 'VictoryQueen',
      email: 'victoryqueen@gamezone.com',
      registrationDate: '2024-03-30',
      coins: 15750,
    },
  ]);

  const [inputValues, setInputValues] = useState({});

  // Initialize input values for each user
  useEffect(() => {
    const initial = {};
    users.forEach((user) => {
      initial[user.id] = '';
    });
    setInputValues(initial);
  }, []);

  // Update coin balance by fixed amount
  const updateCoins = (userId, amount) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, coins: Math.max(0, user.coins + amount) }
          : user
      )
    );
  };

  // Set coin balance to exact amount from input
  const setCoinsExact = (userId) => {
    const value = parseInt(inputValues[userId], 10);
    if (!isNaN(value) && value >= 0) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, coins: value } : user
        )
      );
      // Clear input after setting
      setInputValues((prev) => ({
        ...prev,
        [userId]: '',
      }));
    }
  };

  // Reset user coins to 0
  const resetCoins = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, coins: 0 } : user
      )
    );
  };

  // Handle input change
  const handleInputChange = (userId, value) => {
    setInputValues((prev) => ({
      ...prev,
      [userId]: value.replace(/[^0-9]/g, ''),
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format coin amount with commas
  const formatCoins = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>💎 ADMIN DASHBOARD</h1>
        <p>Manage player accounts and coin balances</p>
      </div>

      {/* Users Section */}
      <div className="users-section">
        <h2 className="section-title">👥 Players Management</h2>

        {users.length > 0 ? (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-id">#{user.id}</div>

                <div className="user-info">
                  <div className="username">@{user.username}</div>
                  <div className="email">{user.email}</div>
                </div>

                <div className="user-details">
                  <div className="info-row">
                    <span className="info-label">Joined:</span>
                    <span className="info-value">
                      {formatDate(user.registrationDate)}
                    </span>
                  </div>

                  <div className="coin-balance-section">
                    <label className="coin-label">💰</label>
                    <div className="coin-amount">
                      {formatCoins(user.coins)}
                    </div>
                  </div>
                </div>

                <div className="coin-controls">
                  <input
                    type="text"
                    className="coin-input"
                    placeholder="Amount"
                    value={inputValues[user.id] || ''}
                    onChange={(e) =>
                      handleInputChange(user.id, e.target.value)
                    }
                  />
                </div>

                <div className="btn-group">
                  <button
                    className="btn btn-add"
                    onClick={() => updateCoins(user.id, 100)}
                    title="Add 100 coins"
                  >
                    +100
                  </button>
                  <button
                    className="btn btn-subtract"
                    onClick={() => updateCoins(user.id, -100)}
                    title="Subtract 100 coins"
                  >
                    -100
                  </button>
                  <button
                    className="btn btn-set"
                    onClick={() => setCoinsExact(user.id)}
                    title="Set exact coin amount"
                  >
                    Set
                  </button>
                  <button
                    className="btn btn-reset"
                    onClick={() => resetCoins(user.id)}
                    title="Reset to 0 coins"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎰</div>
            <p className="empty-state-text">No players found</p>
            <p className="empty-state-subtext">
              Player data will appear here when available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
