// DominoMain.jsx
import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAppContext } from '../../../context/AppContext'; // AppContext-dən token çəkmək üçün
import DominoRoom from './DominoRoom';
import DominoGame from './DominoGame';

// Toast notification utility
export const showToast = (msg, success = false) => {
  const toast = document.createElement('div');
  toast.className = success ? 'toast success' : 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
};

const DominoMain = () => {
  const { token, balance } = useAppContext(); // AppContext-dən token və balance
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState('room'); // 'room' or 'game'
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentRoomName, setCurrentRoomName] = useState('Domino');
  const [currentRoomPassword, setCurrentRoomPassword] = useState(null);

  useEffect(() => {
    // Token yoxdursa bağlanma
    if (!token) {
      console.error("Token tapılmadı. Zəhmət olmasa daxil olun.");
      showToast("Zəhmət olmasa daxil olun");
      return;
    }

    // Check if we have roomId from URL params (for direct join)
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('roomId');
    const passwordFromUrl = urlParams.get('password');

    // Create SignalR connection
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.100.26:5063/dominoHub", {
        accessTokenFactory: () => token // localStorage-dən gələn token
      })
      .withAutomaticReconnect()
      .build();

    // Global event handlers
    conn.on("UserData", (data) => {
      // Balance artıq AppContext-dən gəlir
      console.log("UserData alındı:", data);
    });

    conn.on("DominoRoomCreated", () => {
      // Room list will auto-refresh in DominoRoom component
      console.log("Yeni room yaradıldı");
    });

    conn.on("RoomDeleted", () => {
      // Room list will auto-refresh in DominoRoom component
      console.log("Room silindi");
    });

    // Connection state handlers
    conn.onreconnecting(() => {
      setIsConnected(false);
      console.log("Reconnecting to SignalR...");
      showToast("Yenidən bağlanılır...");
    });

    conn.onreconnected(() => {
      setIsConnected(true);
      console.log("Reconnected to SignalR");
      showToast("Yenidən bağlandı", true);
    });

    conn.onclose(() => {
      setIsConnected(false);
      console.log("Disconnected from SignalR");
      showToast("Əlaqə kəsildi");
    });

    // Start connection
    conn.start()
      .then(() => {
        console.log("SignalR Connected");
        setIsConnected(true);
        setConnection(conn);
        showToast("Serverə bağlandı", true);
        
        // If there's a roomId in URL, join directly
        if (roomIdFromUrl) {
          setCurrentRoomId(roomIdFromUrl);
          setCurrentRoomPassword(passwordFromUrl);
          setCurrentView('game');
          conn.invoke("JoinRoom", roomIdFromUrl, passwordFromUrl || null).catch((err) => {
            console.error("Join room error:", err);
            showToast("Room-a qoşulmaq alınmadı");
            setCurrentView('room');
          });
        }
      })
      .catch((err) => {
        console.error("SignalR Connection error:", err);
        setIsConnected(false);
        showToast("Serverə bağlanmaq alınmadı");
      });

    // Cleanup on unmount
    return () => {
      if (conn) {
        conn.stop();
      }
    };
  }, [token]); // token dəyişəndə yenidən bağlan

  const handleJoinRoom = async (roomId, password) => {
    if (!connection || !isConnected) {
      showToast("Serverə bağlantı yoxdur");
      return;
    }

    setCurrentRoomId(roomId);
    setCurrentRoomPassword(password);
    setCurrentView('game');
    
    try {
      await connection.invoke("JoinRoom", roomId, password);
    } catch (err) {
      console.error("Join room error:", err);
      showToast("Room-a qoşulmaq alınmadı");
      setCurrentView('room');
    }
  };

  const handleLeaveRoom = async () => {
    if (connection) {
      try {
        await connection.invoke("LeaveRoom");
      } catch (err) {
        console.error("Leave room error:", err);
      }
    }
    setCurrentView('room');
    setCurrentRoomId(null);
    setCurrentRoomPassword(null);
    setCurrentRoomName('Domino');
  };

  return (
    <div>
      {currentView === 'room' ? (
        <DominoRoom
          connection={connection}
          userBalance={balance} // AppContext-dən balance
          isConnected={isConnected}
          onJoinRoom={handleJoinRoom}
        />
      ) : (
        <DominoGame
          connection={connection}
          userBalance={balance} // AppContext-dən balance
          roomName={currentRoomName}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
};

export default DominoMain;