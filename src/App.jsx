import './App.css'
import Navbar from './components/mainLayout/Navbar'
import TopBar from './components/mainLayout/TopBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useEffect } from 'react'
import LandingPage from './components/mainPage/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Footer from './components/mainLayout/Footer'
import Games from './components/games/Games'
import Tournaments from './components/tournaments/Tournaments'
import Profile from './components/profile/Profile'
import Wallet from './components/wallet/Wallet'
import Chat from './components/chat/Chat'

function App() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }, [window.location.pathname]);
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app">
          <TopBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/games" element={<Games />} />
              {/* <Route path="/tournaments" element={<Tournaments />} /> */}
              <Route path="/chat" element={<Chat />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile" element={<Profile />} />
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
