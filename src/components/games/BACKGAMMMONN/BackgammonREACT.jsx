import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAppContext } from '../../../context/AppContext';
import './BackgammonREACT.css';

// ==================== CONSTANTS ====================
const NOTIFICATION_DURATION = 5000;
const EMOJI_DISPLAY_DURATION = 2000;
const MESSAGE_DISPLAY_DURATION = 3000;
const ROOM_REFRESH_INTERVAL = 3000;

// ==================== BACKGAMMON GAME ====================
function BackgammonREACT() {
    const { user, balance, token, updateBalance, t } = useAppContext();

    // SignalR Connection
    const [connection, setConnection] = useState(null);
    const [connected, setConnected] = useState(false);

    // Game State
    const [view, setView] = useState('lobby');
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [myColor, setMyColor] = useState(null);
    const [myName, setMyName] = useState(user?.username || 'Player'); // ✅ username ilə başla
    const [myUsername, setMyUsername] = useState(user?.username || 'Player'); // ✅ ƏSAS: username-i ayrıca saxla
    const [myFullName, setMyFullName] = useState(''); // ✅ fullName ayrıca
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
    const [diceRolled, setDiceRolled] = useState(false); // ✅ Zər atıldı flag
    const [betAmount, setBetAmount] = useState(0);
    const [player1, setPlayer1] = useState({ name: 'Oyunçu 1', avatar: '?' });
    const [player2, setPlayer2] = useState({ name: 'Oyunçu 2', avatar: '?' });

    // UI State
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeQuickPanel, setActiveQuickPanel] = useState(null);
    const [emojiPopup, setEmojiPopup] = useState({ show: false, player: null, tab: 'emoji' });
    const [playerEmojis, setPlayerEmojis] = useState({ player1: null, player2: null });

    // Refs
    const messagesEndRef = useRef(null);
    const notificationTimerRef = useRef(null);
    const connectionRef = useRef(null);

    // ==================== Sync myName with user ====================
    useEffect(() => {
        if (user?.username && !myUsername) {
            setMyUsername(user.username);
            setMyFullName(user.fullName || user.username);
            setMyName(user.fullName || user.username);
        }
    }, [user]);

    // ==================== SignalR Setup ====================
    useEffect(() => {
        if (!token) return;

        const conn = new signalR.HubConnectionBuilder()
            .withUrl("https://nehemiah-paginal-alan.ngrok-free.dev/backgammonhub", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = conn;

        conn.onreconnecting((error) => {
            console.log("🔄 Reconnecting...", error);
            showNotification('Bağlantı yenidən qurulur...', 'info');
        });

        conn.onreconnected((connectionId) => {
            console.log("✅ Reconnected:", connectionId);
            showNotification('Bağlantı yeniləndi!', 'success');
            refreshRooms();
        });

        conn.onclose((error) => {
            console.log("❌ Connection closed:", error);
            setConnected(false);
            showNotification('Bağlantı kəsildi!', 'error');
        });

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
            if (conn && conn.state === signalR.HubConnectionState.Connected) {
                conn.stop();
            }
        };
    }, [token]);

    // ==================== SignalR Event Handlers (Only Once) ====================
    useEffect(() => {
        if (!connection) return;

        const handleUserData = (data) => {
            console.log("👤 UserData received:", data);
            // ✅ ƏSAS: username və fullName ayrı-ayrı saxla
            const username = data.username;
            const fullName = data.fullName || data.username;

            console.log("👤 Username:", username);
            console.log("👤 FullName:", fullName);

            setMyUsername(username); // Backend bununla müqayisə edir
            setMyFullName(fullName); // UI-da göstərmək üçün
            setMyName(fullName); // Display name
            updateBalance(data.balance);
        };

        const handleChatMessage = (data) => {
            // ✅ username ilə müqayisə
            const isOwn = data.sender === myUsername || data.sender === myFullName;
            setChatMessages(prev => [...prev, {
                sender: data.sender,
                message: data.message,
                isOwn,
                time: new Date()
            }]);
            if (!chatOpen && !isOwn) {
                setUnreadCount(prev => prev + 1);
            }
        };

        const handleQuickEmoji = (data) => {
            displayPlayerEmoji(data.sender, data.emoji);
        };

        const handleQuickMessage = (data) => {
            displayPlayerQuickMessage(data.sender, data.message);
        };

        const handleBackgammonRoomCreated = () => {
            refreshRooms();
        };

        const handleJoinedRoom = (data) => {
            setCurrentRoom(data.roomId);
            setMyColor(data.color);
            setBetAmount(data.betAmount);
            setView('game');

            // ✅ Display name istifadə et (fullName)
            const myInfo = { name: myFullName || myUsername, avatar: (myFullName || myUsername).charAt(0).toUpperCase() };
            if (data.color === 'white') {
                setPlayer1(myInfo);
            } else {
                setPlayer2(myInfo);
            }

            if (data.waitingForOpponent) {
                showNotification(`⏳ Rəqib gözlənilir... (${data.color === 'white' ? '⚪ Ağ' : '⚫ Qara'})`, 'info');
            }
        };

        const handlePlayerJoined = (data) => {
            console.log("PlayerJoined data:", data);
            showNotification(`${data.name} qoşuldu! Oyun başlayır...`, 'info');
            updatePlayerInfo(data.name, data.color);
        };

        const handleOpponentInfo = (data) => {
            updatePlayerInfo(data.name, data.color);
        };

        const handleGameStarting = (data) => {
            showNotification(
                `${data.player1.name} atdı ${data.player1.dice} 🎲\n${data.player2.name} atdı ${data.player2.dice} 🎲\n\n🏁 ${data.starter} başlayır!`,
                'success'
            );
        };

        const handleGameStarted = (data) => {
            setIsMyTurn(data.isMyTurn);
            setGameBoard(data.board || { points: {}, bar: { white: 0, black: 0 }, home: { white: 0, black: 0 } });
            showNotification(data.message || 'Oyun başladı!', 'success');
        };

        const handleDiceRolled = (data) => {
            console.log("🎲 DiceRolled event received:", data);
            setDice(data.dice);
            setShowDice(true);
            setRollingDice([true, true]);
            setDiceRolled(true); // ✅ Zər atıldı, bir daha atıla bilməz

            setTimeout(() => {
                setDisplayDice(data.dice);
                setRollingDice([false, false]);
            }, 1200);

            showNotification(`🎲 Zər: ${data.dice.join('-')}`, 'info');
        };

        const handlePieceMoved = (data) => {
            setGameBoard(data.board);
            setSelectedPoint(null);

            const moveText = data.fromPoint === 0 ? `BAR → ${data.toPoint}` :
                (data.toPoint < 1 || data.toPoint > 24) ? `${data.fromPoint} → HOME 🏠` :
                    `${data.fromPoint} → ${data.toPoint}`;

            showNotification(`♟️ ${moveText}`, 'success');
        };

        const handleTurnChanged = (data) => {
            console.log("TurnChanged received:", data);
            console.log("Current player from server:", data.currentPlayer);
            console.log("My username:", myUsername);
            console.log("My fullName:", myFullName);

            // ✅ ƏSAS FIX: Backend username göndərir, biz username ilə müqayisə edirik
            const isMyTurnNow = data.currentPlayer === myUsername;

            console.log("Is my turn now?", isMyTurnNow);

            setIsMyTurn(isMyTurnNow);
            setShowDice(false);
            setSelectedPoint(null);
            setDiceRolled(false); // ✅ Yeni növbə - zər yenidən atıla bilər

            if (isMyTurnNow) {
                showNotification('🎯 Sizin növbənizdir!', 'info');
            } else {
                showNotification('⏳ Rəqibin növbəsidir...', 'info');
            }
        };

        const handleGameEnded = (data) => {
            showNotification(data.message, 'success');
            setTimeout(() => window.location.reload(), 4000);
        };

        const handleError = (msg) => showNotification(msg, 'error');
        const handleJoinError = (msg) => showNotification(msg, 'error');

        // Register handlers
        connection.on("UserData", handleUserData);
        connection.on("ChatMessage", handleChatMessage);
        connection.on("QuickEmoji", handleQuickEmoji);
        connection.on("QuickMessage", handleQuickMessage);
        connection.on("BackgammonRoomCreated", handleBackgammonRoomCreated);
        connection.on("JoinedRoom", handleJoinedRoom);
        connection.on("PlayerJoined", handlePlayerJoined);
        connection.on("OpponentInfo", handleOpponentInfo);
        connection.on("GameStarting", handleGameStarting);
        connection.on("GameStarted", handleGameStarted);
        connection.on("DiceRolled", handleDiceRolled);
        connection.on("PieceMoved", handlePieceMoved);
        connection.on("TurnChanged", handleTurnChanged);
        connection.on("GameEnded", handleGameEnded);
        connection.on("Error", handleError);
        connection.on("JoinError", handleJoinError);

        return () => {
            connection.off("UserData", handleUserData);
            connection.off("ChatMessage", handleChatMessage);
            connection.off("QuickEmoji", handleQuickEmoji);
            connection.off("QuickMessage", handleQuickMessage);
            connection.off("BackgammonRoomCreated", handleBackgammonRoomCreated);
            connection.off("JoinedRoom", handleJoinedRoom);
            connection.off("PlayerJoined", handlePlayerJoined);
            connection.off("OpponentInfo", handleOpponentInfo);
            connection.off("GameStarting", handleGameStarting);
            connection.off("GameStarted", handleGameStarted);
            connection.off("DiceRolled", handleDiceRolled);
            connection.off("PieceMoved", handlePieceMoved);
            connection.off("TurnChanged", handleTurnChanged);
            connection.off("GameEnded", handleGameEnded);
            connection.off("Error", handleError);
            connection.off("JoinError", handleJoinError);
        };
    }, [connection, myUsername, myFullName, chatOpen]);

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
            const interval = setInterval(refreshRooms, ROOM_REFRESH_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [connected, view]);

    // ==================== Cleanup Timer ====================
    useEffect(() => {
        return () => {
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
        };
    }, []);

    // ==================== Helper Functions ====================
    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
        notificationTimerRef.current = setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, NOTIFICATION_DURATION);
    };

    const updatePlayerInfo = (name, color) => {
        const avatar = name.charAt(0).toUpperCase();
        if (color === 'white') {
            setPlayer1({ name, avatar });
        } else {
            setPlayer2({ name, avatar });
        }
    };

    const displayPlayerEmoji = (sender, emoji) => {
        const playerKey = sender === player1.name ? 'player1' : 'player2';
        setPlayerEmojis(prev => ({ ...prev, [playerKey]: emoji }));
        setTimeout(() => {
            setPlayerEmojis(prev => ({ ...prev, [playerKey]: null }));
        }, EMOJI_DISPLAY_DURATION);
    };

    const displayPlayerQuickMessage = (sender, message) => {
        const playerKey = sender === player1.name ? 'player1' : 'player2';
        setPlayerEmojis(prev => ({ ...prev, [playerKey]: message }));
        setTimeout(() => {
            setPlayerEmojis(prev => ({ ...prev, [playerKey]: null }));
        }, MESSAGE_DISPLAY_DURATION);
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
        if (!isMyTurn) {
            showNotification('Sizin növbəniz deyil!', 'error');
            return;
        }

        if (diceRolled) {
            showNotification('❌ Zəri artıq atdınız! Hərəkət edin və ya növbəni bitirin.', 'error');
            return;
        }

        if (!connection) return;

        try {
            await connection.invoke("RollDice");
        } catch (err) {
            console.error("RollDice error:", err);
            showNotification('Xəta baş verdi!', 'error');
        }
    };

    const movePiece = async (from, to) => {
        if (!connection) return;
        try {
            await connection.invoke("MovePiece", from, to);
        } catch (err) {
            console.error("MovePiece error:", err);
            showNotification('Hərəkət edilə bilmədi!', 'error');
            setSelectedPoint(null);
        }
    };

    const endTurn = async () => {
        if (!connection) return;
        if (!isMyTurn) {
            showNotification('Sizin növbəniz deyil!', 'error');
            return;
        }

        try {
            await connection.invoke("EndTurn");
            // ✅ Növbə bitdi - state-ləri sıfırla
            setDiceRolled(false);
            setShowDice(false);
            setSelectedPoint(null);
        } catch (err) {
            console.error("EndTurn error:", err);
            showNotification('Xəta baş verdi!', 'error');
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

        if (!diceRolled) {
            showNotification('❌ Əvvəlcə zər atın!', 'error');
            return;
        }

        const points = gameBoard.points || {};
        const bar = gameBoard.bar || {};

        // BAR-da daş varsa, əvvəl onu oynamalı
        if (bar[myColor] && bar[myColor] > 0) {
            showNotification('❌ Əvvəlcə BAR-dan hərəkət etməlisiniz!', 'error');
            return;
        }

        const pointKey = pointNum.toString();

        // Əgər seçilmiş nöqtə varsa və fərqli nöqtəyə klik edilibsə
        if (selectedPoint !== null && selectedPoint !== pointNum) {
            // Əgər yeni nöqtədə bizim daşımız varsa - yenidən seçim
            if (points[pointKey] && points[pointKey].includes(myColor)) {
                setSelectedPoint(pointNum);
                showNotification(`✅ Yeni seçim: Nöqtə ${pointNum}`, 'info');
                return;
            }
            // Əks halda - hərəkət et
            movePiece(selectedPoint, pointNum);
            return;
        }

        // Əgər heç nə seçilməyibsə və ya eyni nöqtəyə klik edilibsə - seç/deselect
        if (points[pointKey] && points[pointKey].includes(myColor)) {
            if (selectedPoint === pointNum) {
                // Deselect
                setSelectedPoint(null);
                showNotification('❌ Seçim ləğv edildi', 'info');
            } else {
                // Select
                setSelectedPoint(pointNum);
                showNotification(`✅ Seçildi: Nöqtə ${pointNum}`, 'info');
            }
        } else {
            showNotification('Bu nöqtədə sizin daşınız yoxdur!', 'error');
        }
    };

    const handleBarClick = (color) => {
        if (!isMyTurn) {
            showNotification('Sizin növbəniz deyil!', 'error');
            return;
        }

        if (!diceRolled) {
            showNotification('❌ Əvvəlcə zər atın!', 'error');
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

        // BAR-ı seç/deselect
        if (selectedPoint === 0) {
            setSelectedPoint(null);
            showNotification('❌ BAR seçimi ləğv edildi', 'info');
        } else {
            setSelectedPoint(0);
            showNotification(`✅ BAR seçildi (${color === 'white' ? '19-24-ə' : '1-6-ya'} daxil olmalı)`, 'info');
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || !currentRoom || !connection) return;
        try {
            await connection.invoke("SendChatMessage", currentRoom, chatInput.trim());
            setChatInput('');
        } catch (err) {
            console.error("Send error:", err);
            showNotification('Mesaj göndərilə bilmədi!', 'error');
        }
    };

    const sendQuickChatMessage = async (msg) => {
        if (!currentRoom || !connection) return;
        try {
            await connection.invoke("SendChatMessage", currentRoom, msg);
        } catch (err) {
            console.error("Quick message error:", err);
            showNotification('Mesaj göndərilə bilmədi!', 'error');
        }
    };

    const sendQuickEmoji = async (emoji) => {
        if (!currentRoom || !connection) return;
        try {
            await connection.invoke("SendQuickEmoji", currentRoom, emoji);
            setEmojiPopup({ show: false, player: null, tab: 'emoji' });
        } catch (err) {
            console.error("SendQuickEmoji error:", err);
            showNotification('Göndərilə bilmədi!', 'error');
        }
    };

    const sendQuickMessage = async (message) => {
        if (!currentRoom || !connection) return;
        try {
            await connection.invoke("SendQuickMessage", currentRoom, message);
            setEmojiPopup({ show: false, player: null, tab: 'emoji' });
        } catch (err) {
            console.error("SendQuickMessage error:", err);
            showNotification('Mesaj göndərilə bilmədi!', 'error');
        }
    };

    const toggleEmojiPopup = (playerNum) => {
        setEmojiPopup(prev => ({
            show: prev.player === playerNum ? !prev.show : true,
            player: playerNum,
            tab: 'emoji'
        }));
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

            {/* Chat Toggle Button */}
            {!chatOpen && (
                <button className="chat-toggle-btn" onClick={() => setChatOpen(true)}>
                    <span className="chat-icon">💬</span>
                    {unreadCount > 0 && <span className="chat-badge-count">{unreadCount}</span>}
                </button>
            )}

            {/* Premium Chat Panel */}
            {chatOpen && (
                <div className="chat-panel-premium">
                    <div className="chat-panel-header">
                        <div className="chat-panel-title">
                            <span className="chat-icon-header">💬</span>
                            <h3>{t('live_chat')}</h3>
                        </div>
                        <button className="chat-panel-close" onClick={() => setChatOpen(false)}>✕</button>
                    </div>

                    <div className="chat-messages-container">
                        {chatMessages.length === 0 ? (
                                <div className="chat-empty-state">
                                <div className="empty-icon">💭</div>
                                <p>{t('no_messages_yet')}</p>
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
                    </div>

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
                                placeholder={t('type_a_message')}
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
                                            <h2>{t('quick_match')}</h2>
                                            <p>{t('select_bet_find_opponent')}</p>
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
                                <span className="vip-badge">{t('vip')}</span>
                                <span className="vip-amount">1000 💰</span>
                            </button>
                        </section>

                        {/* Active Rooms Section */}
                        <section className="active-rooms-section">
                            <div className="section-header">
                                <div className="section-icon">📋</div>
                                <div>
                                    <h2>{t('active_games')}</h2>
                                    <p>{rooms.length} {t('games')} {t('available')}</p>
                                </div>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="no-rooms-state">
                                    <div className="no-rooms-icon">🎮</div>
                                    <p>{t('no_active_games')}</p>
                                    <small>{t('start_quick_match_help')}</small>
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
                                    <span className="player-home">
                                        <span className='home-icon-bg'>🏠</span>
                                        {gameBoard.home?.white || 0}/15
                                    </span>
                                </div>
                            </div>

                            {/* Yalnız player1 cari oyunçudursa düyməni göstər */}
                            {player1.name === myName && (
                                <div className="player-action-zone">
                                    <button
                                        className="player-emoji-action-btn"
                                        onClick={() => toggleEmojiPopup('player1')}
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

                            {/* Yalnız player2 cari oyunçudursa düyməni göstər */}
                            {player2.name === myName && (
                                <div className="player-action-zone">
                                    <button
                                        className="player-emoji-action-btn"
                                        onClick={() => toggleEmojiPopup('player2')}
                                        title="Send emoji or quick message"
                                    >
                                        💬
                                    </button>
                                    {emojiPopup.show && emojiPopup.player === 'player2' && (
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
                                    {playerEmojis.player2 && (
                                        <div className="floating-emoji-display">
                                            {playerEmojis.player2}
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
                        <button
                            className="control-btn roll-dice-btn"
                            onClick={rollDice}
                            disabled={!isMyTurn || diceRolled}
                        >
                            <span className="btn-icon">🎲</span>
                            <span className="btn-text">Roll Dice</span>
                        </button>
                        <button className="control-btn bear-off-btn" onClick={bearOff} disabled={!isMyTurn || !diceRolled}>
                            <span className="btn-icon">🏠</span>
                            <span className="btn-text">Bear Off</span>
                        </button>
                        <button className="control-btn end-turn-btn" onClick={endTurn} disabled={!isMyTurn || !diceRolled}>
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
            style={{ cursor: 'pointer' }}
        >
            <div className="point-triangle" />

            <div className="point-label">{num}</div>

            {pieces.length > 0 && (
                <div className="point-pieces">
                    {pieces.slice(0, 5).map((color, i) => (
                        <div
                            key={i}
                            className={`point-piece ${color}`}
                            style={{ cursor: 'pointer' }}
                        >
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

export default BackgammonREACT;