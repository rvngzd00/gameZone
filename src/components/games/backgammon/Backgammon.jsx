import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import './BackgammonReact.css';
function BackgammonGame() {
  const { user, balance, isAuthenticated, token } = useAppContext();
  const iframeRef = useRef(null);
  const navigate = useNavigate();
  const [gameStatus, setGameStatus] = useState('Oyun yüklənir...');
  const [isLoading, setIsLoading] = useState(true);




  // // 🔒 User yoxdursa login-ə yönləndir
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user || !token) return;

    const handleLoad = () => {
      setIsLoading(false);

      // iframe yüklənəndən bir az sonra user datasını göndər
      setTimeout(() => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) return;

        // 🎯 User datasını oyuna göndər
        iframe.contentWindow.postMessage(
          {
            type: 'INIT_USER',
            payload: {
              userId: user.id,
              username: user.userName || user.username,
              fullName: user.fullName,
              balance: balance,
              token: token,
              avatar: user.avatar || user.userName?.charAt(0).toUpperCase()
            }
          },
          window.location.origin // Same origin
        );

        console.log('✅ User data sent to game:', {
          username: user.userName,
          balance: balance
        });
      }, 500);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
    }

    // 📨 Oyundan mesajları qəbul et
    const handleMessage = (event) => {
      // Security check - yalnız öz domain-dən
      if (event.origin !== window.location.origin) {
        console.warn('❌ Unauthorized message origin:', event.origin);
        return;
      }

      const { type, payload } = event.data;

      console.log('📩 Message from game:', type, payload);

      switch (type) {
        case 'GAME_READY':
          setGameStatus('Oyun hazırdır ✅');
          break;

        case 'GAME_STARTED':
          setGameStatus(`Oyun başladı! Mərc: ${payload.betAmount} 💰`);
          break;

        case 'BALANCE_CHANGE':
          // Balance dəyişdikdə context-i yenilə
          console.log('💰 Balance updated:', payload.newBalance);
          // updateBalance funksiyası varsa çağır
          break;

        case 'GAME_ENDED':
          setGameStatus(`Oyun bitdi! ${payload.winner} qalib oldu 🏆`);
          setTimeout(() => {
            // Oyun bitdikdən sonra lobby-ə qayıt və ya yenilə
            window.location.reload();
          }, 3000);
          break;

        case 'ERROR':
          console.error('❌ Game error:', payload.message);
          setGameStatus(`Xəta: ${payload.message}`);
          break;

        case 'NEED_MORE_BALANCE':
          alert(`Balans kifayət deyil! Tələb olunan: ${payload.required} 💰`);
          navigate('/');
          break;

        default:
          console.log('Unknown message type:', type);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [user, token, balance, navigate]);



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



