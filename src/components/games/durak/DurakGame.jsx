
import { useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import './DurakReact.css';

function DurakGame() {
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
    console.log('🃏 DurakGame mounted');
    console.log('User:', user);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');

    if (!user || !token) {
      console.log('⏳ Waiting for user data...');
      return;
    }

    const handleLoad = () => {
      console.log('📺 Durak iframe loaded');
      
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
            balance: balance,
            token: token
          }
        };

        console.log('📤 Sending user data to Durak:', userData);
        iframe.contentWindow.postMessage(userData, '*');
        console.log('✅ User data sent to Durak');
      }, 500);
    };

    const iframe = iframeRef.current;
    
    if (iframe) {
      console.log('✅ iframe exists, adding listener');
      iframe.addEventListener('load', handleLoad);

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
    };
  }, [user, token, balance]);

  return (
    <div className="durak-game-container">
      <iframe
        ref={iframeRef}
        src="/Games/Durak/Durak.html"
        className="durak-game-iframe"
        title="Durak - Kart Oyunu"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

export default DurakGame;