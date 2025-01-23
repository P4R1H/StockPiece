import React, { useState } from 'react';
import { INITIAL_CHARACTER_STOCKS } from './assets/data/characterStock';
import { CharacterStock, UserPortfolio } from './types/CharacterStock';
import CharacterStockCard from './components/Card/CharacterStockCard.tsx';
import PortfolioOverview from './components/PortfolioOverview/PortfolioOverview.tsx';
import PriceHistoryGraph from './components/StockGraph/PriceHistoryGraph.tsx';

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
    <div className="one-piece-stock-market">
    <header className="market-header">
      <div className="pirate-banner">
        <img src="/assets/skull-flag.png" alt="Pirate Flag" className="pirate-flag" />
        <h1 className="market-title">StockPiece: Grand Line Exchange</h1>
      </div>
      
      <nav className="nav-links">
        <button className="nav-btn">Leaderboard</button>
      </nav>

      <div className="user-controls">
        <button className="nav-btn">Settings</button>
        <button className="nav-btn logout-btn">Logout</button>
      </div>
    </header>      
    <div className="dashboard">
        <PortfolioOverview portfolio={portfolio} />
        <PriceHistoryGraph stocks={stocks} />
      </div>
      <main className="stock-market-main">
        <div className="stock-grid">
          {stocks.map(stock => (
            <CharacterStockCard 
              key={stock.id}
              stock={stock}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          ))}
        </div>
      </main>
      <footer className="market-footer">
        <p>© {new Date().getFullYear()} Straw Hat Investments. Sailing the Seas of Profit!</p>
      </footer>
    </div>
  );
};

export default OnePieceStockMarket;
