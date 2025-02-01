import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [stocks, setStocks] = useState<CharacterStock[]>([...PLACEHOLDER_STOCKS]);
  const [portfolio, setPortfolio] = useState<UserPortfolio>(PLACEHOLDER_PORTFOLIO);

  // Fetch data on mount and when login status changes
  const fetchData = useCallback(async () => {
    try {
      const [stockData, portfolioData] = await Promise.all([
        getStockMarketData(),
        isLoggedIn ? getPortfolioData() : PLACEHOLDER_PORTFOLIO
      ]);
      setStocks(stockData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized portfolio stats
  const portfolioStats = useMemo(() => ({
    netWorth: portfolio.cash + Object.entries(portfolio.stocks).reduce((total, [stockId, holding]) => {
      const stock = stocks.find(s => s.id === stockId);
      return total + (stock?.currentPrice || 0) * holding.quantity;
    }, 0),
    profitLossOverall: "+15%",
    profitLossLastChapter: "+5%"
  }), [portfolio, stocks]);

  // Memoized filtered and sorted stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      if (filter === 'Owned') return stock.id in portfolio.stocks;
      if (filter === 'Popular') return stock.popularity > 7;
      return true;
    });
  }, [stocks, filter, portfolio.stocks]);

  const sortedStocks = useMemo(() => {
    return filteredStocks
      .filter(stock => stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => sortOrder === 'Ascending' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [filteredStocks, searchQuery, sortOrder]);

  // Optimized buy/sell handlers
  const handleStockTransaction = useCallback(async (type: 'buy' | 'sell', name: string) => {
    const stock = stocks.find(s => s.name === name);
    if (!stock) return;

    const quantity = 1;
    const totalCost = stock.currentPrice * quantity;
    const existingHolding = portfolio.stocks[stock.id];

    // Optimistic update
    const newPortfolio = { ...portfolio };
    if (type === 'buy') {
      if (!existingHolding || portfolio.cash >= totalCost) {
        newPortfolio.cash -= totalCost;
        newPortfolio.stocks = {
          ...portfolio.stocks,
          [stock.id]: {
            quantity: (existingHolding?.quantity || 0) + quantity,
            averagePurchasePrice: existingHolding
              ? ((existingHolding.averagePurchasePrice * existingHolding.quantity) + totalCost) / (existingHolding.quantity + quantity)
              : stock.currentPrice
          }
        };
      } else {
        alert('Insufficient funds');
        return;
      }
    } else {
      if (existingHolding && existingHolding.quantity >= quantity) {
        newPortfolio.cash += totalCost;
        const newQuantity = existingHolding.quantity - quantity;
        if (newQuantity > 0) {
          newPortfolio.stocks = {
            ...portfolio.stocks,
            [stock.id]: { ...existingHolding, quantity: newQuantity }
          };
        } else {
          const { [stock.id]: _, ...rest } = portfolio.stocks;
          newPortfolio.stocks = rest;
        }
      } else {
        alert('Not enough shares to sell');
        return;
      }
    }

    setPortfolio(newPortfolio);

    try {
      await (type === 'buy' ? buyStock : sellStock)(name, quantity);
    } catch (error) {
      setPortfolio(portfolio); // Revert on error
      alert(error instanceof Error ? error.message : 'Transaction failed');
    }
  }, [portfolio, stocks]);

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <PortfolioOverview
          userName={isLoggedIn ? (portfolio.username || "Anonymous Pirate") : "Guest Pirate"}
          netWorth={new Intl.NumberFormat().format(portfolioStats.netWorth || 0)}
          cash={new Intl.NumberFormat().format(portfolio.cash || 0)}
          profitLossOverall={portfolioStats.profitLossOverall}
          profitLossLastChapter={portfolioStats.profitLossLastChapter}
          profileImage={portfolio.profilePicture}
          isLoggedIn={isLoggedIn}
        />
        <PriceHistoryGraph
          stocks={stocks}
          ownedStocks={Object.keys(portfolio.stocks)}
          onVisibilityChange={(id, visibility) => {
            setStocks(prev => prev.map(stock => {
              if (stock.id === id) return { ...stock, visibility };
              if (visibility === 'only') return { ...stock, visibility: 'hide' };
              return stock;
            }));
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
              <select className="stock-filter-btn" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                <option value="All">All</option>
                <option value="Owned">Owned</option>
                <option value="Popular">Popular</option>
              </select>
              <select className="stock-sort-btn" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
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
              onBuy={() => handleStockTransaction('buy', stock.name)}
              onSell={() => handleStockTransaction('sell', stock.name)}
              onVisibilityChange={(id, visibility) => {
                setStocks(prev => prev.map(s => {
                if (s.id === id) return { ...s, visibility };
                if (visibility === 'only') return { ...s, visibility: 'hide' };
                return s;
                }));
              }}
              ownedQuantity={portfolio.stocks[stock.id]?.quantity || 0}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;