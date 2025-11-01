import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

const SAMPLE_MESSAGES = [
    { id: 1, text: "Salam, Siz Dusunursunuzki Tofiq Peyserdir ?", sender: "admin", time: "10:30 AM" },
    { id: 2, text: "Salam, Tebiiki TOFIQ ENKE PEYSERDIR", sender: "user", time: "10:31 AM" },
    { id: 3, text: "Siz POX yeyirsiniz, ENKE PEYSER TOFIQIN OGLU ILQARDIR", sender: "admin", time: "10:31 AM" },
    { id: 4, text: "Cox duz deyirsiniz.", sender: "user", time: "10:32 AM" },
    { id: 5, text: "Salam, Siz Dusunursunuzki Tofiq Peyserdir ?", sender: "admin", time: "10:30 AM" },
    { id: 6, text: "Salam, Tebiiki TOFIQ ENKE PEYSERDIR", sender: "user", time: "10:31 AM" },
    { id: 7, text: "Siz POX yeyirsiniz, ENKE PEYSER TOFIQIN OGLU ILQARDIR", sender: "admin", time: "10:31 AM" },
    { id: 8, text: "Cox duz deyirsiniz.", sender: "user", time: "10:32 AM" },
    { id: 9, text: "Salam, Siz Dusunursunuzki Tofiq Peyserdir ?", sender: "admin", time: "10:30 AM" },
    { id: 11, text: "Salam, Tebiiki TOFIQ ENKE PEYSERDIR", sender: "user", time: "10:31 AM" },
    { id: 12, text: "Siz POX yeyirsiniz, ENKE PEYSER TOFIQIN OGLU ILQARDIR", sender: "admin", time: "10:31 AM" },
    { id: 13, text: "Cox duz deyirsiniz.", sender: "user", time: "10:32 AM" },
];

export default function Chat() {
    const [messages, setMessages] = useState(SAMPLE_MESSAGES);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Simulate admin typing when user sends a message
    useEffect(() => {
        if (messages[messages.length - 1]?.sender === 'user') {
            setIsTyping(true);
            const timeout = setTimeout(() => {
                setIsTyping(false);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [messages]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage({
                    url: event.target.result,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageCancel = () => {
        setSelectedImage(null);
        fileInputRef.current.value = '';
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: messages.length + 1,
            text: newMessage,
            sender: 'user',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
            image: selectedImage
        };

        setMessages([...messages, message]);
        setNewMessage('');
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <div className="admin-info">
                    <div className="admin-avatar">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="11" fill="url(#adminGrad)" stroke="#FFB800" strokeWidth="1" />
                            <path d="M8 15c2-2.5 6-2.5 8 0M9 10h.01M15 10h.01" stroke="#6b3f00" strokeWidth="1.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="adminGrad" x1="2" y1="2" x2="22" y2="22">
                                    <stop stopColor="#FFD700" />
                                    <stop offset="1" stopColor="#FFA500" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="admin-details">
                        <h2>Tofiqin Yeke Siki</h2>
                        <span className="admin-status">Online</span>
                    </div>
                </div>
            </header>

            <div className="messages-container">
                <div className="chat-date-divider">Today</div>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.sender === 'admin' ? 'admin-message' : 'user-message'}`}
                    >
                        <div className="message-bubble">
                            {msg.text}
                            {msg.image && (
                                <div className="message-image-container">
                                    <img src={msg.image.url} alt={msg.image.name} className="message-image" />
                                </div>
                            )}
                        </div>
                        <span className="message-time">{msg.time}</span>
                    </div>
                ))}
                {isTyping && (
                    <div className="message admin-message typing-indicator">
                        <div className="message-bubble">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="message-input-container">
                {selectedImage && (
                    <div className="image-preview">
                        <img src={selectedImage.url} alt={selectedImage.name} />
                        <button type="button" onClick={handleImageCancel} className="cancel-image">×</button>
                    </div>
                )}
                <div className="input-row">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="message-input"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        ref={fileInputRef}
                        className="file-input"
                        id="file-input"
                    />
                    <label htmlFor="file-input" className="file-button">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                            <path d="M4 16l4-4 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <rect x="18" y="4" width="2" height="2" rx="1" fill="currentColor" />
                        </svg>
                    </label>
                    <button
                        type="submit"
                        className="send-button"
                        disabled={!newMessage.trim() && !selectedImage}
                        aria-label="Send message"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M5 12h14M15 7l5 5-5 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}