import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import * as signalR from "@microsoft/signalr";
import "./AddBalance.css";
import { useAppContext } from '../../context/AppContext';

export default function AddBalance({ isOpen, onClose, username: propUsername, walletAddress }) {
    const { t } = useAppContext();
    const [amount, setAmount] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef(null);
    const connectionRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    const BASE_URL = "https://nehemiah-paginal-alan.ngrok-free.dev";

    const token =
        localStorage.getItem("token") ||
        document.cookie
            .split("; ")
            .find((r) => r.startsWith("AuthToken="))
            ?.split("=")[1] ||
        "";

    const username = propUsername || localStorage.getItem("username") || "Player";

    const getFullImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http")) return imageUrl;
        return `${BASE_URL}${imageUrl}`;
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${BASE_URL}/api/chat/upload-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || t('upload_failed'));
        }

        const data = await response.json();
        return data.imageUrl;
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            setSelectedImage({ file, url: ev.target.result, name: file.name });
        };
        reader.readAsDataURL(file);
    };

    const handleImageCancel = () => {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!amount || !selectedImage) return;

        setIsSending(true);
        try {
            let imageUrl = null;
            if (selectedImage?.file) {
                imageUrl = await uploadImage(selectedImage.file);
            }

            const messageText = `Add Balance Request\nUsername: ${username}\nAmount: ${amount}`;

            const conn = connectionRef.current;
            if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
                throw new Error("Chat connection is not established");
            }

            await conn.invoke("SendMessage", "admin", messageText, imageUrl);

            // Optionally reset and close
            setAmount("");
            setSelectedImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onClose?.();
            // alert("Request sent to admin.");
        } catch (err) {
            console.error("Send error:", err);
            // alert("Could not send request: " + (err.message || err));
        } finally {
            setIsSending(false);
        }
    };

    // Open SignalR connection when modal opens, close when it closes
    useEffect(() => {
        let mounted = true;
        const startConnection = async () => {
            try {
                if (connectionRef.current) return;
                const conn = new signalR.HubConnectionBuilder()
                    .withUrl(`${BASE_URL}/adminChatHub`, { accessTokenFactory: () => token })
                    .withAutomaticReconnect()
                    .build();

                conn.onclose(() => {
                    if (mounted) setIsConnected(false);
                });

                await conn.start();
                if (!mounted) {
                    await conn.stop();
                    return;
                }
                connectionRef.current = conn;
                setIsConnected(true);
            } catch (err) {
                console.error("SignalR start error:", err);
                setIsConnected(false);
            }
        };

        if (isOpen) startConnection();

        return () => {
            mounted = false;
            if (connectionRef.current) {
                connectionRef.current.stop().catch(() => {});
                connectionRef.current = null;
                setIsConnected(false);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const modal = (
        <div className="ab-overlay">
            <div className="ab-modal">
                <button className="ab-close" onClick={onClose} aria-label={t('close')}>×</button>

                <div className="ab-wallet-card">
                    <div className="ab-wallet-icon">฿</div>
                    <div className="ab-wallet-info">
                        <div className="ab-wallet-label">{t('bitcoin_wallet')}</div>
                        <div className="ab-wallet-address">{walletAddress || t('wallet_address') + ': 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'}</div>
                    </div>
                </div>

                <div className="ab-username">{username}</div>

                <form className="ab-form" onSubmit={handleSend}>
                    <label className="ab-label">{t('amount')}</label>
                    <input
                        className="ab-input"
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t('enter_amount')}
                        required
                    />

                    <p className="ab-note">{t('please_upload_receipt')}</p>

                    {selectedImage && (
                        <div className="ab-image-preview">
                            <img src={selectedImage.url} alt={selectedImage.name} />
                            <button type="button" className="ab-cancel-image" onClick={handleImageCancel}>×</button>
                        </div>
                    )}

                    <div className="ab-file-row">
                        <input
                            ref={fileInputRef}
                            id="ab-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="ab-file-input"
                        />
                        <label htmlFor="ab-file-input" className="ab-file-label">{t('upload_receipt')}</label>
                    </div>

                    <div className="ab-actions">
                        <button type="button" className="ab-btn ab-cancel" onClick={onClose} disabled={isSending}>{t('close')}</button>
                        <button
                            type="submit"
                            className="ab-btn ab-send"
                            disabled={isSending || !amount || !selectedImage || !isConnected}
                            aria-label={t('send')}
                        >
                            {isSending ? t('sending') : !isConnected ? t('connecting') : t('send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
