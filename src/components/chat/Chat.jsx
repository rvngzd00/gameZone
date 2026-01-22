import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import "./Chat.css";
import { useAppContext } from '../../context/AppContext';

export default function Chat() {
    const { t } = useAppContext();
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    };

    const BASE_URL = "https://nehemiah-paginal-alan.ngrok-free.dev";


    const token =
        localStorage.getItem("token") ||
        document.cookie
            .split("; ")
            .find((r) => r.startsWith("AuthToken="))
            ?.split("=")[1] ||
        "";

    // ✅ Helper: URL-i tam path-a çevir
    const getFullImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `${BASE_URL}${imageUrl}`;
    };

    useEffect(() => {
        const connect = async () => {
            try {
                const conn = new signalR.HubConnectionBuilder()
                    .withUrl(`${BASE_URL}/adminChatHub`, {
                        accessTokenFactory: () => token,
                    })
                    .withAutomaticReconnect()
                    .build();

                // ReceiveMessage handler
                conn.on("ReceiveMessage", (sender, message, imageUrl, isFromAdmin) => {
                    console.log("📩 ReceiveMessage:", { sender, message, imageUrl, isFromAdmin });

                    const fullImageUrl = getFullImageUrl(imageUrl);

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now(),
                            text: message || "",
                            sender: isFromAdmin ? "admin" : "user",
                            time: new Date().toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                            }),
                            image: fullImageUrl ? { url: fullImageUrl } : null,
                        },
                    ]);
                });

                // LoadChatHistory handler
                conn.on("LoadChatHistory", (msgs) => {
                    console.log("📜 Chat history yükləndi:", msgs);

                    const formattedMsgs = msgs.map((msg) => {
                        const fullImageUrl = getFullImageUrl(msg.imageUrl);

                        return {
                            id: Date.now() + Math.random(),
                            text: msg.text || msg.message || "",
                            sender: msg.isAdmin ? "admin" : "user",
                            time: new Date(msg.timestamp || Date.now()).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                            }),
                            image: fullImageUrl ? { url: fullImageUrl } : null,
                        };
                    });

                    setMessages(formattedMsgs);
                });

                await conn.start();
                console.log("✅ SignalR connected!");
                setConnection(conn);

                await conn.invoke("LoadChatHistory", "admin");
            } catch (err) {
                console.error("❌ Connection error:", err);
                setTimeout(connect, 5000);
            }
        };

        connect();

        return () => {
            if (connection) connection.stop();
        };
    }, []);

    // Simulate admin typing when user sends a message
    useEffect(() => {
        if (messages[messages.length - 1]?.sender === "user") {
            setIsTyping(true);
            const timeout = setTimeout(() => {
                setIsTyping(false);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [messages]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        console.log("📤 Şəkil upload olunur...");

        const response = await fetch(`${BASE_URL}/api/chat/upload-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Upload xətası:", response.status, errorText);
            throw new Error(t('upload_failed'));
        }

        const data = await response.json();
        console.log("📤 Backend response:", data);
        console.log("📤 ImageUrl:", data.imageUrl);

        return data.imageUrl;
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage({
                    url: event.target.result,
                    name: file.name,
                    file: file,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageCancel = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!connection) {
            console.error("❌ Connection yoxdur!");
            return;
        }
        if (!newMessage.trim() && !selectedImage) {
            console.log("⚠️ Boş mesaj");
            return;
        }

        try {
            let imageUrl = null;

            // Şəkil yüklənirsə, əvvəlcə yüklə
            if (selectedImage?.file) {
                console.log("📸 Şəkil upload başlayır...");
                imageUrl = await uploadImage(selectedImage.file);
                console.log("✅ Upload tamamlandı. URL:", imageUrl);
            }

            // SendMessage invoke et
            console.log("📤 SignalR-a göndərilir:", {
                receiver: "admin",
                text: newMessage,
                imageUrl: imageUrl,
            });

            await connection.invoke("SendMessage", "admin", newMessage, imageUrl);
            console.log("✅ SignalR invoke uğurlu");

            // Local olaraq mesajı əlavə et
            const fullImageUrl = getFullImageUrl(imageUrl);
            console.log("🖼️ Full image URL:", fullImageUrl);

            const message = {
                id: Date.now(),
                text: newMessage,
                sender: "user",
                time: new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                }),
                image: fullImageUrl ? { url: fullImageUrl } : null,
            };

            console.log("📝 Local mesaj əlavə olunur:", message);
            setMessages((prev) => [...prev, message]);

            setNewMessage("");
            setSelectedImage(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("❌ Xəta göndərərkən:", err);
            console.error("❌ Error stack:", err.stack);
            alert(t('send_message') + " " + (err.message || ''));
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <div className="admin-info">
                    <div className="admin-avatar">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="11" fill="url(#adminGrad)" stroke="var(--accent)" strokeWidth="1" />
                            <path d="M8 15c2-2.5 6-2.5 8 0M9 10h.01M15 10h.01" stroke="var(--brown-dark)" strokeWidth="1.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="adminGrad" x1="2" y1="2" x2="22" y2="22">
                                    <stop stopColor="var(--accent)" />
                                    <stop offset="1" stopColor="var(--accent)" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                        <div className="admin-details">
                            <h2>{t('admin')}</h2>
                            <span className="admin-status">{t('online')}</span>
                        </div>
                </div>
            </header>

            <div className="messages-container">
                <div className="chat-date-divider">{t('today')}</div>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.sender === "admin" ? "admin-message" : "user-message"}`}
                    >
                        <div className="message-bubble">
                            {msg.text}
                            {msg.image && (
                                <div className="message-image-container">
                                    <img
                                        src={msg.image.url}
                                        alt={msg.image.name || "message"}
                                        className="message-image"
                                        onError={(e) => {
                                            console.error("❌ Şəkil yüklənmədi:", msg.image.url);
                                        }}
                                        onLoad={() => {
                                            console.log("✅ Şəkil yükləndi:", msg.image.url);
                                        }}
                                    />
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
                <div ref={messagesEndRef}>
                    
                </div>
            </div>
            

            <form onSubmit={handleSend} className="message-input-container">
                {selectedImage && (
                    <div className="image-preview">
                        <img src={selectedImage.url} alt={selectedImage.name} />
                        <button type="button" onClick={handleImageCancel} className="cancel-image">
                            ×
                        </button>
                    </div>
                )}
                <div className="input-row">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('type_your_message')}
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
                        aria-label={t('send_message')}
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
