// LotoMain.jsx
import { useSearchParams } from 'react-router-dom';
import LotoRoom from './LotoRoom';
import LotoGame from './LotoGame';

const LotoMain = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const password = searchParams.get('password');

  // Əgər roomId varsa oyunu göstər, yoxdursa lobby
  return roomId ? (
    <LotoGame roomId={roomId} password={password} />
  ) : (
    <LotoRoom />
  );
};

export default LotoMain;