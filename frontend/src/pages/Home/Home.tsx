import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'; 
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CharacterStockCard from '../../components/Card/CharacterCard';
import BountyProfileCard from '../../components/Portfolio/Portfolio';
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import { PLACEHOLDER_PORTFOLIO } from '../../assets/data/sampleStocks';
import { NEWS_ITEMS, LOGGED_OUT_ITEMS } from '../../assets/data/newsItems';
import { CharacterStock, UserPortfolio } from '../../types/Stocks';
import { HomePageProps } from '../../types/Pages';
import { getStockMarketData, getPortfolioData, checkWindowStatus, buyStock, sellStock } from './HomeServices';
import './Home.css';

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [buyAmt, setBuyAmt] = useState<"1" | "5" | "10" | "25" | "50" | "100" | "max">("1");
  const [sortOrder, setSortOrder] = useState<'alpha-asc' | 'alpha-desc' | 'price-asc' | 'price-desc'>('alpha-asc');
  const [windowOpen, setWindowOpen] = useState<Boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState<boolean>(false);

  const debounceTimers = useRef<{ [stockId: string]: NodeJS.Timeout }>({});
  const pendingTransactions = useRef<{ [stockId: string]: { buy: number; sell: number } }>({});

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkStatus = async () => {
      if (isLoggedIn) {
        const windowStatus = await checkWindowStatus();
        setWindowOpen(windowStatus);        
      }
    }
    checkStatus();
  }, [isLoggedIn]);

  const { data: stocks = [] } = useQuery<CharacterStock[]>({
    queryKey: ['stocks'],
    queryFn: async () => { 
      try {
        return await getStockMarketData();
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30
  });
  
  const { data: portfolio = PLACEHOLDER_PORTFOLIO } = useQuery<UserPortfolio>({
    queryKey: ['portfolio', isLoggedIn],
    queryFn: async () => {
      if (isLoggedIn) {
        try {
          return await getPortfolioData();
        } catch (error) {
          console.error('Failed to fetch portfolio:', error);
          return PLACEHOLDER_PORTFOLIO;
        }
      } else {
        return PLACEHOLDER_PORTFOLIO;
      }
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30
  });

  const initialInvestment = 2500;
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
      if (filter === 'Popular') {
        const topCount = Math.ceil(stocks.length * 0.1);
        const sortedByPopularity = [...stocks].sort((a, b) => b.popularity - a.popularity);
        const topStockIds = sortedByPopularity.slice(0, topCount).map(s => s.id);
        return topStockIds.includes(stock.id);
      }
      return true;
    });
  }, [stocks, filter, portfolio.stocks]);

  const sortedStocks = useMemo(() => {
    return filteredStocks
      .filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case 'alpha-asc':
            return a.name.localeCompare(b.name);
          case 'alpha-desc':
            return b.name.localeCompare(a.name);
          case 'price-asc':
            return a.currentPrice - b.currentPrice;
          case 'price-desc':
            return b.currentPrice - a.currentPrice;
          default:
            return 0;
        }
      });
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
  
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 2000);
  };

  const calculateMaxBuyAmount = useCallback((stockPrice: number): number => {
    return Math.floor(portfolio.cash / stockPrice);
  }, [portfolio.cash]);

  const handleStockTransaction = async (type: 'buy' | 'sell', name: string) => {
    if (!isLoggedIn && type === 'buy' && !hasShownLoginPrompt) {
      showError("To save your progress, Login/Create account, Enjoy testing!");
      setHasShownLoginPrompt(true);
    }
    
    if (isLoggedIn && !windowOpen) {
      showError("To prevent insider trading the buying/selling window is closed. It will open on TCB chapter release.");
      return; 
    }
    
    const stock = stocks.find(s => s.name === name);
    if (!stock) return;
    
    // Calculate quantity based on buyAmt
    let quantity: number;
    if (buyAmt === "max" && type === 'buy') {
      quantity = calculateMaxBuyAmount(stock.currentPrice);
      if (quantity <= 0) {
        showError("Insufficient funds to buy any shares");
        return;
      }
    } else if (buyAmt === "max" && type === 'sell') {
      const holding = portfolio.stocks.find(h => h.stock.id === stock.id);
      quantity = holding ? holding.quantity : 0;
      if (quantity <= 0) {
        showError("No shares to sell");
        return;
      }
    } else {
      quantity = Number(buyAmt);
      // For selling, make sure we don't try to sell more than we own
      if (type === 'sell') {
        const holding = portfolio.stocks.find(h => h.stock.id === stock.id);
        const maxSellable = holding ? holding.quantity : 0;
        if (quantity > maxSellable) {
          quantity = maxSellable;
          if (quantity <= 0) {
            showError("No shares to sell");
            return;
          }
        }
      }
    }
  
    const previousPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio', isLoggedIn]);
    if (!previousPortfolio) return;
    const newPortfolio = { ...previousPortfolio };
  
    const holdingIndex = newPortfolio.stocks.findIndex(
      holding => holding.stock.id === stock.id
    );
  
    if (type === 'buy') {
      const totalCost = stock.currentPrice * quantity;
      if (newPortfolio.cash >= totalCost) {
        newPortfolio.cash -= totalCost;
        newPortfolio.stockValue += totalCost;
        if (holdingIndex !== -1) {
          newPortfolio.stocks[holdingIndex].quantity += quantity;
        } else {
          newPortfolio.stocks.push({
            stock: stock,
            quantity: quantity,
            holdingId: Math.random().toString(36).substring(7)
          });
        }
      } else {
        showError("Insufficient funds");
        return;
      }
    } else { // 'sell'
      if (holdingIndex !== -1 && newPortfolio.stocks[holdingIndex].quantity >= quantity) {
        const totalCost = stock.currentPrice * quantity;
        newPortfolio.cash += totalCost;
        newPortfolio.stockValue -= totalCost;
        newPortfolio.stocks[holdingIndex].quantity -= quantity;
        if (newPortfolio.stocks[holdingIndex].quantity === 0) {
          newPortfolio.stocks.splice(holdingIndex, 1);
        }
      } else {
        showError("Not enough shares to sell");
        return;
      }
    }
    queryClient.setQueryData(['portfolio', isLoggedIn], newPortfolio);
  
    // Only send backend requests if the user is logged in
    if (isLoggedIn) {
      if (!pendingTransactions.current[stock.id]) {
        pendingTransactions.current[stock.id] = { buy: 0, sell: 0 };
      }
      pendingTransactions.current[stock.id][type] += quantity;
  
      // Use a separate debounce timer for each stock
      if (debounceTimers.current[stock.id]) {
        clearTimeout(debounceTimers.current[stock.id]);
      }
  
      debounceTimers.current[stock.id] = setTimeout(async () => {
        const { buy, sell } = pendingTransactions.current[stock.id];
  
        if (buy > 0) {
          try {
            await buyStock(name, buy);
          } catch (error) {
            queryClient.setQueryData(['portfolio', isLoggedIn], previousPortfolio);
            alert(error instanceof Error ? error.message : 'Buy transaction failed');
          }
        }
  
        if (sell > 0) {
          try {
            await sellStock(name, sell);
          } catch (error) {
            queryClient.setQueryData(['portfolio', isLoggedIn], previousPortfolio);
            alert(error instanceof Error ? error.message : 'Sell transaction failed');
          }
        }
  
        pendingTransactions.current[stock.id] = { buy: 0, sell: 0 };
        delete debounceTimers.current[stock.id];
      }, 500);
    }
  };

  // Calculate max quantities for each stock at render time
  const getMaxBuyQuantity = (stock: CharacterStock): number => {
    return Math.floor(portfolio.cash / stock.currentPrice);
  };

  // Get owned quantity for a stock
  const getOwnedQuantity = (stockId: string): number => {
    const holding = portfolio.stocks.find(h => h.stock.id === stockId);
    return holding ? holding.quantity : 0;
  };

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
                placeholder="Search.."
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
                onChange={e => setSortOrder(e.target.value as 'alpha-asc' | 'alpha-desc' | 'price-asc' | 'price-desc')}
              >
                <option value="alpha-asc">Name A-Z</option>
                <option value="alpha-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
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
            {sortedStocks.map(stock => {
              const ownedQuantity = getOwnedQuantity(stock.id);
              const maxBuyQuantity = getMaxBuyQuantity(stock);
              
              return (
                <CharacterStockCard
                  key={stock.id}
                  stock={stock}
                  qty={buyAmt}
                  maxQty={maxBuyQuantity}
                  onBuy={() => handleStockTransaction('buy', stock.name)}
                  onSell={() => handleStockTransaction('sell', stock.name)}
                  onVisibilityChange={updateStockVisibility}
                  ownedQuantity={ownedQuantity}
                />
              );
            })}
          </div>
          <div className={`window-overlay ${errorMessage ? 'active' : ''}`}>
            <span>{errorMessage}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;