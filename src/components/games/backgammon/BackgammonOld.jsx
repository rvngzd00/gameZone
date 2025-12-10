import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAppContext } from '../../../context/AppContext'; // AppContext-dən token çəkmək üçün

import './Backgammon.css';



// ==================== BACKGAMMON GAME ====================
function BackgammonGame() {
    const { user, balance, token, updateBalance } = useAppContext();

    // SignalR Connection
    const [connection, setConnection] = useState(null);
    const [connected, setConnected] = useState(false);

    // Game State
    const [view, setView] = useState('lobby');
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [myColor, setMyColor] = useState(null);
    const [myName, setMyName] = useState(user?.username || 'Player');
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [gameBoard, setGameBoard] = useState({
        points: {},
        bar: { white: 0, black: 0 },
        home: { white: 0, black: 0 }
    });
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [dice, setDice] = useState([null, null]);
    const [showDice, setShowDice] = useState(false);
    const [rollingDice, setRollingDice] = useState([false, false]);
    const [displayDice, setDisplayDice] = useState([1, 1]);
    const [betAmount, setBetAmount] = useState(0);
    const [player1, setPlayer1] = useState({ name: 'Oyunçu 1', avatar: '?' });
    const [player2, setPlayer2] = useState({ name: 'Oyunçu 2', avatar: '?' });
    useEffect(() => {
        console.log("myName changed →", myName);
    }, [myName]);
    // UI State
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeQuickPanel, setActiveQuickPanel] = useState(null);
    const [emojiPopup, setEmojiPopup] = useState({ show: false, player: null, tab: 'emoji' });
    const [playerEmojis, setPlayerEmojis] = useState({ player1: null, player2: null });

    const messagesEndRef = useRef(null);
    const notificationTimerRef = useRef(null);

    // ==================== SignalR Setup ====================
    useEffect(() => {
        if (!token) return;

        const conn = new signalR.HubConnectionBuilder()
            .withUrl("https://nehemiah-paginal-alan.ngrok-free.dev/backgammonhub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();
        console.log("SignalR connection objesi:", conn);
        console.log("Başlanğıc state:", conn.state);
        conn.start()
            .then(() => {
                console.log("✅ SignalR Connected");
                setConnected(true);
                setConnection(conn);
            })
            .catch(err => {
                console.error("❌ SignalR Error:", err);
                showNotification('Bağlantı xətası!', 'error');
            });

        return () => {
            if (conn) conn.stop();
        };
    }, [token]);

    // ==================== SignalR Event Handlers ====================
    useEffect(() => {
        if (!connection) return;

        connection.on("UserData", (data) => {
            console.log("Received UserData:", data);
            setMyName(data.username);
            updateBalance(data.balance);
        });

        connection.on("ChatMessage", (data) => {
            const isOwn = data.sender === myName;
            setChatMessages(prev => [...prev, {
                sender: data.sender,
                message: data.message,
                isOwn,
                time: new Date()
            }]);
            if (!chatOpen && !isOwn) {
                setUnreadCount(prev => prev + 1);
            }
        });

        connection.on("QuickEmoji", (data) => {
            displayPlayerEmoji(data.sender, data.emoji);
        });

        connection.on("QuickMessage", (data) => {
            displayPlayerQuickMessage(data.sender, data.message);
        });

        connection.on("BackgammonRoomCreated", () => {
            refreshRooms();
        });

        connection.on("JoinedRoom", (data) => {
            setCurrentRoom(data.roomId);
            setMyColor(data.color);
            setBetAmount(data.betAmount);
            setView('game');

            if (data.color === 'white') {
                setPlayer1({ name: myName, avatar: myName.charAt(0).toUpperCase() });
            } else {
                setPlayer2({ name: myName, avatar: myName.charAt(0).toUpperCase() });
            }

            if (data.waitingForOpponent) {
                showNotification(`⏳ Rəqib gözlənilir... (${data.color === 'white' ? '⚪ Ağ' : '⚫ Qara'})`, 'info');
            }
        });

        connection.on("PlayerJoined", (data) => {
            console.log("PlayerJoined data:", data);
            showNotification(`${data.username} qoşuldu! Oyun başlayır...`, 'info');
            updatePlayerInfo(data.name, data.color);
        });

        connection.on("OpponentInfo", (data) => {
            updatePlayerInfo(data.name, data.color);
        });

        connection.on("GameStarting", (data) => {
            showNotification(
                `${data.player1.name} atdı ${data.player1.dice} 🎲\n${data.player2.name} atdı ${data.player2.dice} 🎲\n\n🏁 ${data.starter} başlayır!`,
                'success'
            );
        });

        connection.on("GameStarted", (data) => {
            setIsMyTurn(data.isMyTurn);
            setGameBoard(data.board || { points: {}, bar: { white: 0, black: 0 }, home: { white: 0, black: 0 } });
            showNotification(data.message || 'Oyun başladı!', 'success');
        });

        connection.on("DiceRolled", (data) => {
            setDice(data.dice);
            setShowDice(true);
            setRollingDice([true, true]);
            
            // Zarları 1.2 saniye boyunca döndürelim (daha gerçekçi)
            setTimeout(() => {
                setDisplayDice(data.dice);
                setRollingDice([false, false]);
            }, 1200);
            
            showNotification(`🎲 Zər: ${data.dice.join('-')}`, 'info');
        });

        connection.on("PieceMoved", (data) => {
            setGameBoard(data.board);
            setSelectedPoint(null);

            const moveText = data.fromPoint === 0 ? `BAR → ${data.toPoint}` :
                (data.toPoint < 1 || data.toPoint > 24) ? `${data.fromPoint} → HOME 🏠` :
                    `${data.fromPoint} → ${data.toPoint}`;

            showNotification(`♟️ ${moveText}`, 'success');
        });

        
                connection.on("TurnChanged", (data) => {
            console.log("TurnChanged received:", data);
            console.log("My name:", myName, "Current player:", data.currentPlayer);
            console.log("Comparing:", {
                dataCurrentPlayer: data.currentPlayer,
                myNameState: myName,
                areEqual: data.currentPlayer === myName,
                dataType: typeof data.currentPlayer,
                myNameType: typeof myName
            });
            
            // ƏSAS DÜZƏLİŞ: username və fullName hər ikisinə bax
            const isMyTurnNow = data.currentPlayer === myName || 
                                data.currentPlayer === user?.username || 
                                data.currentPlayer === user?.fullName;
            
            console.log("Is my turn now?", isMyTurnNow);
            
            setIsMyTurn(isMyTurnNow);
            setShowDice(false);
            setSelectedPoint(null);
            
            if (isMyTurnNow) {
                showNotification('🎯 Sizin növbənizdir!', 'info');
            } else {
                showNotification('⏳ Rəqibin növbəsidir...', 'info');
            }
        });

        connection.on("GameEnded", (data) => {
            showNotification(data.message, 'success');
            setTimeout(() => window.location.reload(), 4000);
        });

        connection.on("Error", (msg) => showNotification(msg, 'error'));
        connection.on("JoinError", (msg) => showNotification(msg, 'error'));

        return () => {
            connection.off("UserData");
            connection.off("ChatMessage");
            connection.off("QuickEmoji");
            connection.off("QuickMessage");
            connection.off("BackgammonRoomCreated");
            connection.off("JoinedRoom");
            connection.off("PlayerJoined");
            connection.off("OpponentInfo");
            connection.off("GameStarting");
            connection.off("GameStarted");
            connection.off("DiceRolled");
            connection.off("PieceMoved");
            connection.off("TurnChanged");
            connection.off("GameEnded");
            connection.off("Error");
            connection.off("JoinError");
        };
    }, [connection, myName, chatOpen]);

    // ==================== Auto-scroll Chat ====================
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // ==================== Chat Badge Reset ====================
    useEffect(() => {
        if (chatOpen) setUnreadCount(0);
    }, [chatOpen]);

    // ==================== Refresh Rooms ====================
    useEffect(() => {
        if (connected && view === 'lobby') {
            refreshRooms();
            const interval = setInterval(refreshRooms, 3000);
            return () => clearInterval(interval);
        }
    }, [connected, view]);

    // ==================== Helper Functions ====================
    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
        notificationTimerRef.current = setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const updatePlayerInfo = (name, color) => {
        if (color === 'white') {
            setPlayer1({ name, avatar: name.charAt(0).toUpperCase() });
        } else {
            setPlayer2({ name, avatar: name.charAt(0).toUpperCase() });
        }
    };

    const displayPlayerEmoji = (sender, emoji) => {
        const playerKey = sender === player1.name ? 'player1' : 'player2';
        setPlayerEmojis(prev => ({ ...prev, [playerKey]: emoji }));
        setTimeout(() => {
            setPlayerEmojis(prev => ({ ...prev, [playerKey]: null }));
        }, 2000);
    };

    const displayPlayerQuickMessage = (sender, message) => {
        const playerKey = sender === player1.name ? 'player1' : 'player2';
        setPlayerEmojis(prev => ({ ...prev, [playerKey]: message }));
        setTimeout(() => {
            setPlayerEmojis(prev => ({ ...prev, [playerKey]: null }));
        }, 3000);
    };

    const refreshRooms = async () => {
        if (!connection) return;
        try {
            const roomsList = await connection.invoke("GetAvailableRooms");
            setRooms(roomsList || []);
        } catch (err) {
            console.error("GetAvailableRooms error:", err);
        }
    };

    const quickMatch = async (amount) => {
        if (!connection) return;
        try {
            showNotification(`⏳ ${amount} coin mərc üçün otaq axtarılır...`, 'info');
            await connection.invoke("QuickMatch", amount);
        } catch (err) {
            console.error("QuickMatch error:", err);
            showNotification('Xəta baş verdi!', 'error');
        }
    };

    const rollDice = async () => {
        if (!isMyTurn || !connection) return;
        try {
            await connection.invoke("RollDice");
        } catch (err) {
            console.error("RollDice error:", err);
        }
    };

    const movePiece = async (from, to) => {
        if (!connection) return;
        try {
            await connection.invoke("MovePiece", from, to);
        } catch (err) {
            console.error("MovePiece error:", err);
            setSelectedPoint(null);
        }
    };

    const endTurn = async () => {
        if (!connection) return;
        try {
            await connection.invoke("EndTurn");
        } catch (err) {
            console.error("EndTurn error:", err);
        }
    };

    const leaveGame = async () => {
        if (!window.confirm('Oyundan çıxmaq istədiyinizə əminsiniz?')) return;
        if (!connection) return;
        try {
            await connection.invoke("LeaveRoom");
            window.location.reload();
        } catch (err) {
            console.error("LeaveRoom error:", err);
            window.location.reload();
        }
    };

    const bearOff = async () => {
        if (!isMyTurn) {
            showNotification('Sizin növbəniz deyil!', 'error');
            return;
        }
        if (selectedPoint === null) {
            showNotification('❌ Əvvəlcə daş seçin!', 'error');
            return;
        }
        const homeTo = myColor === 'white' ? 0 : 25;
        try {
            await connection.invoke("MovePiece", selectedPoint, homeTo);
            setSelectedPoint(null);
        } catch (err) {
            console.error("Bear off error:", err);
            showNotification('HOME-a çıxarıla bilmədi!', 'error');
            setSelectedPoint(null);
        }
    };

    const handlePointClick = (pointNum) => {
        if (!isMyTurn) {
            showNotification('Sizin növbəniz deyil!', 'error');
            return;
        }

        const points = gameBoard.points || {};
        const bar = gameBoard.bar || {};

        if (bar[myColor] && bar[myColor] > 0) {
            showNotification('❌ Əvvəlcə BAR-dan hərəkət etməlisiniz!', 'error');
            return;
        }

        if (selectedPoint === null || selectedPoint === pointNum) {
            if (points[pointNum.toString()] && points[pointNum.toString()].includes(myColor)) {
                setSelectedPoint(pointNum);
                showNotification(`✅ Seçildi: Nöqtə ${pointNum}`, 'info');
            } else {
                showNotification('Bu nöqtədə sizin daşınız yoxdur!', 'error');
            }
        } else {
            movePiece(selectedPoint, pointNum);
        }
    };

    const handleBarClick = (color) => {
        if (!isMyTurn) {
            showNotification('Sizin növbəniz deyil!', 'error');
            return;
        }
        if (color !== myColor) {
            showNotification('Bu sizin daşınız deyil!', 'error');
            return;
        }
        const bar = gameBoard.bar || {};
        if (!bar[color] || bar[color] === 0) {
            showNotification('BAR-da daşınız yoxdur!', 'error');
            return;
        }
        setSelectedPoint(0);
        showNotification(`✅ BAR seçildi (${color === 'white' ? '19-24-ə' : '1-6-ya'} daxil olmalı)`, 'info');
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || !currentRoom || !connection) return;
        try {
            await connection.invoke("SendChatMessage", currentRoom, chatInput.trim());
            setChatInput('');
        } catch (err) {
            console.error("Send error:", err);
        }
    };

    const sendQuickChatMessage = async (msg) => {
        if (!currentRoom || !connection) return;
        try {
            await connection.invoke("SendChatMessage", currentRoom, msg);
        } catch (err) {
            console.error("Quick message error:", err);
        }
    };

    const sendQuickEmoji = async (emoji) => {
        if (!currentRoom || !connection) return;
        try {
            await connection.invoke("SendQuickEmoji", currentRoom, emoji);
            setEmojiPopup({ show: false, player: null, tab: 'emoji' });
        } catch (err) {
            console.error("SendQuickEmoji error:", err);
        }
    };

    const sendQuickMessage = async (message) => {
        if (!currentRoom || !connection) return;
        try {
            await connection.invoke("SendQuickMessage", currentRoom, message);
            setEmojiPopup({ show: false, player: null, tab: 'emoji' });
        } catch (err) {
            console.error("SendQuickMessage error:", err);
        }
    };

    // ==================== RENDER ====================
    return (
        <div className="container">
            {/* Notification */}
            {notification.show && (
                <div className={`notification-toast ${notification.type} show`}>
                    <div className="notification-content">
                        <div dangerouslySetInnerHTML={{ __html: notification.message.replace(/\n/g, '<br>') }} />
                    </div>
                </div>
            )}

            {/* Premium Header */}
            {/* <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">🎲</div>
          <div className="brand-text">
            <h1>TAVLA ROYALE</h1>
            <p>Premium Multiplayer Experience</p>
          </div>
        </div>
        <div className="header-user">
          <div className="user-card">
            <div className="user-avatar-header">{myName.charAt(0).toUpperCase()}</div>
            <div className="user-meta">
              <div className="user-name">{myName}</div>
              <div className="user-balance">
                <span className="balance-icon">💰</span>
                <span className="balance-value">${balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header> */}

            {/* Chat Toggle Button */}
            {/* {!chatOpen && (
        <button className="chat-toggle-btn" onClick={() => setChatOpen(true)}>
          <span className="chat-icon">💬</span>
          {unreadCount > 0 && <span className="chat-badge-count">{unreadCount}</span>}
        </button>
      )} */}

            {/* Premium Chat Panel */}
            {chatOpen && (
                <div className="chat-panel-premium">
                    {/* <div className="chat-panel-header">
            <div className="chat-panel-title">
              <span className="chat-icon-header">💬</span>
              <h3>Live Chat</h3>
            </div>
            <button className="chat-panel-close" onClick={() => setChatOpen(false)}>✕</button>
          </div> */}

                    {/* <div className="chat-messages-container">
            {chatMessages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="empty-icon">💭</div>
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message-item ${msg.isOwn ? 'own' : 'other'}`}>
                  <div className="message-bubble">
                    <div className="message-sender-name">{msg.sender}</div>
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">
                      {msg.time.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div> */}

                    {/* Quick Actions */}
                    {activeQuickPanel === 'emoji' && (
                        <div className="quick-panel-content">
                            <div className="emoji-picker-grid">
                                {['😊', '😂', '❤️', '👍', '🙏', '🔥', '✨', '🎉', '👏', '💯', '🤔', '😍'].map(emoji => (
                                    <button key={emoji} className="emoji-picker-btn" onClick={() => setChatInput(prev => prev + emoji)}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Messages */}
                    {activeQuickPanel === 'messages' && (
                        <div className="quick-panel-content">
                            <div className="quick-message-grid">
                                {[
                                    'Salam! 👋', 'Uğurlar! 🍀', 'Yaxşı oyun! 🎯', 'Təşəkkürlər 🙏',
                                    'Gözəl! 👏', 'Ups... 😅', 'Diqqətli! 🤔', 'GG! 🎊'
                                ].map(msg => (
                                    <button key={msg} className="quick-msg-preset-btn" onClick={() => sendQuickChatMessage(msg)}>
                                        {msg}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Input Area */}
                    <div className="chat-input-section">
                        <div className="chat-tools-bar">
                            <button
                                className={`chat-tool-btn ${activeQuickPanel === 'emoji' ? 'active' : ''}`}
                                onClick={() => setActiveQuickPanel(activeQuickPanel === 'emoji' ? null : 'emoji')}
                                title="Emojis"
                            >
                                😊
                            </button>
                            <button
                                className={`chat-tool-btn ${activeQuickPanel === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveQuickPanel(activeQuickPanel === 'messages' ? null : 'messages')}
                                title="Quick Messages"
                            >
                                💬
                            </button>
                        </div>
                        <div className="chat-input-wrapper">
                            <input
                                type="text"
                                className="chat-input-field"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                placeholder="Type a message..."
                                maxLength={200}
                            />
                            <button className="chat-send-btn" onClick={sendChatMessage}>
                                <span className="send-icon">⏎</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LOBBY VIEW */}
            {view === 'lobby' && (
                <div className="lobby-container">
                    <div className="lobby-content">
                        {/* Quick Match Section */}
                        <section className="quick-match-section">
                            <div className="section-header">
                                <div className="section-icon">⚡</div>
                                <div>
                                    <h2>Quick Match</h2>
                                    <p>Select your bet and find an opponent instantly</p>
                                </div>
                            </div>

                            <div className="bet-options-grid">
                                {[50, 100, 200, 500].map(amount => (
                                    <button
                                        key={amount}
                                        className="bet-option-btn"
                                        onClick={() => quickMatch(amount)}
                                    >
                                        <span className="bet-amount">{amount}</span>
                                        <span className="bet-label">💰</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                className="vip-match-btn"
                                onClick={() => quickMatch(1000)}
                            >
                                <span className="vip-badge">VIP</span>
                                <span className="vip-amount">1000 💰</span>
                            </button>
                        </section>

                        {/* Active Rooms Section */}
                        <section className="active-rooms-section">
                            <div className="section-header">
                                <div className="section-icon">📋</div>
                                <div>
                                    <h2>Active Games</h2>
                                    <p>{rooms.length} game{rooms.length !== 1 ? 's' : ''} available</p>
                                </div>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="no-rooms-state">
                                    <div className="no-rooms-icon">🎮</div>
                                    <p>No active games right now</p>
                                    <small>Start a quick match to find an opponent</small>
                                </div>
                            ) : (
                                <div className="rooms-list">
                                    {rooms.map(room => (
                                        <div key={room.roomId} className={`room-item ${room.isAvailable ? 'available' : 'playing'}`}>
                                            <div className="room-info">
                                                <h4 className="room-name">{room.roomName}</h4>
                                                <div className="room-meta">
                                                    <span className="room-bet">💰 {room.betAmount}</span>
                                                    <span className={`room-status ${room.isAvailable ? 'open' : 'active'}`}>
                                                        {room.isAvailable ? `Open (${room.playerCount}/2)` : 'Playing'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}

            {/* GAME VIEW */}
            {view === 'game' && (
                <div className="game-view-container">


                    {/* Players Status Bar */}
                    <div className="players-status-bar">
                        {/* Player 1 (White) */}
                        <div className={`player-status-card player-white ${(myColor === 'white' ? isMyTurn : !isMyTurn) ? 'active-turn' : ''}`}>
                            <div className="player-status-info">
                                <h3>{player1.name}</h3>
                                <div className="player-status-meta">
                                    <span className="player-stone">
                                        ⚪ <span className="stone-text">White</span>
                                    </span>
                                    <span className="player-home"><span className='home-icon-bg'>🏠</span> {gameBoard.home?.white || 0}/15</span>
                                </div>
                            </div>

                            {/* ƏSAS DƏYİŞİKLİK: Yalnız player1 cari oyunçudursa düyməni göstər */}
                            {player1.name === myName && (
                                <div className="player-action-zone">
                                    <button
                                        className="player-emoji-action-btn"
                                        onClick={() => setEmojiPopup({
                                            show: emojiPopup.player === 'player1' ? !emojiPopup.show : true,
                                            player: 'player1',
                                            tab: 'emoji'
                                        })}
                                        title="Send emoji or quick message"
                                    >
                                        💬
                                    </button>
                                    {emojiPopup.show && emojiPopup.player === 'player1' && (
                                        <div className="emoji-action-popup">
                                            <div className="emoji-popup-nav">
                                                <button
                                                    className={`emoji-nav-btn ${emojiPopup.tab === 'emoji' ? 'active' : ''}`}
                                                    onClick={() => setEmojiPopup(prev => ({ ...prev, tab: 'emoji' }))}
                                                >
                                                    😊
                                                </button>
                                                <button
                                                    className={`emoji-nav-btn ${emojiPopup.tab === 'message' ? 'active' : ''}`}
                                                    onClick={() => setEmojiPopup(prev => ({ ...prev, tab: 'message' }))}
                                                >
                                                    💬
                                                </button>
                                            </div>
                                            {emojiPopup.tab === 'emoji' ? (
                                                <div className="emoji-picker">
                                                    {['👋', '😊', '😂', '❤️', '👍', '👏', '🙏', '🔥', '✨', '🎉', '💯', '🤔', '😍', '😎', '😢', '😡', '🤩', '🥳'].map(emoji => (
                                                        <button key={emoji} className="emoji-item" onClick={() => sendQuickEmoji(emoji)}>
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="quick-messages-popup">
                                                    {['Salam! 👋', 'Uğurlar! 🍀', 'Yaxşı oyun! 🎯', 'Təşəkkürlər 🙏', 'Gözəl! 👏', 'Ups... 😅', 'GG! 🎊'].map(msg => (
                                                        <button key={msg} className="quick-msg-item-btn" onClick={() => sendQuickMessage(msg)}>
                                                            {msg}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {playerEmojis.player1 && (
                                        <div className="floating-emoji-display">
                                            {playerEmojis.player1}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Game Header with Bet */}
                        <div className="game-header-section">
                            <div className="bet-display">
                                <span className="bet-icon">🏆</span>
                                <span className="bet-text">Match Pot:</span>
                                <span className="bet-amount-large">{betAmount} <span className='home-icon-bg'>💰</span> </span>
                            </div>
                        </div>
                        {/* Player 2 (Black) */}
                        <div className={`player-status-card player-black ${(myColor === 'black' ? isMyTurn : !isMyTurn) ? 'active-turn' : ''}`}>
                            <div className="player-status-info">
                                <h3>{player2.name}</h3>
                                <div className="player-status-meta">
                                    <span className="player-stone">
                                        ⚫ <span className="stone-text">Black</span>
                                    </span>
                                    <span className="player-home"><span className='home-icon-bg'>🏠</span> {gameBoard.home?.black || 0}/15</span>
                                </div>
                            </div>

                            {/* ƏSAS DƏYİŞİKLİK: Yalnız player2 cari oyunçudursa düyməni göstər */}
                            {player2.name === myName && (
                                <div className="player-action-zone">
                                    <button
                                        className="player-emoji-action-btn"
                                        onClick={() => setEmojiPopup({
                                            show: emojiPopup.player === 'player1' ? !emojiPopup.show : true,
                                            player: 'player1',
                                            tab: 'emoji'
                                        })}
                                        title="Send emoji or quick message"
                                    >
                                        💬
                                    </button>
                                    {emojiPopup.show && emojiPopup.player === 'player1' && (
                                        <div className="emoji-action-popup">
                                            <div className="emoji-popup-nav">
                                                <button
                                                    className={`emoji-nav-btn ${emojiPopup.tab === 'emoji' ? 'active' : ''}`}
                                                    onClick={() => setEmojiPopup(prev => ({ ...prev, tab: 'emoji' }))}
                                                >
                                                    😊
                                                </button>
                                                <button
                                                    className={`emoji-nav-btn ${emojiPopup.tab === 'message' ? 'active' : ''}`}
                                                    onClick={() => setEmojiPopup(prev => ({ ...prev, tab: 'message' }))}
                                                >
                                                    💬
                                                </button>
                                            </div>
                                            {emojiPopup.tab === 'emoji' ? (
                                                <div className="emoji-picker">
                                                    {['👋', '😊', '😂', '❤️', '👍', '👏', '🙏', '🔥', '✨', '🎉', '💯', '🤔', '😍', '😎', '😢', '😡', '🤩', '🥳'].map(emoji => (
                                                        <button key={emoji} className="emoji-item" onClick={() => sendQuickEmoji(emoji)}>
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="quick-messages-popup">
                                                    {['Salam! 👋', 'Uğurlar! 🍀', 'Yaxşı oyun! 🎯', 'Təşəkkürlər 🙏', 'Gözəl! 👏', 'Ups... 😅', 'GG! 🎊'].map(msg => (
                                                        <button key={msg} className="quick-msg-item-btn" onClick={() => sendQuickMessage(msg)}>
                                                            {msg}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {playerEmojis.player1 && (
                                        <div className="floating-emoji-display">
                                            {playerEmojis.player1}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Game Board Section */}
                    <section className="game-board-section">
                        <div className="board-container-premium">
                            {/* Left Half */}
                            <div className="board-half-section">
                                <div className="points-row">
                                    {[13, 14, 15, 16, 17, 18].map(num => (
                                        <Point key={num} num={num} position="top" gameBoard={gameBoard} selectedPoint={selectedPoint} handlePointClick={handlePointClick} />
                                    ))}
                                </div>
                                <div className="points-row">
                                    {[12, 11, 10, 9, 8, 7].map(num => (
                                        <Point key={num} num={num} position="bottom" gameBoard={gameBoard} selectedPoint={selectedPoint} handlePointClick={handlePointClick} />
                                    ))}
                                </div>
                            </div>

                            {/* BAR */}
                            <div className="board-bar-section">
                                <div
                                    className={`bar-column ${selectedPoint === 0 && myColor === 'white' ? 'selected' : ''}`}
                                    onClick={() => handleBarClick('white')}
                                >
                                    <div className="bar-label">⚪</div>
                                    {(gameBoard.bar?.white || 0) > 0 && (
                                        <div className="bar-pieces-stack">
                                            <div className="bar-piece white">
                                                {(gameBoard.bar?.white || 0) > 1 && (
                                                    <span className="piece-count">{gameBoard.bar.white}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className={`bar-column ${selectedPoint === 0 && myColor === 'black' ? 'selected' : ''}`}
                                    onClick={() => handleBarClick('black')}
                                >
                                    <div className="bar-label">⚫</div>
                                    {(gameBoard.bar?.black || 0) > 0 && (
                                        <div className="bar-pieces-stack">
                                            <div className="bar-piece black">
                                                {(gameBoard.bar?.black || 0) > 1 && (
                                                    <span className="piece-count">{gameBoard.bar.black}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Half */}
                            <div className="board-half-section">
                                <div className="points-row">
                                    {[19, 20, 21, 22, 23, 24].map(num => (
                                        <Point key={num} num={num} position="top" gameBoard={gameBoard} selectedPoint={selectedPoint} handlePointClick={handlePointClick} />
                                    ))}
                                </div>
                                <div className="points-row">
                                    {[6, 5, 4, 3, 2, 1].map(num => (
                                        <Point key={num} num={num} position="bottom" gameBoard={gameBoard} selectedPoint={selectedPoint} handlePointClick={handlePointClick} />
                                    ))}
                                </div>
                            </div>

                            {/* Dice Display */}
                            {showDice && (
                                <div className="dice-display-area">
                                    <div className={`die-cube-3d ${rollingDice[0] ? 'rolling' : ''} ${!rollingDice[0] ? `show-face-${displayDice[0]}` : ''}`}>
                                        <div className="die-face die-face-1"><span>1</span></div>
                                        <div className="die-face die-face-2"><span>2</span></div>
                                        <div className="die-face die-face-3"><span>3</span></div>
                                        <div className="die-face die-face-4"><span>4</span></div>
                                        <div className="die-face die-face-5"><span>5</span></div>
                                        <div className="die-face die-face-6"><span>6</span></div>
                                    </div>
                                    <div className={`die-cube-3d ${rollingDice[1] ? 'rolling' : ''} ${!rollingDice[1] ? `show-face-${displayDice[1]}` : ''}`}>
                                        <div className="die-face die-face-1"><span>1</span></div>
                                        <div className="die-face die-face-2"><span>2</span></div>
                                        <div className="die-face die-face-3"><span>3</span></div>
                                        <div className="die-face die-face-4"><span>4</span></div>
                                        <div className="die-face die-face-5"><span>5</span></div>
                                        <div className="die-face die-face-6"><span>6</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Game Controls */}
                    <div className="game-controls-bar">
                        <button className="control-btn roll-dice-btn" onClick={rollDice} disabled={!isMyTurn}>
                            <span className="btn-icon">🎲</span>
                            <span className="btn-text">Roll Dice</span>
                        </button>
                        <button className="control-btn bear-off-btn" onClick={bearOff} disabled={!isMyTurn}>
                            <span className="btn-icon">🏠</span>
                            <span className="btn-text">Bear Off</span>
                        </button>
                        <button className="control-btn end-turn-btn" onClick={endTurn} disabled={!isMyTurn}>
                            <span className="btn-icon">⏭️</span>
                            <span className="btn-text">End Turn</span>
                        </button>
                        <button className="control-btn leave-game-btn" onClick={leaveGame}>
                            <span className="btn-icon">🚪</span>
                            <span className="btn-text">Leave</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== POINT COMPONENT ====================
// Renders a single point on the backgammon board
// Props: num (point number 1-24), position (top/bottom), gameBoard, selectedPoint, handlePointClick
function Point({ num, position, gameBoard, selectedPoint, handlePointClick }) {
    const points = gameBoard.points || {};
    const pointKey = num.toString();
    const pieces = points[pointKey] || [];
    const isSelected = selectedPoint === num;

    return (
        <div
            className={`board-point ${position} ${isSelected ? 'selected' : ''}`}
            data-point={num}
            onClick={() => handlePointClick(num)}
        >
            <div className="point-triangle" />

            <div className="point-label">{num}</div>

            {pieces.length > 0 && (
                <div className="point-pieces">
                    {pieces.slice(0, 5).map((color, i) => (
                        <div key={i} className={`point-piece ${color}`}>
                            {i === 4 && pieces.length > 5 && (
                                <span className="piece-stack-count">{pieces.length}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BackgammonGame;