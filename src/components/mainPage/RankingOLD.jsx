import React, { useContext } from 'react';
import './Ranking.css';
// import { useAppContext } from "../../context/AppContext";

const Ranking = () => {
    // const { theme } = useContext(useAppContext);

    // Mock data - In real app, this would come from context or props
    const weeklyRankings = [
        { id: 1, name: "John Wick", wins: 42 },
        { id: 2, name: "Sarah Connor", wins: 38 },
        { id: 3, name: "Max Power", wins: 35 },
        { id: 4, name: "Neo Matrix", wins: 33 },
        { id: 5, name: "Alice Wonder", wins: 31 }
    ];

    const monthlyRankings = [
        { id: 1, name: "Tyler Durden", coins: 45000 },
        { id: 2, name: "James Bond", coins: 42300 },
        { id: 3, name: "Ellen Ripley", coins: 40100 },
        { id: 4, name: "Tony Stark", coins: 38900 },
        { id: 5, name: "Lara Croft", coins: 37500 }
    ];

    return (
        <div className="ranking-container">
            <div className="ranking-section">
                <h2>Weekly Champions</h2>
                <div className="ranking-list">
                    {weeklyRankings.map((player) => (
                        <div key={player.id} className="ranking-item">
                            <span className="rank">{player.id}</span>
                            <span className="name">{player.name}</span>
                            <span className="stats">
                                <span className="wins">{player.wins}W</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ranking-section">
                <h2>Monthly Top Deposits</h2>
                <div className="ranking-list">
                    {monthlyRankings.map((player) => (
                        <div key={player.id} className="ranking-item">
                            <span className="rank">{player.id}</span>
                            <span className="name">{player.name}</span>
                            <span className="stats">
                                {/* <span className="wins">{player.wins}W</span> */}
                                <span className="coins">{player.coins}🪙</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Ranking;