import { useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import './DominoReact.css';

function DominoGame() {
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
    console.log('🎯 DominoGame mounted');
    console.log('User:', user);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');

    if (!user || !token) {
      console.log('⏳ Waiting for user data...');
      return;
    }

    const handleLoad = () => {
      console.log('📺 Domino iframe loaded');

      setTimeout(() => {
        const iframe = iframeRef.current;

        if (!iframe || !iframe.contentWindow) {
          console.error('❌ iframe or contentWindow is null');
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

        console.log('📤 Sending user data to Domino:', userData);
        iframe.contentWindow.postMessage(userData, '*');
        console.log('✅ User data sent to Domino');
      }, 500);
    };
    const handleMessage = (event) => {

      if (event.data?.type === 'BACK_TO_GAMES') {
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
    <div className="domino-game-container">
      <iframe
        ref={iframeRef}
        src="/Games/Domino/Domino.html"
        className="domino-game-iframe"
        title="Domino Oyunu"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

export default DominoGame;