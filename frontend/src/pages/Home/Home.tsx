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
      const stockData = await getStockMarketData();
      setStocks(stockData);
    };
    fetchStocks();

    const fetchPortfolio = async () => {
      const portfolioData = await getPortfolioData();
      setPortfolio(portfolioData);
    }
    if (isLoggedIn) {
      fetchPortfolio();
    } else {
      setPortfolio(PLACEHOLDER_PORTFOLIO);
    }
  }, [isLoggedIn]);

  const handleVisibilityChange = (characterId: string, newVisibility: 'show' | 'hide' | 'only') => {
    setStocks(prevStocks => prevStocks.map(stock => {
      if (stock.id === characterId) return { ...stock, visibility: newVisibility };
      if (newVisibility === 'only') return { ...stock, visibility: 'hide' };
      return stock;
    }));
  };

  const handleBuy = async (name: string) => {
    const quantity = 1;
    const stockToBuy = stocks.find(s => s.name === name);
    if (!stockToBuy || portfolio.cash < stockToBuy.currentPrice * quantity) {
      alert(stockToBuy ? 'Insufficient funds' : 'Stock not found');
      return;
    }

    const totalCost = stockToBuy.currentPrice * quantity;
    const existingHolding = portfolio.stocks[stockToBuy.id];
    const newQuantity = (existingHolding?.quantity || 0) + quantity;
    const newAverage = existingHolding ? ((existingHolding.averagePurchasePrice * existingHolding.quantity) + totalCost) / newQuantity : stockToBuy.currentPrice;
    const updatedStocks = { ...portfolio.stocks, [stockToBuy.id]: { quantity: newQuantity, averagePurchasePrice: newAverage } };

    setPortfolio(prev => ({ ...prev, cash: prev.cash - totalCost, stocks: updatedStocks }));
    try {
      await buyStock(name, quantity);
    } catch (error) {
      setPortfolio(prev => ({ ...prev, cash: prev.cash + totalCost, stocks: existingHolding ? { ...prev.stocks, [stockToBuy.id]: existingHolding } : prev.stocks }));
      alert(error instanceof Error ? error.message : 'Failed to buy stock');
    }
  };

  const handleSell = async (name: string) => {
    const quantity = 1;
    const stockToSell = stocks.find(s => s.name === name);
    if (!stockToSell) return;

    const currentHolding = portfolio.stocks[stockToSell.id];
    if (!currentHolding || currentHolding.quantity < quantity) {
      alert('Not enough shares to sell');
      return;
    }

    const totalValue = stockToSell.currentPrice * quantity;
    const newQuantity = currentHolding.quantity - quantity;
    const updatedStocks = { ...portfolio.stocks };
    if (newQuantity > 0) updatedStocks[stockToSell.id] = { quantity: newQuantity, averagePurchasePrice: currentHolding.averagePurchasePrice };
    else delete updatedStocks[stockToSell.id];

    setPortfolio(prev => ({ ...prev, cash: prev.cash + totalValue, stocks: updatedStocks }));
    try {
      await sellStock(name, quantity);
    } catch (error) {
      setPortfolio(prev => ({ ...prev, cash: prev.cash - totalValue, stocks: { ...prev.stocks, [stockToSell.id]: currentHolding } }));
      alert(error instanceof Error ? error.message : 'Failed to sell stock');
    }
  };

  const calculatePortfolioStats = () => ({
    netWorth: portfolio.cash + Object.entries(portfolio.stocks).reduce((total, [stockId, holding]) => total + (stocks.find(s => s.id === stockId)?.currentPrice || 0) * holding.quantity, 0),
    profitLossOverall: "+15%",
    profitLossLastChapter: "+5%"
  });

  const portfolioStats = calculatePortfolioStats();
  const filteredStocks = stocks.filter(stock => filter === 'Owned' ? stock.id in portfolio.stocks : filter === 'Popular' ? stock.popularity > 7 : true);
  const sortedStocks = filteredStocks.filter(stock => stock.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => sortOrder === 'Ascending' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

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
/>        <PriceHistoryGraph 
          stocks={stocks} 
          ownedStocks={Object.keys(portfolio.stocks)}
          onVisibilityChange={handleVisibilityChange}
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
                onBuy={handleBuy}
                onSell={handleSell}
                onVisibilityChange={handleVisibilityChange}
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