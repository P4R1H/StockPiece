import React, { useState, useEffect } from 'react';
import { FaFilter, FaSort } from 'react-icons/fa';
import CharacterStockCard from '../../components/Card/CharacterCard';
import PortfolioOverview from '../../components/PortfolioOverview/PortfolioOverview';
import PriceHistoryGraph from '../../components/StockGraph/PriceHistoryGraph';
import { CharacterStock, UserPortfolio } from '../../types/CharacterStock';
import './Home.css';

const NEWS_ITEMS = [
  "BREAKING: Zoro Gets Lost in Bermuda Triangle, Claims It's a Shortcut to Wano",
  "ALERT: Luffy Declares All-You-Can-Eat Buffets His New Territory",
  "UPDATE: Nami Raises Interest Rates on Crew Debt by 3000%",
  "FLASH: Sanji Discovers New Island, Names All Dishes After Nami-swan",
  "URGENT: Chopper Mistaken for Emergency Food Supply Again",
  "NEWS: Usopp Claims to Have Defeated 10,000 Marines with One Shot",
  "REPORT: Brook Releases New Single 'Skull Jokes in B Minor'",
  "ALERT: Robin Finds Poneglyph Behind Couch, Marines Baffled",
  "UPDATE: Franky Upgrades Ship with Cola-Powered Time Machine (SUPER!)",
];

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
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => 
        prevIndex === NEWS_ITEMS.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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
                <span>{NEWS_ITEMS[currentNewsIndex]}</span>
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