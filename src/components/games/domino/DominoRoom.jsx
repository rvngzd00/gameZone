// DominoRoom.jsx
import React, { useState, useEffect } from 'react';
import './DominoRoom.css'; // Import CSS styles

const DominoRoom = ({ connection, userBalance, isConnected, onJoinRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roomName: '',
    gameType: 'Classic101',
    entryFee: 10,
    maxPlayers: 4,
    isPrivate: false,
    password: ''
  });

  useEffect(() => {
    if (connection && isConnected) {
      loadRooms();
      const interval = setInterval(loadRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [connection, isConnected]);

  const loadRooms = async () => {
    if (!connection) return;
    try {
      const roomList = await connection.invoke("GetRoomList");
      setRooms(roomList || []);
      setLoading(false);
    } catch (err) {
      console.error("Load rooms error:", err);
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId, isPrivate) => {
    if (!isConnected) {
      alert("Serverə qoşulmaq gözləyin...");
      return;
    }

    let password = null;
    if (isPrivate) {
      password = prompt("Parol:");
      if (!password) return;
    }

    onJoinRoom(roomId, password);
  };

  const handleCreateRoom = async () => {
    const { roomName, gameType, entryFee, maxPlayers, isPrivate, password } = formData;

    if (!roomName.trim()) {
      alert("Room adı daxil edin");
      return;
    }

    if (userBalance < entryFee) {
      alert(`Kifayət qədər balans yoxdur. Balans: ${userBalance}, Lazım: ${entryFee}`);
      return;
    }

    try {
      const result = await connection.invoke("CreateRoom", 
        roomName, gameType, entryFee, maxPlayers, isPrivate, password || null);

      if (result.success) {
        setShowModal(false);
        // Reset form
        setFormData({
          roomName: '',
          gameType: 'Classic101',
          entryFee: 10,
          maxPlayers: 4,
          isPrivate: false,
          password: ''
        });
        setTimeout(() => onJoinRoom(result.roomId, null), 500);
      } else {
        alert(result.message || "Room yaratmaq alınmadı");
      }
    } catch (err) {
      console.error("Create room error:", err);
      alert("Room yaratmaq alınmadı");
    }
  };

  const getBadgeClass = (room) => {
    if (room.playerCount >= room.maxPlayers) return 'badge-full';
    if (room.gameTypeName.includes('Sürətli')) return 'badge-quick';
    if (room.gameTypeName.includes('Telefon')) return 'badge-phone';
    return 'badge-101';
  };

  return (
    <div className="container">
      <div className="lobby-header">
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>🎯 Domino Rooms</h1>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
            <span className={`status-dot ${isConnected ? 'status-connected' : 'status-disconnected'}`}></span>
            <span>{isConnected ? 'Bağlı' : 'Qoşulur...'}</span> |
            Balance: <span>{userBalance}</span> coin
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            if (!isConnected) {
              alert("Serverə qoşulmaq gözləyin...");
              return;
            }
            setShowModal(true);
          }}
        >
          + Yeni Room
        </button>
      </div>

      <div className="room-grid">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <div>Rooms yüklənir...</div>
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>Heç bir room yoxdur</div>
            <div style={{ fontSize: '14px' }}>İlk Domino room-u yaradın!</div>
          </div>
        ) : (
          rooms.map(room => {
            const isFull = room.playerCount >= room.maxPlayers;
            return (
              <div
                key={room.roomId}
                className={`room-card ${isFull ? 'full' : ''}`}
                onClick={() => !isFull && !room.isGameStarted && handleJoinRoom(room.roomId, room.isPrivate)}
              >
                <div className="room-header">
                  <div className="room-name">{room.roomName}</div>
                  <span className={`room-badge ${getBadgeClass(room)}`}>
                    {room.gameTypeName}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                  Yaradıcı: {room.creatorName}
                </div>
                <div className="room-info">
                  <div>👥 {room.playerCount}/{room.maxPlayers}</div>
                  <div>💰 {room.entryFee} coin</div>
                  {room.isPrivate && <div>🔒 Private</div>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">🎯 Yeni Domino Room</div>

            <div className="form-group">
              <label className="form-label">Room Adı</label>
              <input
                type="text"
                className="form-input"
                placeholder="Məsələn: Pro Domino"
                value={formData.roomName}
                onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Oyun Növü</label>
              <select
                className="form-select"
                value={formData.gameType}
                onChange={(e) => setFormData({ ...formData, gameType: e.target.value })}
              >
                <option value="Classic101">101 - Klassik (7 daş)</option>
                <option value="Quick5">Sürətli (5 daş)</option>
                <option value="PhoneDomino">Telefon Domino</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Giriş Haqqı (coin)</label>
              <input
                type="number"
                className="form-input"
                value={formData.entryFee}
                min="1"
                onChange={(e) => setFormData({ ...formData, entryFee: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maksimum Oyunçu</label>
              <select
                className="form-select"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
              >
                <option value="2">2 Oyunçu</option>
                <option value="3">3 Oyunçu</option>
                <option value="4">4 Oyunçu</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                />
                <span className="form-label" style={{ margin: 0 }}>Private Room (Parol)</span>
              </label>
            </div>

            {formData.isPrivate && (
              <div className="form-group">
                <label className="form-label">Parol</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreateRoom}>
                Yarat
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Ləğv et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DominoRoom;