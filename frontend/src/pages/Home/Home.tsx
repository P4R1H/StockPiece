import React, { useState, useEffect } from 'react';
import CharacterStockCard from '../../components/Card/CharacterCard';
import PortfolioOverview from '../../components/Portfolio/Portfolio';
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import { PLACEHOLDER_PORTFOLIO, PLACEHOLDER_STOCKS } from '../../assets/data/sampleStocks';
import { NEWS_ITEMS } from '../../assets/data/newsItems';
import { CharacterStock, UserPortfolio } from '../../types/Stocks';
import { HomePageProps } from '../../types/Pages';
import { getStockMarketData, getPortfolioData } from './HomeServices';

import './Home.css';

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Ascending');
  const [isLoading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<CharacterStock[]>([]);
  const [portfolio, setPortfolio] = useState<UserPortfolio>(PLACEHOLDER_PORTFOLIO)

  useEffect(() => {
    const fetchStocks = async () => {
      // const stockData = await getStockMarketData("tmp");
      const stockData = PLACEHOLDER_STOCKS
      setStocks(stockData);
    };
    fetchStocks();

    const fetchPortfolio = async () => {
      const portfolioData = await getPortfolioData("tmp");
      setPortfolio(portfolioData);
    }
    if(isLoggedIn) {
      fetchPortfolio()
    }
  }, []);


  const handleVisibilityChange = (characterId: string, newVisibility: 'show' | 'hide' | 'only') => {
    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.id === characterId ? { ...stock, visibility: newVisibility } : stock
      )
    );
  };

  const onBuy = () => {

  }

  const onSell = () => {
    
  }

  const calculatePortfolioStats = () => {
    const netWorth = portfolio.cash + Object.entries(portfolio.stocks)
      .reduce((total, [stockId, holding]) => {
        const stock = stocks.find(s => s.id === stockId);
        return total + (stock?.currentPrice || 0) * holding.quantity;
      }, 0);
    
    const profitLossOverall = "+15%";
    const profitLossLastChapter = "+5%";

    return {
      netWorth: `${netWorth.toLocaleString()}`,
      profitLossOverall,
      profitLossLastChapter
    };
  };

  const portfolioStats = calculatePortfolioStats();

  const filteredStocks = stocks.filter((stock) => {
    if (filter === 'Owned') {
      return stock.id in portfolio.stocks; // Check if owned
    } else if (filter === 'Popular') {
      return stock.popularity > 7;
    }
    return true;
  });
  
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
          profileImage="/assets/LockScreen.png"
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
            {stocks.map((stock) => (
              <CharacterStockCard
                key={stock.id}
                stock={stock}
                onBuy={onBuy}
                onSell={onSell}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;