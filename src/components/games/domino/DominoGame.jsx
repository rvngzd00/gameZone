// DominoGame.jsx
import React, { useState, useEffect } from 'react';
// import confetti from 'canvas-confetti';
import './DominoGame.css'; // Import CSS styles

const showToast = (msg, success = false) => {
  const toast = document.createElement('div');
  toast.className = success ? 'toast success' : 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
};

const DominoGame = ({ connection, userBalance, roomName, onLeaveRoom }) => {
  const [gameState, setGameState] = useState({
    myHand: [],
    chainTiles: [],
    isMyTurn: false,
    leftEnd: null,
    rightEnd: null,
    stockCount: 0,
    currentRound: 1,
    currentPlayerName: '',
    statusMessage: 'Oyunçular gözlənilir...',
    statusClass: ''
  });
  const [players, setPlayers] = useState([]);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    if (!connection) return;

    // Game event handlers
    connection.on("JoinedRoom", (data) => {
      setCanStart(true);
      setGameState(prev => ({ ...prev, statusMessage: "✅ Room-a qoşuldunuz" }));
    });

    connection.on("PlayersList", (playersList) => {
      setPlayers(playersList);
    });

    connection.on("GameStarted", (data) => {
      setGameState(prev => ({
        ...prev,
        currentRound: data.round || 1,
        statusMessage: `🎮 ${data.message}`,
        statusClass: ''
      }));
      setCanStart(false);
    });

    connection.on("GameState", (state) => {
      setGameState({
        myHand: state.myHand,
        chainTiles: state.chainTiles,
        isMyTurn: state.isMyTurn,
        leftEnd: state.leftEnd,
        rightEnd: state.rightEnd,
        stockCount: state.stockCount,
        currentRound: state.currentRound || 1,
        currentPlayerName: state.currentPlayerName,
        statusMessage: state.isMyTurn ? "🎯 Sizin növbənizdir!" : `⏳ ${state.currentPlayerName} oynayır...`,
        statusClass: state.isMyTurn ? 'your-turn' : ''
      });
    });

    connection.on("TilePlaced", () => {
      // Trigger re-render for chain animation
    });

    connection.on("TileDrawn", (data) => {
      if (data.passed) {
        showToast(`⏭️ ${data.playerName} pas keçdi`);
      }
    });

    connection.on("RoundFinished", (data) => {
      setGameState(prev => ({
        ...prev,
        statusMessage: `🏆 ${data.winnerName} raund ${data.round}-u qazandı! (+${data.pointsEarned} xal) | Cəmi: ${data.currentScore}/101`,
        statusClass: 'round-end'
      }));

      // Confetti effect
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });

      let msg = `🏆 Raund ${data.round} bitdi!\n\n${data.winnerName}: +${data.pointsEarned} xal\nCəmi xal: ${data.currentScore}/101\n\n`;
      if (data.playerScores && data.playerScores.length > 0) {
        msg += "Rəqiblərin əlləri:\n";
        data.playerScores.forEach(ps => {
          msg += `${ps.name}: ${ps.handValue} xal (${ps.tiles.join(' ')})\n`;
        });
      }

      setTimeout(() => alert(msg), 1000);
    });

    connection.on("NewRoundStarted", (data) => {
      setGameState(prev => ({ ...prev, currentRound: data.round }));
      showToast(`🎮 Raund ${data.round} başladı!`, true);
    });

    connection.on("GameFinished", (data) => {
      setGameState(prev => ({
        ...prev,
        statusMessage: data.message,
        statusClass: 'game-over'
      }));

      // Multiple confetti bursts
      confetti({ particleCount: 300, spread: 100, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 200, spread: 80 }), 300);
      setTimeout(() => confetti({ particleCount: 150, spread: 60 }), 600);

      let finalMsg = `${data.message}\n\nFinal nəticələr:\n`;
      data.allScores.forEach(s => {
        finalMsg += `${s.name}: ${s.score} xal\n`;
      });

      setTimeout(() => alert(finalMsg), 1200);
    });

    connection.on("GameReset", () => {
      showToast("Yeni oyun üçün hazırlaşın...", true);
    });

    connection.on("MoveError", (msg) => showToast(msg));

    connection.on("JoinError", (msg) => {
      showToast(msg);
      setTimeout(() => onLeaveRoom(), 2000);
    });

    // Cleanup
    return () => {
      connection.off("JoinedRoom");
      connection.off("PlayersList");
      connection.off("GameStarted");
      connection.off("GameState");
      connection.off("TilePlaced");
      connection.off("TileDrawn");
      connection.off("RoundFinished");
      connection.off("NewRoundStarted");
      connection.off("GameFinished");
      connection.off("GameReset");
      connection.off("MoveError");
      connection.off("JoinError");
    };
  }, [connection, onLeaveRoom]);

  // Render domino dots based on value (0-6)
  const renderDots = (value) => {
    if (value === 0) return <div className="dots dots-0"></div>;
    const dots = Array(value).fill(0).map((_, i) => <div key={i} className="dot"></div>);
    return <div className={`dots dots-${value}`}>{dots}</div>;
  };

  // Check if a tile can be placed on the chain
  const canPlaceTile = (tile) => {
    if (gameState.chainTiles.length === 0) return true;
    return tile.left === gameState.leftEnd || tile.right === gameState.leftEnd ||
           tile.left === gameState.rightEnd || tile.right === gameState.rightEnd;
  };

  // Handle placing a tile on the table
  const handlePlaceTile = async (tile) => {
    if (!gameState.isMyTurn || !canPlaceTile(tile)) return;

    try {
      let side = 'right';

      if (gameState.chainTiles.length > 0) {
        const canLeft = tile.left === gameState.leftEnd || tile.right === gameState.leftEnd;
        const canRight = tile.left === gameState.rightEnd || tile.right === gameState.rightEnd;

        if (canLeft && !canRight) {
          side = 'left';
        } else if (!canLeft && canRight) {
          side = 'right';
        } else if (canLeft && canRight) {
          const userChoice = window.confirm(`Bu daşı SOLA qoymaq istəyirsiniz?\n\n✅ Bəli = Sola qoy\n❌ Xeyr = Sağa qoy`);
          side = userChoice ? 'left' : 'right';
        }
      }

      await connection.invoke("PlaceTile", tile.id, side);
    } catch (err) {
      showToast("Daş qoymaq alınmadı");
    }
  };

  // Handle starting the game
  const handleStartGame = async () => {
    try {
      await connection.invoke("StartGame");
    } catch (err) {
      showToast("Oyunu başlatmaq alınmadı");
    }
  };

  // Handle drawing a tile from stock
  const handleDrawTile = async () => {
    try {
      await connection.invoke("TakeFromStock");
    } catch (err) {
      showToast("Bazardan götürmək alınmadı");
    }
  };

  // Handle leaving the room
  const handleLeaveRoom = async () => {
    if (connection) {
      await connection.invoke("LeaveRoom").catch(() => {});
    }
    onLeaveRoom();
  };

  const maxScore = Math.max(...players.map(p => p.score), 0);

  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <div className="header-left">
          <div className="room-title">🎯 {roomName}</div>
          <div className="round-badge">Raund: {gameState.currentRound}</div>
          <div className="balance">💰 {userBalance} coin</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" disabled={!canStart} onClick={handleStartGame}>
            Başlat
          </button>
          <button className="btn btn-danger" onClick={handleLeaveRoom}>
            Çıx
          </button>
        </div>
      </div>

      {/* GAME LAYOUT */}
      <div className="game-layout">
        {/* LEFT SIDEBAR - Players List */}
        <div className="sidebar">
          <div className="sidebar-title">👥 Oyunçular (101-ə qədər)</div>
          <div>
            {players.map(player => {
              const isLeader = player.score === maxScore && player.score > 0;
              return (
                <div
                  key={player.name}
                  className={`player-card ${player.isCurrentTurn ? 'active' : ''} ${isLeader ? 'leader' : ''}`}
                >
                  <div className="player-name">
                    <span>{isLeader ? '👑 ' : ''}{player.name}</span>
                    <span className="player-score">{player.score}</span>
                  </div>
                  <div className="player-info">🎯 {player.tileCount} daş</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER - Game Area */}
        <div className="game-area">
          {/* Status Bar */}
          <div className={`status-bar ${gameState.statusClass}`}>
            {gameState.statusMessage}
          </div>

          {/* Table - Chain Display */}
          <div className="table">
            <div className="chain">
              {gameState.chainTiles.length === 0 ? (
                <div className="empty-table">🎯 İlk daşı qoyun</div>
              ) : (
                gameState.chainTiles.map((tile, i) => (
                  <div key={i} className="tile horizontal">
                    <div className="tile-half">{renderDots(tile.left)}</div>
                    <div className="tile-half">{renderDots(tile.right)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Hand */}
          <div className="my-hand">
            <div className="hand-title">✋ Sizin Daşlar</div>
            <div className="hand-tiles">
              {gameState.myHand.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', width: '100%' }}>
                  Oyun başlayanda daşlar görünəcək
                </div>
              ) : (
                gameState.myHand.map((tile, i) => {
                  const playable = canPlaceTile(tile);
                  return (
                    <div
                      key={i}
                      className={`tile ${gameState.isMyTurn ? (playable ? 'playable' : 'not-playable') : ''}`}
                      onClick={() => gameState.isMyTurn && playable && handlePlaceTile(tile)}
                    >
                      <div className="tile-half">{renderDots(tile.left)}</div>
                      <div className="tile-half">{renderDots(tile.right)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button
              className="action-btn draw"
              disabled={!gameState.isMyTurn}
              onClick={handleDrawTile}
            >
              🎲 Bazardan Götür
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Game Info */}
        <div className="sidebar">
          <div className="sidebar-title">📊 Məlumat</div>
          <ul className="info-list">
            <li className="info-item">
              <span className="info-label">Masa:</span>
              <span className="info-value">{gameState.chainTiles.length}</span>
            </li>
            <li className="info-item">
              <span className="info-label">Bazar:</span>
              <span className="info-value">{gameState.stockCount}</span>
            </li>
            <li className="info-item">
              <span className="info-label">Sol:</span>
              <span className="info-value">{gameState.leftEnd !== null ? gameState.leftEnd : '-'}</span>
            </li>
            <li className="info-item">
              <span className="info-label">Sağ:</span>
              <span className="info-value">{gameState.rightEnd !== null ? gameState.rightEnd : '-'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DominoGame;