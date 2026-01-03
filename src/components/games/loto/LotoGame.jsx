import { useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import './LotoReact.css';

function LotoGame() {
  const { user, balance, isAuthenticated, refreshBalance, token } = useAppContext();
  const iframeRef = useRef(null);
  const navigate = useNavigate();
  const { roomId } = useParams(); // URL-dən roomId götür

  // 🔒 Autentifikasiya yoxlaması
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 📨 iframe ilə kommunikasiya
  useEffect(() => {
    console.log('🎮 LotoGame mounted');
    console.log('Room ID:', roomId);
    console.log('User:', user);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');

    // User yoxdursa gözlə
    if (!user || !token) {
      console.log('⏳ Waiting for user data...');
      return;
    }

    // roomId yoxdursa lobby-ə qayıt
    if (!roomId) {
      console.error('❌ No roomId in URL');
      navigate('/games/loto');
      return;
    }

    // iframe yüklənəndə user data və roomId göndər
    const handleLoad = () => {
      console.log('📺 Game iframe loaded');
      
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
            balance: balance,
            token: token,
            roomId: roomId // ← roomId də göndər
          }
        };

        console.log('📤 Sending user data to game:', userData);
        iframe.contentWindow.postMessage(userData, '*');
        console.log('✅ User data sent to game');
      }, 700);
    };

    // iframe-dən mesajları qəbul et
    const handleMessage = (event) => {
      console.log('📩 Message from game iframe:', event.data);

      // BALANCE update
      if (event.data?.type === 'BALANCE_UPDATED') {
        refreshBalance();
      }

      // BACK_TO_LOBBY mesajı gəldikdə lobby-ə qayıt
      if (event.data?.type === 'BACK_TO_LOBBY') {
        console.log('🔙 Returning to lobby');
        navigate('/games/loto');
      }

      // Oyun bitdikdə lobby-ə avtomatik qayıt
      if (event.data?.type === 'GAME_ENDED') {
        console.log('🏁 Game ended, returning to lobby...');
        setTimeout(() => {
          navigate('/games/loto');
        }, 8000);
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
  }, [user, token, balance, roomId, navigate]);

  return (
    <div className="loto-game-container">
      <iframe
        ref={iframeRef}
        src="/Games/Loto/Loto.html"
        className="loto-game-iframe"
        title="10 Line Loto"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

export default LotoGame;