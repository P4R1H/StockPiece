import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CharacterStockCard from '../../components/Card/CharacterCard';
import BountyProfileCard from '../../components/Portfolio/Portfolio';
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
  const [buyAmt, setBuyAmt] = useState<"1" | "5" | "10" | "25" | "50" | "100">("1");
  const [sortOrder, setSortOrder] = useState<'Ascending' | 'Descending'>('Ascending');
  const queryClient = useQueryClient();

  const { data: stocks = PLACEHOLDER_STOCKS } = useQuery<CharacterStock[]>({
    queryKey: ['stocks'],
    queryFn: async () => {
      try {
        return await getStockMarketData();
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
        return PLACEHOLDER_STOCKS;
      }
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30
  });
  
  const { data: portfolio = PLACEHOLDER_PORTFOLIO } = useQuery<UserPortfolio>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      try {
        return await getPortfolioData();
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        return PLACEHOLDER_PORTFOLIO;
      }
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30
  });

  const initialInvestment = 10000;
  const portfolioStats = useMemo(() => {
    const netWorthValue = portfolio.stockValue + portfolio.cash;
    return {
      netWorth: netWorthValue.toLocaleString(),
      cash: portfolio.cash.toLocaleString(),
      profitLossOverall: (((netWorthValue - initialInvestment) / initialInvestment) * 100).toFixed(2) + '%',
      profitLossLastChapter: ((portfolio.profit ?? 0).toFixed(2)) + '%'
    };
  }, [portfolio]);
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      if (filter === 'Owned')
        return portfolio.stocks.some(ownedStock => ownedStock.stock.id === stock.id);
      if (filter === 'Popular') return stock.popularity > 7;
      return true;
    });
  }, [stocks, filter, portfolio.stocks]);
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
  const updateStockVisibility = useCallback(
    (id: string, visibility: 'show' | 'hide' | 'only') => {
      queryClient.setQueryData<CharacterStock[]>(['stocks'], oldStocks => {
        if (!oldStocks) return oldStocks;
        return oldStocks.map(stock => {
          if (stock.id === id) return { ...stock, visibility };
          if (visibility === 'only') return { ...stock, visibility: 'hide' };
          return stock;
        });
      });
    },
    [queryClient]
  );
  const handleStockTransaction = useCallback(
    async (type: 'buy' | 'sell', name: string) => {
      const stock = stocks.find(s => s.name === name);
      if (!stock) return;
      const quantity = Number(buyAmt);
      const totalCost = stock.currentPrice * quantity;
      const previousPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio']);
      if (!previousPortfolio) return;
      const newPortfolio = { ...previousPortfolio };
      const existingHoldingIndex = newPortfolio.stocks.findIndex(
        holding => holding.stock.id === stock.id
      );
      if (type === 'buy') {
        if (newPortfolio.cash >= totalCost) {
          newPortfolio.cash -= totalCost;
          newPortfolio.stockValue += totalCost;
          if (existingHoldingIndex !== -1) {
            newPortfolio.stocks[existingHoldingIndex].quantity += quantity;
          } else {
            newPortfolio.stocks.push({
              stock: stock,
              quantity: quantity,
              holdingId: Math.random().toString(36).substring(7)
            });
          }
        } else {
          alert('Insufficient funds');
          return;
        }
      } else {
        if (
          existingHoldingIndex !== -1 &&
          newPortfolio.stocks[existingHoldingIndex].quantity >= quantity
        ) {
          newPortfolio.cash += totalCost;
          newPortfolio.stockValue -= totalCost;
          newPortfolio.stocks[existingHoldingIndex].quantity -= quantity;
          if (newPortfolio.stocks[existingHoldingIndex].quantity === 0) {
            newPortfolio.stocks.splice(existingHoldingIndex, 1);
          }
        } else {
          alert('Not enough shares to sell');
          return;
        }
      }
      queryClient.setQueryData(['portfolio'], newPortfolio);
      try {
        await (type === 'buy' ? buyStock : sellStock)(name, quantity);
      } catch (error) {
        queryClient.setQueryData(['portfolio'], previousPortfolio);
        alert(error instanceof Error ? error.message : 'Transaction failed');
      }
    },
    [stocks, buyAmt, queryClient]
  );
  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <BountyProfileCard
          userName={isLoggedIn ? (portfolio.username || 'Anonymous Pirate') : 'Guest Pirate'}
          netWorth={portfolioStats.netWorth}
          cash={portfolioStats.cash}
          profitLossOverall={portfolioStats.profitLossOverall}
          profitLossLastChapter={portfolioStats.profitLossLastChapter}
          profileImage={portfolio.profilePicture}
          isLoggedIn={isLoggedIn}
        />
        <PriceHistoryGraph
          stocks={stocks}
          ownedStocks={portfolio.stocks.map(holding => holding.stock.id)}
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
              <select
                className="stock-amt-btn"
                value={buyAmt}
                onChange={e =>
                  setBuyAmt(e.target.value as "1" | "5" | "10" | "25" | "50" | "100")
                }
              >
                <option value="1">Qty: 1</option>
                <option value="5">Qty: 5</option>
                <option value="10">Qty: 10</option>
                <option value="25">Qty: 25</option>
                <option value="50">Qty: 50</option>
                <option value="100">Qty: 100</option>
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
                ownedQuantity={
                  portfolio.stocks.find(holding => holding.stock.id === stock.id)?.quantity || 0
                }
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
