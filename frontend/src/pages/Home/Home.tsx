import React, { useState, useEffect } from 'react';
import CharacterStockCard from '../../components/Card/CharacterCard';
import PortfolioOverview from '../../components/Portfolio/Portfolio';
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import { PLACEHOLDER_PORTFOLIO, PLACEHOLDER_STOCKS } from '../../assets/data/sampleStocks';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';
import { CharacterStock, UserPortfolio } from '../../types/Stocks';
import { HomePageProps } from '../../types/Pages';
import { getStockMarketData, getPortfolioData, buyStock, sellStock } from './HomeServices';
import './Home.css';

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Ascending');
  const [stocks, setStocks] = useState<CharacterStock[]>([]);
  const [portfolio, setPortfolio] = useState<UserPortfolio>(PLACEHOLDER_PORTFOLIO);

  useEffect(() => {
    const fetchStocks = async () => {
      const stockData = await getStockMarketData()
      //const stockData = PLACEHOLDER_STOCKS;
      setStocks(stockData);
    };
    fetchStocks();

    const fetchPortfolio = async () => {
      const portfolioData = await getPortfolioData();
      setPortfolio(portfolioData);
    }
    if(isLoggedIn) {
      fetchPortfolio();
    }
  }, []);

  const handleVisibilityChange = (characterId: string, newVisibility: 'show' | 'hide' | 'only') => {
    setStocks(prevStocks => {
      return prevStocks.map(stock => {
        if (stock.id === characterId) {
          return { ...stock, visibility: newVisibility };
        }

        if (newVisibility === 'only') {
          return { ...stock, visibility: 'hide' };
        }
        return stock;
      });
    });
  };

  const onBuy = ( name : string ) => {
    buyStock( name );
  };
  const onSell =( name : string ) => {
    sellStock( name );
  };

  const calculatePortfolioStats = () => {
    const netWorth = portfolio.cash + Object.entries(portfolio.stocks)
      .reduce((total, [stockId, holding]) => {
        const stock = stocks.find(s => s.id === stockId);
        return total + (stock?.currentPrice || 0) * holding.quantity;
      }, 0);
    
    return {
      netWorth: `${netWorth.toLocaleString()}`,
      profitLossOverall: "+15%",
      profitLossLastChapter: "+5%"
    };
  };

  const portfolioStats = calculatePortfolioStats();

  const filteredStocks = stocks.filter((stock) => {
    if (filter === 'Owned') return stock.id in portfolio.stocks;
    if (filter === 'Popular') return stock.popularity > 7;
    return true;
  });
  
  const sortedStocks = filteredStocks
    .filter((stock) => stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortOrder === 'Ascending' 
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name));

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <PortfolioOverview 
          userName="Pirate Trader"
          netWorth={portfolioStats.netWorth}
          profitLossOverall={portfolioStats.profitLossOverall}
          profitLossLastChapter={portfolioStats.profitLossLastChapter}
          profileImage={portfolio.profilePicture}
          isLoggedIn={isLoggedIn}
        />
        <PriceHistoryGraph 
          stocks={stocks} 
          ownedStocks={Object.keys(portfolio.stocks)}
          onVisibilityChange={(id, visibility) => {
            handleVisibilityChange(id, visibility);
          }}
          currentFilter={filter}
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
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="All">All</option>
                <option value="Owned">Owned</option>
                <option value="Popular">Popular</option>
              </select>
              <select
                className="stock-sort-btn"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
            </div>
            <div className="news-ticker">
              <div className="ticker-content">
                {(isLoggedIn ? NEWS_ITEMS : LOGGED_OUT_ITEMS).map((item, index) => (
                  <span key={index} className="ticker-item">{item}</span>
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