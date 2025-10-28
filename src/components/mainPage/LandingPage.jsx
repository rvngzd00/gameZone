import React from 'react';
import './LandingPage.css';
import Galaxy from '../CustomBackground/Galaxy';
import dominoesImg from '../../assets/game-images/Dominoes Image.png';
import backgammonImg from '../../assets/game-images/BackGammon Image.png';
import chessImg from '../../assets/game-images/Chess Image.png';
import durakImg from '../../assets/game-images/Durak Image.png';

const LandingPage = () => {
    return (
        <section className="hero-section">
            
            <div className="hero-content">
                <div className="hero-grid">
                    <div className="hero-text">
                        <h1>Classic Table Games, Modern Experience</h1>
                        <p>
                            Join our community of players and experience your favorite table games
                            in a whole new way. Challenge friends or meet new opponents in dominoes,
                            backgammon, and more!
                        </p>
                        <div className="hero-features">
                            <div className="feature-item">
                                <span>✓ Live Matches</span>
                            </div>
                            <div className="feature-item">
                                <span>✓ Global Rankings</span>
                            </div>
                           
                        </div>
                        <div className="cta-buttons">
                            <button className="btn btn-primary">Start Playing Now</button>
                            <button className="btn btn-secondary">Learn More</button>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="game-preview">
                            <div className="game-card">
                              <img src={dominoesImg} alt="Dominoes" className="game-card-img" />
                            </div>
                            <div className="game-card">
                              <img src={backgammonImg} alt="Backgammon" className="game-card-img" />
                            </div>
                            <div className="game-card">
                              <img src={chessImg} alt="Chess" className="game-card-img" />
                            </div>
                            <div className="game-card">
                              <img src={durakImg} alt="Durak" className="game-card-img" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingPage;