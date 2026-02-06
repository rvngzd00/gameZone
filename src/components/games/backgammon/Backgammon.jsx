import { useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import './BackgammonReact.css';

function BackgammonGame() {
  const { user, balance, isAuthenticated, token } = useAppContext();
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
    console.log('🎯 BackgammonGame mounted');
    console.log('User:', user);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');

    if (!user || !token) {
      console.log('⏳ Waiting for user data...');
      return;
    }

    const handleLoad = () => {
      console.log('📺 Backgammon iframe loaded');

      setTimeout(() => {
        const iframe = iframeRef.current;

        if (!iframe || !iframe.contentWindow) {
          console.error('❌ iframe or contentWindow is null');
          return;
        }

        const userData = {
          type: 'INIT_USER',
          payload: {
            userId: user.id || user.userId,
            username: user.userName || user.username,
            fullName: user.fullName,
            balance: balance,
            token: token,
            avatar: user.avatar || user.userName?.charAt(0).toUpperCase()
          }
        };

        console.log('📤 Sending user data to Backgammon:', userData);
        iframe.contentWindow.postMessage(userData, '*'); // ✅ '*' istifadə et
        console.log('✅ User data sent to Backgammon');
      }, 500);
    };

    // 📩 Oyundan gələn mesajlar (optional)

    const handleMessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'GAME_ENDED') {
        console.log('🏁 Game ended:', payload);
        // Oyun bitəndə nə etsək?
      } else if (type === 'ERROR') {
        console.error('❌ Game error:', payload);
      } else if (type === 'BALANCE_CHANGE') {
        console.log('💰 Balance changed:', payload);
      } else if (event.data?.type === 'BACK_TO_GAMES') {
        console.log(`🎮 Returning to lobby`);
        navigate(`/games`);
      }
    };

    const iframe = iframeRef.current;

    if (iframe) {
      console.log('✅ iframe exists, adding listener');
      iframe.addEventListener('load', handleLoad);
      window.addEventListener('message', handleMessage);


      if (iframe.contentDocument?.readyState === 'complete') {
        console.log('⚡ iframe already loaded');
        handleLoad();
      }
    } else {
      console.error('❌ iframe ref is null on mount');
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
      window.removeEventListener('message', handleMessage);

    };
  }, [user, token, balance]);





  return (
    <div className="backgammon-container">
      <iframe
        ref={iframeRef}
        src="/Games/Backgammon/Backgammon.html"
        className="backgammon-iframe"
        title="Türk Tavlası"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

export default BackgammonGame;