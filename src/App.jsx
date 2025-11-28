import './App.css'
import Navbar from './components/mainLayout/Navbar'
import TopBar from './components/mainLayout/TopBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext'
import LandingPage from './components/mainPage/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Footer from './components/mainLayout/Footer'
import Games from './components/games/Games'
import Profile from './components/profile/Profile'
import Wallet from './components/wallet/Wallet'
import Chat from './components/chat/Chat'
import ScrollToTop from './context/ScrollToTop'
import TestLogin from './components/TestLogin'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useContext } from 'react'
import LotoMain from './components/games/loto/LotoMain'
import DominoMain from './components/games/domino/DominoMain'
import Backgammon from './components/games/backgammon/Backgammon'

import AdminDashboard from './components/admin/AdminDashboard'
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
                    <LotoMain />
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/domino"
                element={
                  <ProtectedRouteWrapper>
                    <DominoMain />
                  </ProtectedRouteWrapper>
                }
              />
              <Route
                path="/games/backgammon"
                element={
                  <ProtectedRouteWrapper>
                    <Backgammon />
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
                  <ProtectedRouteWrapper>
                    <Profile />
                  </ProtectedRouteWrapper>
                }
              />

              <Route path='/admin'
                element={<AdminDashboard />} />
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
