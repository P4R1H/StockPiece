import React, { useState } from 'react';
import CharacterStockCard from '../../components/Card/CharacterCard';
import PortfolioOverview from '../../components/Portfolio/Portfolio';
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import { HomePageProps } from '../../types/Pages';
import { NEWS_ITEMS } from '../../assets/data/newsItems';
import './Home.css';

const HomePage: React.FC<HomePageProps> = ({ stocks, portfolio, onBuy, onSell, onVisibilityChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Ascending');

  const calculatePortfolioStats = () => {
    const netWorth = portfolio.cash + Object.entries(portfolio.stocks)
      .reduce((total, [stockId, holding]) => {
        const stock = stocks.find(s => s.id === stockId);
        return total + (stock?.currentPrice || 0) * holding.quantity;
      }, 0);

    // Placeholder values for profit/loss - you'll need to implement actual calculations
    const profitLossOverall = "+15%";
    const profitLossLastChapter = "+5%";

    return {
      netWorth: `${netWorth.toLocaleString()}`,
      profitLossOverall,
      profitLossLastChapter
    };
  };

  const portfolioStats = calculatePortfolioStats();

  // Filter logic
  const filteredStocks = stocks.filter((stock) => {
    if (filter === 'Owned') {
      return stock.id in portfolio.stocks; // Check if owned
    } else if (filter === 'Popular') {
      return stock.popularity > 7;
    }
    return true;
  });
  
  // Search and sort logic
  const sortedStocks = filteredStocks
    .filter((stock) => stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === 'Ascending' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  return (
    <div className="dashboard-container">
      <div className="dashboard">
      <PortfolioOverview 
          userName="Pirate Trader"
          netWorth={portfolioStats.netWorth}
          profitLossOverall={portfolioStats.profitLossOverall}
          profitLossLastChapter={portfolioStats.profitLossLastChapter}
        />
        <PriceHistoryGraph 
  stocks={stocks} 
  ownedStocks={Object.keys(portfolio.stocks)} // Pass owned stock IDs
/>
      </div>
      <main className="stock-market-main">
        <div className="stock-card-container">
          <div className="market-controls-wrapper">
            <div className="search-controls">
              <input
                type="text"
                placeholder="Search characters..."
                className="stock-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="stock-filter-btn"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'All' | 'Owned' | 'Popular')}
              >
                <option value="All">All</option>
                <option value="Owned">Owned</option>
                <option value="Popular">Popular</option>
              </select>
              <select
                className="stock-sort-btn"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'Ascending' | 'Descending')}
              >
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
            </div>
            <div className="news-ticker">
              <div className="ticker-content">
                {NEWS_ITEMS.map((item, index) => (
                  <span key={index} className="ticker-item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="stock-grid">
            {sortedStocks.map((stock) => (
              <CharacterStockCard
                key={stock.id}
                stock={stock}
                onBuy={onBuy}
                onSell={onSell}
                onVisibilityChange={onVisibilityChange}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;