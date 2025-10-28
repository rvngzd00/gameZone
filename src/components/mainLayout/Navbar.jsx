import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/games" className="nav-item" aria-label="Games">
          <div className="nav-icon" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor" />
            </svg>
          </div>
          <span>Games</span>
        </Link>

        <Link to="/tournaments" className="nav-item" aria-label="Tournaments">
          <div className="nav-icon" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="currentColor" />
            </svg>
          </div>
          <span>Tournaments</span>
        </Link>

        <Link to="/" className="nav-logo" aria-label="Home">
          <div className="logo-container">
            <div className="scene">
              <div className="cube">
                <div className="cube__face cube__face--front">
                  <span className="dot dot1"></span>
                  <span className="dot dot2"></span>
                  <span className="dot dot3"></span>
                  <span className="dot dot4"></span>
                  <span className="dot dot5"></span>
                </div>
                <div className="cube__face cube__face--back">
                  <span className="dot dot1"></span>
                  <span className="dot dot2"></span>
                </div>
                <div className="cube__face cube__face--right">
                  <span className="dot dot1"></span>
                  <span className="dot dot2"></span>
                  <span className="dot dot3"></span>
                  <span className="dot dot4"></span>
                </div>
                <div className="cube__face cube__face--left">
                  <span className="dot dot1"></span>
                  <span className="dot dot2"></span>
                  <span className="dot dot3"></span>
                </div>
                <div className="cube__face cube__face--top">
                  <span className="dot dot1"></span>
                  <span className="dot dot2"></span>
                  <span className="dot dot3"></span>
                  <span className="dot dot4"></span>
                  <span className="dot dot5"></span>
                  <span className="dot dot6"></span>
                </div>
                <div className="cube__face cube__face--bottom">
                  <span className="dot dot1"></span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/wallet" className="nav-item" aria-label="Wallet">
          <div className="nav-icon" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor" />
            </svg>
          </div>
          <span>Wallet</span>
        </Link>

        <Link to="/profile" className="nav-item" aria-label="Profile">
          <div className="nav-icon" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
            </svg>
          </div>
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;