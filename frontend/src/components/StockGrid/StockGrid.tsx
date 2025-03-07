import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CharacterStock } from '../../types/Stocks';
import CharacterStockCard from '../CharacterCards/CharacterCard';
import NewsTicker from '../NewsTicker/NewsTicker';
import { MarketStatus } from '../../utils/MarketStatus';
import './StockGrid.css';

interface StockGridProps {
  stocks: CharacterStock[];
  ownedQuantities: Record<string, number>;
  maxBuyQuantities: Record<string, number>;
  isLoggedIn: boolean;
  cash: number;
  onBuy: (stockName: string, quantity: number) => Promise<void>;
  onSell: (stockName: string, quantity: number) => Promise<void>;
  onVisibilityChange: (id: string, visibility: 'show' | 'hide' | 'only') => void;
  showError: (message: string) => void;
  filter: 'All' | 'Owned' | 'Popular';
  onFilterChange: (filter: 'All' | 'Owned' | 'Popular') => void;
  marketStatus: MarketStatus;
}

// Hook to track window width
function useWindowWidth() {
  const [width, setWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const StockGrid: React.FC<StockGridProps> = ({
  stocks,
  ownedQuantities,
  maxBuyQuantities,
  isLoggedIn,
  cash,
  onBuy,
  onSell,
  onVisibilityChange,
  showError,
  filter,
  onFilterChange,
  marketStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [buyAmt, setBuyAmt] = useState<"1" | "5" | "10" | "25" | "50" | "100" | "max">("1");
  const [sortOrder, setSortOrder] = useState<'alpha-asc' | 'alpha-desc' | 'price-asc' | 'price-desc' | 'owned-desc'>('alpha-asc');
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 500;

  // Helper function to get owned quantity
  const getOwnedQuantity = useCallback((stockId: string): number => {
    return ownedQuantities[stockId] || 0;
  }, [ownedQuantities]);

  // Filter stocks based on the filter prop
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      if (filter === 'Owned') return ownedQuantities[stock.id] > 0;
      if (filter === 'Popular') {
        const topCount = Math.ceil(stocks.length * 0.2);
        const sortedByPopularity = [...stocks].sort((a, b) => b.popularity - a.popularity);
        const topStockIds = sortedByPopularity.slice(0, topCount).map(s => s.id);
        return topStockIds.includes(stock.id);
      }
      return true;
    });
  }, [stocks, filter, ownedQuantities]);

  const stocksToDisplay = useMemo(() => {
    return searchQuery
      ? stocks.filter(stock =>
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : filteredStocks;
  }, [stocks, filteredStocks, searchQuery]);

  const sortedStocks = useMemo(() => {
    return [...stocksToDisplay].sort((a, b) => {
      switch (sortOrder) {
        case 'alpha-asc':
          return a.name.localeCompare(b.name);
        case 'alpha-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.currentPrice - b.currentPrice;
        case 'price-desc':
          return b.currentPrice - a.currentPrice;
        case 'owned-desc': {
          const quantityA = getOwnedQuantity(a.id);
          const quantityB = getOwnedQuantity(b.id);
          return quantityB - quantityA;
        }
        default:
          return 0;
      }
    });
  }, [stocksToDisplay, sortOrder, getOwnedQuantity]);

  // Handle stock transactions
  const handleStockTransaction = useCallback(
    async (type: 'buy' | 'sell', name: string) => {
      const stock = stocks.find(s => s.name === name);
      if (!stock) return;
      let quantity: number;
      if (buyAmt === "max" && type === 'buy') {
        quantity = maxBuyQuantities[stock.id] || 0;
        if (quantity <= 0) {
          showError("Insufficient funds to buy any shares");
          return;
        }
      } else if (buyAmt === "max" && type === 'sell') {
        quantity = ownedQuantities[stock.id] || 0;
        if (quantity <= 0) {
          showError("No shares to sell");
          return;
        }
      } else {
        quantity = Number(buyAmt);
        if (type === 'sell') {
          const maxSellable = ownedQuantities[stock.id] || 0;
          if (quantity > maxSellable) {
            quantity = maxSellable;
            if (quantity <= 0) {
              showError("No shares to sell");
              return;
            }
          }
        } else if (type === 'buy') {
          const totalCost = stock.currentPrice * quantity;
          if (cash < totalCost) {
            showError("Insufficient funds");
            return;
          }
        }
      }
      try {
        if (type === 'buy') {
          await onBuy(name, quantity);
        } else {
          await onSell(name, quantity);
        }
      } catch (error) {
        showError(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    [stocks, buyAmt, maxBuyQuantities, ownedQuantities, cash, onBuy, onSell, showError]
  );

  // --- Render differently for PC and mobile ---
  if (!isMobile) {
    // PC Version: exactly as before
    return (
      <div className="stock-grid-container">
        <div className="stock-grid-header">
          <div className="stock-grid-header-controls">
            <input
              type="text"
              placeholder="Search.."
              className="stock-search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="stock-filter-btn"
              value={filter}
              onChange={e => onFilterChange(e.target.value as 'All' | 'Owned' | 'Popular')}
            >
              <option value="All">All</option>
              <option value="Owned">Owned</option>
              <option value="Popular">Popular</option>
            </select>
            <select
              className="stock-sort-btn"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'alpha-asc' | 'alpha-desc' | 'price-asc' | 'price-desc' | 'owned-desc')}
            >
              <option value="alpha-asc">Name A-Z</option>
              <option value="alpha-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="owned-desc">Most Owned</option>
            </select>
            <select
              className="stock-amt-btn"
              value={buyAmt}
              onChange={e =>
                setBuyAmt(e.target.value as "1" | "5" | "10" | "25" | "50" | "100" | "max")
              }
            >
              <option value="1">Qty: 1</option>
              <option value="5">Qty: 5</option>
              <option value="10">Qty: 10</option>
              <option value="25">Qty: 25</option>
              <option value="50">Qty: 50</option>
              <option value="100">Qty: 100</option>
              <option value="max">Qty: Max</option>
            </select>
          </div>
          <NewsTicker isLoggedIn={isLoggedIn} marketStatus={marketStatus} />
        </div>
        <div className="stock-grid">
          {sortedStocks.map(stock => (
            <CharacterStockCard
              key={stock.id}
              stock={stock}
              qty={buyAmt}
              maxQty={maxBuyQuantities[stock.id] || 0}
              onBuy={() => handleStockTransaction('buy', stock.name)}
              onSell={() => handleStockTransaction('sell', stock.name)}
              onVisibilityChange={onVisibilityChange}
              ownedQuantity={ownedQuantities[stock.id] || 0}
            />
          ))}
        </div>
      </div>
    );
  } else {
    // Mobile Version: same mapping as PC but wrapped in an internal scroll container
    return (
      <div className="stock-grid-container">
        <div className="stock-grid-header">
          <div className="stock-grid-header-controls">
            <input
              type="text"
              placeholder="Search.."
              className="stock-search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="stock-filter-btn"
              value={filter}
              onChange={e => onFilterChange(e.target.value as 'All' | 'Owned' | 'Popular')}
            >
              <option value="All">All</option>
              <option value="Owned">Owned</option>
              <option value="Popular">Popular</option>
            </select>
            <select
              className="stock-sort-btn"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'alpha-asc' | 'alpha-desc' | 'price-asc' | 'price-desc' | 'owned-desc')}
            >
              <option value="alpha-asc">Name A-Z</option>
              <option value="alpha-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="owned-desc">Most Owned</option>
            </select>
            <select
              className="stock-amt-btn"
              value={buyAmt}
              onChange={e =>
                setBuyAmt(e.target.value as "1" | "5" | "10" | "25" | "50" | "100" | "max")
              }
            >
              <option value="1">Qty: 1</option>
              <option value="5">Qty: 5</option>
              <option value="10">Qty: 10</option>
              <option value="25">Qty: 25</option>
              <option value="50">Qty: 50</option>
              <option value="100">Qty: 100</option>
              <option value="max">Qty: Max</option>
            </select>
          </div>
          <NewsTicker isLoggedIn={isLoggedIn} marketStatus={marketStatus} />
        </div>
        <div className="stock-grid-wrapper">
          <div className="stock-grid">
            {sortedStocks.map(stock => (
              <CharacterStockCard
                key={stock.id}
                stock={stock}
                qty={buyAmt}
                maxQty={maxBuyQuantities[stock.id] || 0}
                onBuy={() => handleStockTransaction('buy', stock.name)}
                onSell={() => handleStockTransaction('sell', stock.name)}
                onVisibilityChange={onVisibilityChange}
                ownedQuantity={ownedQuantities[stock.id] || 0}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default StockGrid;
