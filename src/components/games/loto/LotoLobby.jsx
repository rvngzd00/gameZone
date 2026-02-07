import { useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import './LotoReact.css';

function LotoLobby() {
  const { user, balance, isAuthenticated, token,language } = useAppContext();
  const iframeRef = useRef(null);
  const navigate = useNavigate();
  
  // 🔒 Autentifikasiya yoxlaması
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 📨 iframe ilə kommunikasiya
  useEffect(() => {
    console.log('🎰 LotoLobby mounted');
    console.log('User:', user);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');

    // User yoxdursa gözlə
    if (!user || !token) {
      console.log('⏳ Waiting for user data...');
      return;
    }

    // iframe yüklənəndə user data göndər
    const handleLoad = () => {
      console.log('📺 Lobby iframe loaded');

      setTimeout(() => {
        const iframe = iframeRef.current;

        if (!iframe) {
          console.error('❌ iframe ref is null');
          return;
        }

        if (!iframe.contentWindow) {
          console.error('❌ iframe.contentWindow is null');
          return;
        }

        const userData = {
          type: 'INIT_USER',
          payload: {
            userId: user.id,
            username: user.username,
            fullName: user.fullName,
            language: language,
            balance: balance,
            token: token
          }
        };

        console.log('📤 Sending user data to lobby:', userData);
        iframe.contentWindow.postMessage(userData, '*');
        console.log('✅ User data sent to lobby');
      }, 500);
    };

    // iframe-dən mesajları qəbul et
    const handleMessage = (event) => {
      console.log('📩 Message from lobby iframe:', event.data);

      // JOIN_ROOM mesajı gəldikdə oyuna keç
      if (event.data?.type === 'JOIN_ROOM') {
        const roomId = event.data.roomId;
        console.log(`🎮 Joining room: ${roomId}`);
        navigate(`/games/loto/${roomId}`);
      }
      // JOIN_ROOM mesajı gəldikdə oyuna keç
      if (event.data?.type === 'BACK_TO_GAMES') {
        console.log(`🎮 Returning to lobby`);
        navigate(`/games`);
      }
    };

    const iframe = iframeRef.current;

    if (iframe) {
      console.log('✅ iframe exists, adding listeners');
      iframe.addEventListener('load', handleLoad);
      window.addEventListener('message', handleMessage);

      // Əgər artıq yüklənibsə
      if (iframe.contentDocument?.readyState === 'complete') {
        console.log('⚡ iframe already loaded');
        handleLoad();
      }
    } else {
      console.error('❌ iframe ref is null on mount');
    }

    // Cleanup
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [user, token, balance, navigate]);
 
  return (
    <div className="loto-lobby-container">
      <iframe
        ref={iframeRef}
        src="/Games/Loto/LotoLobby.html"
        className="loto-lobby-iframe"
        title="Loto Lobby"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

export default LotoLobby;