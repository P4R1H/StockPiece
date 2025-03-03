import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BountyProfileCard from '../../components/Portfolio/Portfolio';
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import StockGrid from '../../components/StockGrid/StockGrid';
import { PLACEHOLDER_PORTFOLIO } from '../../assets/data/sampleStocks';
import { CharacterStock, UserPortfolio } from '../../types/Stocks';
import { HomePageProps } from '../../types/Pages';
import { getStockMarketData, getPortfolioData, checkWindowStatus, buyStock, sellStock } from './HomeServices';
import './Home.css';

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn }) => {
  const [windowOpen, setWindowOpen] = useState<Boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState<boolean>(false);
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
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
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const initialInvestment = 5000;
  const portfolioStats = useMemo(() => {
    const netWorthValue = portfolio.stockValue + portfolio.cash;
    return {
      netWorth: netWorthValue,
      cash: portfolio.cash,
      profitLossOverall: ((netWorthValue - initialInvestment) / initialInvestment) * 100,
      profitLossLastChapter: portfolio.profit ?? 0
    };
  }, [portfolio]);

  // Create a map of owned quantities for easier access
  const ownedQuantities = useMemo(() => {
    const quantityMap: Record<string, number> = {};
    portfolio.stocks.forEach(holding => {
      quantityMap[holding.stock.id] = holding.quantity;
    });
    return quantityMap;
  }, [portfolio.stocks]);

  // Calculate max quantities for each stock at render time
  const maxBuyQuantities = useMemo(() => {
    const quantityMap: Record<string, number> = {};
    stocks.forEach(stock => {
      quantityMap[stock.id] = Math.floor(portfolio.cash / stock.currentPrice);
    });
    return quantityMap;
  }, [stocks, portfolio.cash]);

  const updateStockVisibility = (id: string, visibility: 'show' | 'hide' | 'only') => {
    queryClient.setQueryData<CharacterStock[]>(['stocks'], oldStocks => {
      if (!oldStocks) return oldStocks;
      return oldStocks.map(stock => {
        if (stock.id === id) return { ...stock, visibility };
        if (visibility === 'only') return { ...stock, visibility: 'hide' };
        return stock;
      });
    });
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 2000);
  };

  const handleBuyStock = async (name: string, quantity: number) => {
    if (!isLoggedIn && !hasShownLoginPrompt) {
      showError("To save your progress, Login/Create account, Enjoy testing!");
      setHasShownLoginPrompt(true);
    }

    if (isLoggedIn && !windowOpen) {
      showError("To prevent insider trading the buying/selling window is closed. It will open on TCB chapter release.");
      return;
    }

    const stock = stocks.find(s => s.name === name);
    if (!stock) return;

    // Apply optimistic update
    const previousPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio', isLoggedIn]);
    if (!previousPortfolio) return;

    const newPortfolio = structuredClone(previousPortfolio); // Deep clone to avoid reference issues
    const holdingIndex = newPortfolio.stocks.findIndex(
      holding => holding.stock.id === stock.id
    );

    // Calculate total cost
    const totalCost = stock.currentPrice * quantity;
    newPortfolio.cash -= totalCost;
    newPortfolio.stockValue += totalCost;

    if (holdingIndex !== -1) {
      newPortfolio.stocks[holdingIndex].quantity += quantity;
    } else {
      newPortfolio.stocks.push({
        stock: { ...stock },
        quantity: quantity,
        holdingId: Math.random().toString(36).substring(7)
      });
    }

    // Apply optimistic update to UI
    queryClient.setQueryData(['portfolio', isLoggedIn], newPortfolio);

    // Only send backend requests if the user is logged in
    if (isLoggedIn) {
      processPendingTransaction(stock, 'buy', quantity);
    }
  };

  const handleSellStock = async (name: string, quantity: number) => {
    if (isLoggedIn && !windowOpen) {
      showError("To prevent insider trading the buying/selling window is closed. It will open on TCB chapter release.");
      return;
    }

    const stock = stocks.find(s => s.name === name);
    if (!stock) return;

    // Apply optimistic update
    const previousPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio', isLoggedIn]);
    if (!previousPortfolio) return;

    const newPortfolio = structuredClone(previousPortfolio);
    const holdingIndex = newPortfolio.stocks.findIndex(
      holding => holding.stock.id === stock.id
    );

    if (holdingIndex !== -1) {
      const totalValue = stock.currentPrice * quantity;
      newPortfolio.cash += totalValue;
      newPortfolio.stockValue -= totalValue;
      newPortfolio.stocks[holdingIndex].quantity -= quantity;

      if (newPortfolio.stocks[holdingIndex].quantity === 0) {
        newPortfolio.stocks.splice(holdingIndex, 1);
      }
    }

    // Apply optimistic update to UI
    queryClient.setQueryData(['portfolio', isLoggedIn], newPortfolio);

    // Only send backend requests if the user is logged in
    if (isLoggedIn) {
      processPendingTransaction(stock, 'sell', quantity);
    }
  };

  const processPendingTransaction = (stock: CharacterStock, type: 'buy' | 'sell', quantity: number) => {
    // Track this transaction in the pending queue
    if (!pendingTransactions.current[stock.id]) {
      pendingTransactions.current[stock.id] = { buy: 0, sell: 0 };
    }

    // Update the pending transactions for this stock
    pendingTransactions.current[stock.id][type] += quantity;

    // Clear any existing timer for this stock
    if (debounceTimers.current[stock.id]) {
      clearTimeout(debounceTimers.current[stock.id]);
    }

    // Set up a new debounce timer
    debounceTimers.current[stock.id] = setTimeout(async () => {
      // Calculate net transaction
      const pendingBuy = pendingTransactions.current[stock.id].buy;
      const pendingSell = pendingTransactions.current[stock.id].sell;

      // Clear pending transactions before processing
      pendingTransactions.current[stock.id] = { buy: 0, sell: 0 };

      try {
        // Determine if it's a net buy or sell
        if (pendingBuy > pendingSell) {
          // Net buy
          const netBuy = pendingBuy - pendingSell;
          await buyStock(stock.name, netBuy);
        } else if (pendingSell > pendingBuy) {
          // Net sell
          const netSell = pendingSell - pendingBuy;
          await sellStock(stock.name, netSell);
        }
        // If they're equal, no transaction needed
      } catch (error) {
        console.error("Transaction failed:", error);
        showError(error instanceof Error ? error.message : 'Transaction failed');

        // Revert only the failed net transaction
        const currentPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio', isLoggedIn]);
        if (!currentPortfolio) return;
        const updatedPortfolio = structuredClone(currentPortfolio);
        const revertIndex = updatedPortfolio.stocks.findIndex(h => h.stock.id === stock.id);

        if (pendingBuy > pendingSell) {
          // Undo the failed net buy
          const netBuy = pendingBuy - pendingSell;
          const totalCost = stock.currentPrice * netBuy;
          updatedPortfolio.cash += totalCost;         // Restore cash spent
          updatedPortfolio.stockValue -= totalCost;   // Reduce stock value
          if (revertIndex !== -1) {
            updatedPortfolio.stocks[revertIndex].quantity -= netBuy;
            if (updatedPortfolio.stocks[revertIndex].quantity <= 0) {
              updatedPortfolio.stocks.splice(revertIndex, 1);
            }
          }
        } else if (pendingSell > pendingBuy) {
          // Undo the failed net sell
          const netSell = pendingSell - pendingBuy;
          const totalValue = stock.currentPrice * netSell;
          updatedPortfolio.cash -= totalValue;        // Remove cash gained
          updatedPortfolio.stockValue += totalValue;  // Restore stock value
          if (revertIndex === -1) {
            updatedPortfolio.stocks.push({
              stock: { ...stock },
              quantity: netSell,
              holdingId: Math.random().toString(36).substring(7)
            });
          } else {
            updatedPortfolio.stocks[revertIndex].quantity += netSell;
          }
        }
        queryClient.setQueryData(['portfolio', isLoggedIn], updatedPortfolio);
      } finally {
        // Clear the debounce timer
        delete debounceTimers.current[stock.id];
      }
    }, 500);
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
  
      <StockGrid
        stocks={stocks}
        ownedQuantities={ownedQuantities}
        maxBuyQuantities={maxBuyQuantities}
        isLoggedIn={isLoggedIn}
        cash={portfolio.cash}
        onBuy={handleBuyStock}
        onSell={handleSellStock}
        onVisibilityChange={updateStockVisibility}
        errorMessage={errorMessage}
        showError={showError}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  );
};

export default HomePage;