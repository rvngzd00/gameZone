import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>GameZone</h3>
          <p>Play your favorite games online with friends!</p>
        </div>
        <div className="footer-section">
          <h4>Games</h4>
          <ul>
            <li>Backgammon</li>
            <li>Dominoes</li>
            <li>Turkish Okey</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li>How to Play</li>
            <li>Rules</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2025 GameZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;