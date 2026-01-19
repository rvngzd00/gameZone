import './App.css'
import Navbar from './components/mainLayout/Navbar'
import TopBar from './components/mainLayout/TopBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext'
import { useContext } from 'react'
import LandingPage from './components/mainPage/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './components/profile/Profile'
import Wallet from './components/wallet/Wallet'
import Chat from './components/chat/Chat'
import ScrollToTop from './context/ScrollToTop'
import TestLogin from './components/TestLogin'
import ProtectedRoute from './components/auth/ProtectedRoute'

import RouteStyleController from './context/RouteStyleController.jsx'

// Games Import 
import Games from './components/games/Games'
import LotoLobby from './components/games/loto/LotoLobby.jsx'
import LotoGame from './components/games/loto/LotoGame.jsx'
import Backgammon from './components/games/backgammon/Backgammon.jsx'
import SekaGame from './components/games/seka/SekaGame.jsx'
import DurakGame from './components/games/durak/DurakGame.jsx'
import PokerGame from './components/games/poker/PokerGame.jsx'
import DominoGame from './components/games/domino/DominoGame.jsx'
import OkeyGame from './components/games/okey/OkeyGame.jsx'


import SnowEffect from './components/mainLayout/SnowEffect'

import AdminDashboard from './components/admin/AdminDashboard'

import BackgammonGame from './components/games/BACKGAMMMONN/BackgammonREACT.jsx'

const ProtectedRouteWrapper = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  return <ProtectedRoute isAuthenticated={isAuthenticated}>{children}</ProtectedRoute>;
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app">
          <TopBar />
          <main className="main-content">
            <RouteStyleController />
          {/* <SnowEffect snowflakeCount={7} /> */}
            <ScrollToTop />
            <Routes>

              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/games"
                element={
                  <ProtectedRouteWrapper>
                    <Games />
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/loto"
                element={
                  <ProtectedRouteWrapper>
                    <LotoLobby />
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/loto/:roomId"
                element={
                  <ProtectedRouteWrapper>
                    <LotoGame />
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/backgammon"
                element={
                  <ProtectedRouteWrapper>
                    <Backgammon/>
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/backgammonT"
                element={
                  <ProtectedRouteWrapper>
                    <BackgammonGame/>
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/seka"
                element={
                  <ProtectedRouteWrapper>
                    <SekaGame/>
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/durak"
                element={
                  <ProtectedRouteWrapper>
                    <DurakGame/>
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/poker"
                element={
                  <ProtectedRouteWrapper>
                    <PokerGame/>
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/domino"
                element={
                  <ProtectedRouteWrapper>
                    <DominoGame/>
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/okey"
                element={
                  <ProtectedRouteWrapper>
                    <OkeyGame/>
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRouteWrapper>
                    <Chat />
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRouteWrapper>
                    <Wallet />
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/profile"
                element={
                  // <ProtectedRouteWrapper>
                    <Profile />
                  // </ProtectedRouteWrapper>
                }
              />

              <Route path='/admin'
                element={<AdminDashboard />} />

              {/* <Route path="/test-login" element={<TestLogin />} /> */}
            </Routes>
          </main>
          <Navbar />
          {/* <Footer /> */}
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App
