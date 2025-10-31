import React from 'react';
import './Wallet.css';

const Wallet = () => {
    // Mock data - replace with real data from your context
    const walletData = {
        balance: 7777,
        currency: 'Coins',
        transactions: [
            { id: 1, type: 'win', amount: 500, game: 'Poker', time: '2h ago' },
            { id: 2, type: 'deposit', amount: 1000, source: 'Bank Transfer', time: '1d ago' },
            { id: 3, type: 'loss', amount: 200, game: 'Blackjack', time: '2d ago' },
            { id: 4, type: 'win', amount: 750, game: 'Dominoes', time: '3d ago' },
        ]
        // cards: [
        //     { id: 1, type: 'gold', number: '**** **** **** 4582', expires: '12/26' },
        //     { id: 2, type: 'silver', number: '**** **** **** 1234', expires: '09/25' }
        // ]
    };

    return (
        <div className="wallet-container">
            <div className="balance-card">
                <div className="balance-glow"></div>
                <div className="balance-content">
                    <span className="balance-label">Balance</span>
                    <h1 className="balance-amount-wallet">
                        {/* <span className="currency-icon">💰</span> */}
                        {walletData.balance.toLocaleString()}
                    </h1>
                    <div className="balance-actions">
                        <button className="action-btn deposit">
                            <span className="btn-icon">↑</span>
                            Deposit
                        </button>
                        <button className="action-btn withdraw">
                            <span className="btn-icon">↓</span>
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>

            {/* <div className="wallet-grid"> */}
                {/* <section className="wallet-section cards-section">
                    <h2>Payment Methods</h2>
                    <div className="cards-container">
                        {walletData.cards.map(card => (
                            <div key={card.id} className={`payment-card ${card.type}`}>
                                <div className="card-chip"></div>
                                <span className="card-number">{card.number}</span>
                                <div className="card-footer">
                                    <span className="card-expires">Expires {card.expires}</span>
                                    <span className="card-type">{card.type.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                        <button className="add-card-btn">
                            <span className="add-icon">+</span>
                            Add New Card
                        </button>
                    </div>
                </section> */}

                <section className="wallet-section history-section">
                    <h2>Recent Transactions</h2>
                    <div className="transactions-list">
                        {walletData.transactions.map(tx => (
                            <div key={tx.id} className={`transaction-item ${tx.type}`}>
                                <div className="transaction-icon">
                                    {tx.type === 'win' ? '🎯' : tx.type === 'deposit' ? '💳' : '🎲'}
                                </div>
                                <div className="transaction-details">
                                    <span className="transaction-title">
                                        {tx.type === 'deposit' ? tx.source : tx.game}
                                    </span>
                                    <span className="transaction-time">{tx.time}</span>
                                </div>
                                <div className="transaction-amount">
                                    <span className={`amount ${tx.type}`}>
                                        {tx.type === 'loss' ? '-' : '+'}{tx.amount}
                                    </span>
                                    <span className="amount-currency">{walletData.currency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        // </div>
    );
};

export default Wallet;