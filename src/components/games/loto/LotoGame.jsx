import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { useAppContext } from '../../../context/AppContext';

const LotoGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get('roomId');
  const passwordFromUrl = searchParams.get('password');
  
  // ✅ Context-dən token al
  const { token, user, balance } = useAppContext();

  const [connection, setConnection] = useState(null);
  const [myCard, setMyCard] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [completedRows, setCompletedRows] = useState(new Set());
  const [players, setPlayers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState('--');
  const [myBalance, setMyBalance] = useState(balance || 0);
  const [myUserName, setMyUserName] = useState(user?.username || '');
  const [myFullName, setMyFullName] = useState(user?.fullName || user?.username || '');
  const [roomName, setRoomName] = useState('');
  const [status, setStatus] = useState('Serverə qoşulur...');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [startBtnDisabled, setStartBtnDisabled] = useState(true);
  const [bingoBtnDisabled, setBingoBtnDisabled] = useState(true);

  const audioCtxRef = useRef(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // ✅ Token yoxlamağı
  useEffect(() => {
    if (!token) {
      alert("❌ Token tapılmadı. Zəhmət olmasa yenidən login olun.");
      navigate('/login');
    }
  }, [token, navigate]);

  const showError = (message) => {
    alert(message);
  };

  const playSound = (frequency, duration, type = 'sine', volume = 0.3) => {
    if (isMuted || !audioCtxRef.current) return;
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + duration);
    oscillator.start(audioCtxRef.current.currentTime);
    oscillator.stop(audioCtxRef.current.currentTime + duration);
  };

  const playBallDraw = () => {
    playSound(400, 0.08, 'sine', 0.2);
    setTimeout(() => playSound(600, 0.08, 'sine', 0.25), 50);
    setTimeout(() => playSound(800, 0.12, 'triangle', 0.3), 100);
  };

  const playMark = () => {
    playSound(1200, 0.08, 'sine', 0.2);
  };

  const playLineComplete = () => {
    playSound(523, 0.15, 'triangle', 0.3);
    setTimeout(() => playSound(659, 0.15, 'triangle', 0.3), 120);
    setTimeout(() => playSound(784, 0.2, 'triangle', 0.35), 240);
  };

  const playWin = () => {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((note, i) => {
      setTimeout(() => playSound(note, 0.3, 'sine', 0.35), i * 120);
    });
  };

  const showLinePopup = (playerName) => {
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ffcb3a 0%, #ff9a3c 100%);
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 28px;
      font-weight: bold;
      z-index: 9999;
      box-shadow: 0 10px 40px rgba(255, 203, 58, 0.6);
      color: #000;
    `;
    popup.textContent = `🎯 ${playerName} - XƏT TAMAMLANDI!`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
  };

  useEffect(() => {
    if (!roomIdFromUrl || !token) {
      showError("❌ Room ID və ya token tapılmadı");
      setTimeout(() => navigate('/games/loto'), 2000);
      return;
    }

    console.log("🔗 SignalR connection başlayır...");
    console.log("📌 Token:", token ? "Mövcuddur" : "Yoxdur");

    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.100.26:5063/lotoHub", {
        accessTokenFactory: () => {
          console.log("✅ Token SignalR-a göndərilir");
          return token;
        }
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    conn.on("UserData", (data) => {
      console.log("✅ UserData alındı:", data);
      setMyUserName(data.username);
      setMyFullName(data.fullName || data.username);
      setMyBalance(data.balance);
      setStatus(`✅ ${data.fullName || data.username}`);
    });

    conn.on("JoinedRoom", (data) => {
      console.log("✅ Room-a qoşuldu:", data);
      setRoomName(data.roomName);
      setMyCard(data.card);
      setMyBalance(data.balance);
      setStartBtnDisabled(false);
      setBingoBtnDisabled(false);
      setStatus("✅ Room-a qoşuldunuz. Oyunu başlatmaq üçün düyməyə basın.");
    });

    conn.on("NumberDrawn", (num) => {
      setCurrentNumber(num);
      setDrawnNumbers(prev => {
        if (!prev.includes(num)) {
          playBallDraw();
          return [...prev, num];
        }
        return prev;
      });
    });

    conn.on("PlayersList", (list) => {
      setPlayers(list || []);
    });

    conn.on("LineCompleted", (name) => {
      if (name !== myFullName && name !== myUserName) {
        showLinePopup(name);
      }
    });

    conn.on("GameStarted", () => {
      setCompletedRows(new Set());
      setStatus("🎮 Oyun başladı!");
      setStartBtnDisabled(true);
      setGameStarted(true);
    });

    conn.on("GameOver", (message) => {
      setGameOverMessage(message);
      setGameOver(true);
      setBingoBtnDisabled(true);
      playWin();

      setTimeout(() => {
        navigate('/games/loto');
      }, 5000);
    });

    conn.on("BalanceUpdated", (newBalance) => {
      setMyBalance(newBalance);
    });

    conn.on("JoinError", (errorMsg) => {
      console.error("❌ Join Error:", errorMsg);
      showError(errorMsg);
      setTimeout(() => navigate('/games/loto'), 2000);
    });

    conn.on("BingoError", (errorMsg) => {
      showError(errorMsg);
    });

    conn.on("GameReset", () => {
      navigate('/games/loto');
    });

    conn.on("PlayerJoined", (name) => {
      console.log(`✅ ${name} joined`);
    });

    conn.on("PlayerLeft", (name) => {
      console.log(`❌ ${name} left`);
    });

    conn.on("LeftRoom", () => {
      navigate('/games/loto');
    });

    conn.onreconnecting(() => {
      setStatus("🔄 Yenidən qoşulur...");
    });

    conn.onreconnected(() => {
      setStatus("✅ Yenidən qoşuldu");
      conn.invoke("JoinRoom", roomIdFromUrl, passwordFromUrl || null).catch(() => { });
    });

    conn.onclose(() => {
      setStatus("❌ Əlaqə kəsildi");
    });

    const startConnection = async () => {
      try {
        await conn.start();
        console.log("✅ SignalR qoşuldu!");
        setConnection(conn);
        await conn.invoke("JoinRoom", roomIdFromUrl, passwordFromUrl || null);
      } catch (err) {
        console.error("❌ Connection error:", err);
        showError("Serverə qoşulmaq alınmadı: " + err.message);
        setTimeout(() => navigate('/games/loto'), 2000);
      }
    };

    startConnection();

    return () => {
      if (conn) {
        console.log("🔌 SignalR bağlanır...");
        conn.stop();
      }
    };
  }, [roomIdFromUrl, passwordFromUrl, token, navigate]);

  useEffect(() => {
    if (myCard && drawnNumbers.length > 0) {
      checkAllRows();
    }
  }, [drawnNumbers, myCard]);

  const checkRowCompletion = (rowIndex) => {
    if (!myCard || completedRows.has(rowIndex)) return;

    let allMarked = true;
    let hasNumbers = false;

    for (let c = 0; c < 9; c++) {
      const val = myCard[rowIndex][c];
      if (val !== null) {
        hasNumbers = true;
        if (!drawnNumbers.includes(val)) {
          allMarked = false;
          break;
        }
      }
    }

    if (hasNumbers && allMarked) {
      setCompletedRows(prev => new Set([...prev, rowIndex]));
      playLineComplete();
      showLinePopup(myFullName || myUserName);

      if (connection) {
        connection.invoke("LineCompleted", rowIndex).catch(err => {
          console.error("LineCompleted error:", err);
        });
      }
    }
  };

  const checkAllRows = () => {
    for (let r = 0; r < 3; r++) {
      checkRowCompletion(r);
    }
  };

  const handleStartGame = async () => {
    if (connection) {
      try {
        await connection.invoke("StartGame");
        setStartBtnDisabled(true);
      } catch (err) {
        console.error("StartGame error:", err);
        showError("Oyunu başlatmaq alınmadı");
      }
    }
  };

  const handleBingo = () => {
    if (connection) {
      connection.invoke("Bingo").catch(err => {
        console.error("Bingo error:", err);
      });
    }
  };

  const handleBackToLobby = async () => {
    if (connection) {
      await connection.invoke("LeaveRoom").catch(() => { });
    }
    navigate('/games/loto');
  };

  const renderCard = () => {
    if (!myCard) return null;

    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 9; c++) {
        const val = myCard[r][c];
        const isMarked = val !== null && drawnNumbers.includes(val);
        const isBlank = val === null;

        cells.push(
          <div
            key={`${r}-${c}`}
            style={{
              height: '38px',
              borderRadius: '8px',
              background: isBlank
                ? 'transparent'
                : isMarked
                  ? 'linear-gradient(180deg,#6ee7b7,#2dd4bf)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.02))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: isMarked ? '#042822' : '#9aa7b2',
              fontSize: '14px',
              transition: 'all 0.24s ease',
              transform: isMarked ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: isMarked ? '0 6px 18px rgba(45,212,191,0.12)' : 'none'
            }}
          >
            {isBlank ? '' : val}
          </div>
        );
      }
    }

    return cells;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #071225 0%, #071827 100%)',
      color: '#e6eef6',
      fontFamily: 'Inter, ui-sans-serif, system-ui',
      padding: '28px 22px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 6px 30px rgba(2,6,23,0.6)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>🎲 LOTO GAME</div>
              <div style={{ fontSize: '14px', color: '#9aa7b2' }}>📍 {roomName}</div>
              {myBalance > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💰 {myBalance} coin
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartGame}
                disabled={startBtnDisabled}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.03)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#9aa7b2',
                  cursor: startBtnDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  opacity: startBtnDisabled ? 0.5 : 1
                }}
              >
                Oyunu Başlat
              </button>
              <button
                onClick={handleBingo}
                disabled={bingoBtnDisabled}
                style={{
                  background: 'linear-gradient(135deg, #6ee7b7, #2dd4bf)',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: '#042822',
                  cursor: bingoBtnDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  opacity: bingoBtnDisabled ? 0.5 : 1
                }}
              >
                🎯 LOTO
              </button>
              <button
                onClick={handleBackToLobby}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                ← Lobbiyə Qayıt
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.03)',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  color: '#9aa7b2',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.03))',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '14px',
            display: 'flex',
            gap: '14px',
            alignItems: 'center'
          }}>
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ fontSize: '12px', color: '#9aa7b2', marginBottom: '6px' }}>Son çəkilən</div>
              <div style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                fontWeight: '700',
                background: 'linear-gradient(180deg,#ffd166,#ffb703)',
                color: '#08121b',
                boxShadow: '0 10px 30px rgba(255,177,7,0.12)',
                position: 'relative'
              }}>
                {currentNumber}
              </div>
            </div>

            <div style={{ flex: '1 1 auto' }}>
              <div style={{ fontSize: '12px', color: '#9aa7b2', marginBottom: '6px' }}>Keçmiş nömrələr</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', maxWidth: '560px' }}>
                {drawnNumbers.slice(-20).reverse().map((num, index) => (
                  <div
                    key={num}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: index === 0
                        ? 'linear-gradient(135deg, #ffd166, #ffb703)'
                        : 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      color: index === 0 ? '#08121b' : '#9aa7b2',
                      transform: index === 0 ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '12px' }}>
            {myCard && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))',
                padding: '14px',
                borderRadius: '12px',
                width: '460px',
                boxShadow: '0 6px 18px rgba(2,6,23,0.45)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700' }}>✨ Sənin Kartın</div>
                  <div style={{ fontSize: '13px', color: '#9aa7b2' }}>15 nömrə</div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(9, 1fr)',
                  gap: '6px'
                }}>
                  {renderCard()}
                </div>
              </div>
            )}

            <div style={{ flex: '1', minWidth: '220px' }}>
              <div style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))',
                padding: '14px',
                borderRadius: '12px'
              }}>
                <div style={{ fontWeight: '700', marginBottom: '8px' }}>📋 Qaydalar</div>
                <div style={{ fontSize: '13px', color: '#9aa7b2', lineHeight: '1.6' }}>
                  • <strong>Giriş haqqı:</strong> 10 coin<br />
                  • <strong>Xətt mükafatı:</strong> 10 coin<br />
                  • <strong>Bingo qalibi:</strong> 50 coin<br />
                  • Kart: 3 sətr × 9 sütun (15 nömrə)<br />
                  • Server avtomatik 1-90 arası nömrə çəkir
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside style={{
          padding: '12px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.02))',
          borderRadius: '12px',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: '700' }}>👥 Oyunçular</div>
            <div style={{ fontSize: '13px', color: '#9aa7b2' }}>{players.length}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {players.map((player, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg,#ffd166,#ffb703)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#07121b',
                  fontWeight: '800'
                }}>
                  {(player[0] || '?').toUpperCase()}
                </div>
                <div style={{ flex: '1' }}>
                  <div style={{ fontWeight: '700' }}>{player}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '13px', color: '#9aa7b2', marginTop: '8px' }}>
            <div style={{ fontWeight: '700', marginBottom: '6px' }}>Status</div>
            <div>{status}</div>
          </div>
        </aside>
      </div>

      {gameOver && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          zIndex: 2000,
          color: '#fff',
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</div>
          <div>{gameOverMessage}</div>
        </div>
      )}
    </div>
  );
};

export default LotoGame;