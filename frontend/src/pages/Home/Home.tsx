// HomePage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CharacterStockCard from '../../components/Card/CharacterCard';
import BountyProfileCard from '../../components/Portfolio/Portfolio'; // Renamed import
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import { PLACEHOLDER_STOCKS } from '../../assets/data/sampleStocks';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';
import { CharacterStock, UserPortfolio } from '../../types/Stocks';
import { HomePageProps } from '../../types/Pages';
import { getStockMarketData, getPortfolioData, buyStock, sellStock } from './HomeServices';
import './Home.css';

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Ascending');
  const [stocks, setStocks] = useState<CharacterStock[]>([...PLACEHOLDER_STOCKS]); // Ensure PLACEHOLDER_STOCKS matches new CharacterStock interface, or fetch real data
  const [portfolio, setPortfolio] = useState<UserPortfolio>({ // Initialize with a default UserPortfolio structure
    username: 'Guest Pirate',
    cash: 0,
    stocks: [],
    isLoggedIn: false,
    profit: 0,
    stockValue: 0
  });

  const initialInvestment = 10000; // Initial investment amount

  // Fetch data on mount and when login status changes
  const fetchData = useCallback(async () => {
    try {
      const [stockData, portfolioData] = await Promise.all([
        getStockMarketData(), // You might need to update getStockMarketData to match new API if stock market data is also fetched
        isLoggedIn ? getPortfolioData() : Promise.resolve({ // Default portfolio for logged out users
          username: 'Guest Pirate',
          cash: 0,
          stocks: [],
          isLoggedIn: false,
          profit: 0,
          stockValue: 0
        })
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

  // Memoized portfolio stats calculation
  const portfolioStats = useMemo(() => {
    const netWorthValue = portfolio.stockValue + portfolio.cash;
    return {
      netWorth: netWorthValue.toLocaleString(), // Net worth is stockValue + cash
      cash: portfolio.cash.toLocaleString(), // Cash is directly from portfolio.cash (accountValue from API)
      profitLossOverall: (((netWorthValue) - initialInvestment) / initialInvestment * 100).toFixed(2) + "%",
      profitLossLastChapter: portfolio.profit.toFixed(2) + "%", // profitLossLastChapter is portfolio.profit
    };
  }, [portfolio, initialInvestment]);


  // Memoized filtered stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      if (filter === 'Owned') return portfolio.stocks.some(ownedStock => ownedStock.stock.id === stock.id);
      if (filter === 'Popular') return stock.popularity > 7; // Placeholder for popularity filter
      return true;
    });
  }, [stocks, filter, portfolio.stocks]);

  // Memoized sorted stocks based on searchQuery and sortOrder
  const sortedStocks = useMemo(() => {
    return filteredStocks
      .filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder === 'Ascending'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
  }, [filteredStocks, searchQuery, sortOrder]);

  const updateStockVisibility = useCallback((id: string, visibility: 'show' | 'hide' | 'only') => {
    setStocks(prevStocks =>
      prevStocks.map(stock => {
        if (stock.id === id) return { ...stock, visibility };
        if (visibility === 'only') return { ...stock, visibility: 'hide' };
        return stock;
      })
    );
  }, []);


  // Optimized buy/sell transaction handler
// Optimized buy/sell transaction handler
const handleStockTransaction = useCallback(
  async (type: 'buy' | 'sell', name: string) => {
    const stock = stocks.find(s => s.name === name);
    if (!stock) return;

    const quantity = 1;
    const totalCost = stock.currentPrice * quantity;

    // Save the previous state for potential rollback
    const previousPortfolio = { ...portfolio };
    const existingHoldingIndex = portfolio.stocks.findIndex(holding => holding.stock.id === stock.id);

    // Optimistically update the portfolio
    const newPortfolio = { ...portfolio };

    if (type === 'buy') {
      if (portfolio.cash >= totalCost) {
        newPortfolio.cash -= totalCost;
        newPortfolio.stockValue += totalCost; // Add the purchased stock value to keep net worth unchanged
        if (existingHoldingIndex !== -1) {
          newPortfolio.stocks[existingHoldingIndex].quantity += quantity;
        } else {
          newPortfolio.stocks = [
            ...portfolio.stocks,
            {
              stock: stock,
              quantity: quantity,
              holdingId: Math.random().toString(36).substring(7) // Generate temp holdingId
            }
          ];
        }
      } else {
        alert('Insufficient funds');
        return;
      }
    } else { // Sell
      if (existingHoldingIndex !== -1 && portfolio.stocks[existingHoldingIndex].quantity >= quantity) {
        newPortfolio.cash += totalCost;
        newPortfolio.stockValue -= totalCost; // Subtract the sold stock value to keep net worth unchanged
        newPortfolio.stocks[existingHoldingIndex].quantity -= quantity;
        if (newPortfolio.stocks[existingHoldingIndex].quantity === 0) {
          newPortfolio.stocks.splice(existingHoldingIndex, 1); // Remove holding if quantity becomes zero
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
      // Roll back to the previous state in case of an error
      setPortfolio(previousPortfolio);
      alert(error instanceof Error ? error.message : 'Transaction failed');
    }
  },
  [portfolio, stocks]
);


  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <BountyProfileCard // Renamed component
          userName={isLoggedIn ? (portfolio.username || "Anonymous Pirate") : "Guest Pirate"}
          netWorth={portfolioStats.netWorth}
          cash={portfolioStats.cash} // Use cash from portfolioStats here
          profitLossOverall={portfolioStats.profitLossOverall}
          profitLossLastChapter={portfolioStats.profitLossLastChapter}
          profileImage={portfolio.profilePicture}
          isLoggedIn={isLoggedIn}
        />
        <PriceHistoryGraph
          stocks={stocks}
          ownedStocks={portfolio.stocks.map(holding => holding.stock.id)} // Use stock IDs from portfolio.stocks
          onVisibilityChange={updateStockVisibility}
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
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select
                className="stock-filter-btn"
                value={filter}
                onChange={e => setFilter(e.target.value as 'All' | 'Owned' | 'Popular')}
              >
                <option value="All">All</option>
                <option value="Owned">Owned</option>
                <option value="Popular">Popular</option>
              </select>
              <select
                className="stock-sort-btn"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'Ascending' | 'Descending')}
              >
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
            </div>
            <div className="news-ticker">
              <div className="ticker-content">
                {(isLoggedIn ? NEWS_ITEMS : LOGGED_OUT_ITEMS).map((item, index) => (
                  <span key={index} className="ticker-item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="stock-grid">
            {sortedStocks.map(stock => (
              <CharacterStockCard
                key={stock.id}
                stock={stock}
                onBuy={() => handleStockTransaction('buy', stock.name)}
                onSell={() => handleStockTransaction('sell', stock.name)}
                onVisibilityChange={updateStockVisibility}
                ownedQuantity={portfolio.stocks.find(holding => holding.stock.id === stock.id)?.quantity || 0} // Get owned quantity from portfolio.stocks
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;