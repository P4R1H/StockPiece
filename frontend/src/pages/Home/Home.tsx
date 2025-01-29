import React, { useState } from 'react';
import { FaFilter, FaSort } from 'react-icons/fa'; // Icons from react-icons
import CharacterStockCard from '../../components/Card/CharacterCard';
import PortfolioOverview from '../../components/PortfolioOverview/PortfolioOverview';
import PriceHistoryGraph from '../../components/StockGraph/PriceHistoryGraph';
import { CharacterStock, UserPortfolio } from '../../types/CharacterStock';
import './Home.css';

interface HomePageProps {
  stocks: CharacterStock[];
  portfolio: UserPortfolio;
  onBuy: (characterId: string) => void;
  onSell: (characterId: string) => void;
  onToggleVisibility: (characterId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ stocks, portfolio, onBuy, onSell, onToggleVisibility }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Ascending');
  const [isHovered, setIsHovered] = useState(false);

  // Filter logic
  const filteredStocks = stocks.filter((stock) => {
    if (filter === 'Owned') {
      return portfolio.ownedStocks.some((owned) => owned.id === stock.id);
    } else if (filter === 'Popular') {
      return stock.popularity > 7; // Example: Popularity threshold
    }
    return true; // 'All' filter
  });

  // Search logic
  const searchedStocks = filteredStocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort logic
  const sortedStocks = searchedStocks.sort((a, b) => {
    if (sortOrder === 'Ascending') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <PortfolioOverview portfolio={portfolio} />
        <PriceHistoryGraph stocks={stocks} />
      </div>
      <main
        className="stock-market-main"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="stock-card-container">
          <div className={`stock-controls-top ${isHovered ? 'visible' : ''}`}>
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