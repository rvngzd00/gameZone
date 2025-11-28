import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { useAppContext } from '../../../context/AppContext';

const LotoRoom = () => {
  const navigate = useNavigate();
  const { token, user, balance } = useAppContext();

  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userBalance, setUserBalance] = useState(balance || 0);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    entryFee: 10,
    maxPlayers: 10,
    isPrivate: false,
    password: ''
  });

  // ✅ Token yoxlaması
  useEffect(() => {
    if (!token) {
      alert("❌ Token tapılmadı. Zəhmət olmasa login olun.");
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    console.log("🔗 SignalR Lobby connection başlayır...");
    
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.100.26:5063/lotoHub", {
        accessTokenFactory: () => {
          console.log("✅ Token SignalR-a göndərilir (Lobby)");
          return token;
        }
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    conn.on("UserData", (data) => {
      console.log("✅ UserData alındı:", data);
      setUserBalance(data.balance);
    });

    conn.on("RoomCreated", (room) => {
      console.log("✅ RoomCreated event:", room);
      setRooms(prev => [...prev.filter(r => r.roomId !== room.roomId), room]);
    });

    conn.on("RoomDeleted", (roomId) => {
      console.log("🗑️ RoomDeleted:", roomId);
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
    });

    conn.onreconnecting(() => {
      console.log("🔄 Reconnecting...");
      setIsConnected(false);
    });

    conn.onreconnected(() => {
      console.log("✅ Reconnected!");
      setIsConnected(true);
      loadRooms(conn);
    });

    conn.onclose(() => {
      console.log("❌ Connection closed");
      setIsConnected(false);
    });

    const startConnection = async () => {
      try {
        await conn.start();
        console.log("✅ SignalR Lobby connected!");
        setIsConnected(true);
        setConnection(conn);
        await loadRooms(conn);
      } catch (err) {
        console.error("❌ Connection error:", err);
        setIsConnected(false);
        setLoading(false);
      }
    };

    startConnection();

    return () => {
      if (conn) {
        console.log("🔌 SignalR Lobby bağlanır...");
        conn.stop();
      }
    };
  }, [token]);

  useEffect(() => {
    if (isConnected && connection) {
      const interval = setInterval(() => {
        loadRooms(connection);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected, connection]);

  const loadRooms = async (conn) => {
    try {
      console.log("📡 Loading rooms...");
      const roomsList = await conn.invoke("GetRoomList");
      console.log("✅ Rooms loaded:", roomsList);
      setRooms(roomsList || []);
      setLoading(false);
    } catch (err) {
      console.error("❌ Load rooms error:", err);
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!formData.roomName.trim()) {
      alert("Room adı daxil edin");
      return;
    }

    if (userBalance < formData.entryFee) {
      alert(`Kifayət qədər balans yoxdur. Balans: ${userBalance}, Lazım: ${formData.entryFee}`);
      return;
    }

    try {
      const result = await connection.invoke(
        "CreateRoom",
        formData.roomName,
        formData.entryFee,
        formData.maxPlayers,
        formData.isPrivate,
        formData.password || null
      );

      if (result.success) {
        setShowModal(false);
        setFormData({
          roomName: '',
          entryFee: 10,
          maxPlayers: 10,
          isPrivate: false,
          password: ''
        });

        setTimeout(() => {
          joinRoom(result.roomId, false);
        }, 500);
      } else {
        alert(result.message || "Room yaratmaq alınmadı");
      }
    } catch (err) {
      console.error("❌ Create room error:", err);
      alert("Room yaratmaq alınmadı: " + err.message);
    }
  };

  const joinRoom = (roomId, isPrivate) => {
    if (!isConnected) {
      alert("Serverə qoşulmaq gözləyin...");
      return;
    }

    let password = null;
    if (isPrivate) {
      password = prompt("Parol daxil edin:");
      if (!password) return;
    }

    const url = isPrivate
      ? `/games/loto?roomId=${roomId}&password=${encodeURIComponent(password)}`
      : `/games/loto?roomId=${roomId}`;

    navigate(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #071225 0%, #071827 100%)',
      color: '#e6eef6',
      fontFamily: 'Inter, ui-sans-serif, system-ui'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          padding: '20px',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0' }}>🎲 LOTO Rooms</h1>
            <div style={{ fontSize: '14px', color: '#9aa7b2' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                marginRight: '8px',
                background: isConnected ? '#22c55e' : '#ef4444',
                boxShadow: isConnected ? '0 0 8px #22c55e' : 'none'
              }}></span>
              <span>{isConnected ? 'Bağlı' : 'Bağlantı kəsildi'}</span> |
              Balance: <span>{userBalance}</span> coin
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!isConnected}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              opacity: isConnected ? 1 : 0.4,
              transition: 'all 0.2s'
            }}
          >
            + Yeni Room Yarat
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '15px',
          minHeight: '200px'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid rgba(255,255,255,0.1)',
                borderTopColor: '#6ee7b7',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <div>Rooms yüklənir...</div>
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#9aa7b2' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Heç bir room yoxdur</div>
              <div style={{ fontSize: '14px' }}>Birincini siz yaradın!</div>
            </div>
          ) : rooms.map(room => {
            const isFull = room.playerCount >= room.maxPlayers;
            return (
              <div
                key={room.roomId}
                onClick={() => !isFull && !room.isGameStarted && joinRoom(room.roomId, room.isPrivate)}
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.02))',
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s',
                  cursor: isFull || room.isGameStarted ? 'not-allowed' : 'pointer',
                  opacity: isFull ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isFull && !room.isGameStarted) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#6ee7b7';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(110, 231, 183, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#6ee7b7' }}>
                    {room.roomName}
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: room.isGameStarted
                      ? 'linear-gradient(135deg, #ff6b6b, #ee5a6f)'
                      : isFull
                        ? '#444'
                        : 'linear-gradient(135deg, #ffd166, #ffb703)',
                    color: room.isGameStarted || isFull ? 'white' : '#000'
                  }}>
                    {room.isGameStarted ? '▶ Oynayır' : isFull ? 'Dolu' : 'Gözləyir'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#9aa7b2', marginBottom: '8px' }}>
                  Yaradıcı: {room.creatorName}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#9aa7b2' }}>
                  <div>👥 {room.playerCount}/{room.maxPlayers}</div>
                  <div>💰 {room.entryFee} coin</div>
                  {room.isPrivate && <div>🔒 Private</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #1a2332, #0f1724)',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>
              Yeni Room Yarat
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Room Adı
              </label>
              <input
                type="text"
                value={formData.roomName}
                onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                placeholder="Məsələn: VIP Room"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#e6eef6',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Giriş Haqqı (coin)
              </label>
              <input
                type="number"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: parseInt(e.target.value) })}
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#e6eef6',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Maksimum Oyunçu
              </label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                min="2"
                max="50"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#e6eef6',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Private Room (Parol tələb olunur)</span>
              </label>
            </div>

            {formData.isPrivate && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Parol
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#e6eef6',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={createRoom}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Yarat
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  color: '#6ee7b7',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Ləğv et
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LotoRoom;