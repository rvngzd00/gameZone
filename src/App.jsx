import './App.css'
import Navbar from './components/mainLayout/Navbar'
import TopBar from './components/mainLayout/TopBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import LandingPage from './components/mainPage/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Footer from './components/mainLayout/Footer'
import Games from './components/games/Games'
import Profile from './components/profile/Profile'
import Wallet from './components/wallet/Wallet'

function App() {
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
              <Route path="/tournaments" element={<LandingPage />} />
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
