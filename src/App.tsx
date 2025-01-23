import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { INITIAL_CHARACTER_STOCKS } from './assets/data/characterStock';
import { CharacterStock, UserPortfolio } from './types/CharacterStock';
import HomePage from './pages/Home/Home';
import LeaderboardPage from './pages/Leaderboard/Leaderboard';
import './App.css';

const OnePieceStockMarket: React.FC = () => {
  const [stocks, setStocks] = useState<CharacterStock[]>(INITIAL_CHARACTER_STOCKS);
  const [portfolio, setPortfolio] = useState<UserPortfolio>({
    cash: 100000,
    stocks: {}
  });
  const handleBuy = (characterId: string) => {
    const stock = stocks.find(s => s.id === characterId);
    if (stock && portfolio.cash >= stock.currentPrice) {
      setPortfolio(prev => ({
        cash: prev.cash - stock.currentPrice,
        stocks: {
          ...prev.stocks,
          [characterId]: {
            quantity: (prev.stocks[characterId]?.quantity || 0) + 1,
            averagePurchasePrice: stock.currentPrice
          }
        }
      }));
    }
  };

  const handleSell = (characterId: string) => {
    const stock = stocks.find(s => s.id === characterId);
    const currentHolding = portfolio.stocks[characterId];

    if (stock && currentHolding && currentHolding.quantity > 0) {
      setPortfolio(prev => ({
        cash: prev.cash + stock.currentPrice,
        stocks: {
          ...prev.stocks,
          [characterId]: {
            quantity: currentHolding.quantity - 1,
            averagePurchasePrice: currentHolding.averagePurchasePrice
          }
        }
      }));
    }
  };

  
  return (
    <Router>
      <div className="one-piece-stock-market">
        <header className="market-header">
          <div className="pirate-banner">
            <img src="/assets/skull-flag.png" alt="Pirate Flag" className="pirate-flag" />
            <h1 className="market-title">StockPiece: Grand Line Exchange</h1>
          </div>
          <nav className="nav-links">
            <Link to="/" className="nav-btn">Home</Link>
            <Link to="/leaderboard" className="nav-btn">Leaderboard</Link>
          </nav>
          <div className="user-controls">
            <button className="nav-btn" onClick={() => setStocks(INITIAL_CHARACTER_STOCKS)}>Settings</button>
            <button className="nav-btn logout-btn">Logout</button>
          </div>
        </header>
        <Routes>
          <Route path="/" element={
            <HomePage
              stocks={stocks}
              portfolio={portfolio}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          } />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
        <footer className="market-footer">
          <p>© {new Date().getFullYear()} Straw Hat Investments. Sailing the Seas of Profit!</p>
        </footer>
      </div>
    </Router>
  );
};

export default OnePieceStockMarket;