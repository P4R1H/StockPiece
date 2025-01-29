import React, { useState } from 'react';
import CharacterStockCard from '../../components/Card/CharacterCard';
import PortfolioOverview from '../../components/Portfolio/Portfolio';
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import { HomePageProps } from '../../types/Pages';
import './Home.css';

const NEWS_ITEMS = [
  "BREAKING: Zoro Gets Lost in Bermuda Triangle, Claims It's a Shortcut to Wano",
  "ALERT: Luffy Declares All-You-Can-Eat Buffets His New Territory",
  "UPDATE: Nami Raises Interest Rates on Crew Debt by 3000%",
  "FLASH: Sanji Discovers New Island, Names All Dishes After Nami-swan",
  "URGENT: Chopper Mistaken for Emergency Food Supply Again",
  "NEWS: Usopp Claims to Have Defeated 10,000 Marines with One Shot",
  "REPORT: Mihawk runs out of black paint'",
  "ALERT: Robin Finds Poneglyph Behind Couch, Marines Baffled",
  "UPDATE: Franky Upgrades Ship with Cola-Powered Time Machine (SUPER!)",
];

const HomePage: React.FC<HomePageProps> = ({ stocks, portfolio, onBuy, onSell, onToggleVisibility }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Ascending');

  // Filter logic
  const filteredStocks = stocks.filter((stock) => {
    if (filter === 'Owned') {
      return portfolio.ownedStocks.some((owned) => owned.id === stock.id);
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
        <PortfolioOverview portfolio={portfolio} />
        <PriceHistoryGraph stocks={stocks} />
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
                onToggleVisibility={onToggleVisibility}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;