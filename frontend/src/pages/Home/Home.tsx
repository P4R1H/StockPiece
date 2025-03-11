import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import BountyProfileCard from '../../components/Portfolio/Portfolio';
import PriceHistoryGraph from '../../components/StockGraph/StockGraph';
import StockGrid from '../../components/StockGrid/StockGrid';
import { PLACEHOLDER_PORTFOLIO } from '../../assets/data/sampleStocks';
import { CharacterStock, UserPortfolio } from '../../types/Stocks';
import { HomePageProps } from '../../types/Pages';
import { getStockMarketData, getPortfolioData, checkWindowStatus, buyStock, sellStock } from './HomeServices';
import { getMarketStatusInfo, MarketStatus } from '../../utils/MarketStatus';
import './Home.css';
import { toastMarketStatus } from '../../components/Notifications/CustomSonner/CustomSonner';

// Module-level variable to track whether the market status toast has been shown.
let marketStatusToastShown = false;

const HomePage: React.FC<HomePageProps> = ({ isLoggedIn }) => {
  const [windowOpen, setWindowOpen] = useState<Boolean>(true);
  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState<boolean>(false);
  const [filter, setFilter] = useState<'All' | 'Owned' | 'Popular'>('All');
  const [marketStatus, setMarketStatus] = useState<MarketStatus>('closed');

  const debounceTimers = useRef<{ [stockId: string]: NodeJS.Timeout }>({});
  const pendingTransactions = useRef<{ [stockId: string]: { buy: number; sell: number } }>({});

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkStatus = async () => {
      if (isLoggedIn) {
        const windowStatus = await checkWindowStatus();
        setWindowOpen(windowStatus);
      }
    };
    checkStatus();
  }, [isLoggedIn]);

  useEffect(() => {
    const marketInfo = getMarketStatusInfo();
    setMarketStatus(marketInfo.status);

    if (!marketStatusToastShown) {
      const showToast = () => {
        const statusClass = {
          open: 'market-green',
          closed: 'market-red',
          updating: 'market-blue',
        };

        toastMarketStatus({
          status: marketInfo.status,
          nextStatus: marketInfo.nextStatus,
          timeUntilNext: marketInfo.timeUntilNext,
          statusClass,
        });
        
        marketStatusToastShown = true;
      };
      
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(showToast);
      } else {
        setTimeout(showToast, 100);
      }
    }
  }, []);

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
      profitLossLastChapter: portfolio.profit ?? 0,
    };
  }, [portfolio]);

  const ownedQuantities = useMemo(() => {
    const quantityMap: Record<string, number> = {};
    portfolio.stocks.forEach((holding) => {
      quantityMap[holding.stock.id] = holding.quantity;
    });
    return quantityMap;
  }, [portfolio.stocks]);

  const maxBuyQuantities = useMemo(() => {
    const quantityMap: Record<string, number> = {};
    stocks.forEach((stock) => {
      quantityMap[stock.id] = Math.floor(portfolio.cash / stock.currentPrice);
    });
    return quantityMap;
  }, [stocks, portfolio.cash]);

  const updateStockVisibility = (id: string, visibility: 'show' | 'hide' | 'only') => {
    queryClient.setQueryData<CharacterStock[]>(['stocks'], (oldStocks) => {
      if (!oldStocks) return oldStocks;
      return oldStocks.map((stock) => {
        if (stock.id === id) return { ...stock, visibility };
        if (visibility === 'only') return { ...stock, visibility: 'hide' };
        return stock;
      });
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  };

  const handleBuyStock = async (name: string, quantity: number) => {
    if (!isLoggedIn && !hasShownLoginPrompt) {
      showError('To save your progress, Login/Create account, Enjoy testing!');
      setHasShownLoginPrompt(true);
    }

    if (isLoggedIn && !windowOpen) {
      showError(
        'To prevent insider trading the buying/selling window is closed. It will open on TCB chapter release.'
      );
      return;
    }

    const stock = stocks.find((s) => s.name === name);
    if (!stock) return;

    const previousPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio', isLoggedIn]);
    if (!previousPortfolio) return;

    const newPortfolio = structuredClone(previousPortfolio);
    const holdingIndex = newPortfolio.stocks.findIndex((holding) => holding.stock.id === stock.id);

    const totalCost = stock.currentPrice * quantity;
    newPortfolio.cash -= totalCost;
    newPortfolio.stockValue += totalCost;

    if (holdingIndex !== -1) {
      newPortfolio.stocks[holdingIndex].quantity += quantity;
    } else {
      newPortfolio.stocks.push({
        stock: { ...stock },
        quantity: quantity,
        holdingId: Math.random().toString(36).substring(7),
      });
    }

    queryClient.setQueryData(['portfolio', isLoggedIn], newPortfolio);

    if (isLoggedIn) {
      processPendingTransaction(stock, 'buy', quantity);
    }
  };

  const handleSellStock = async (name: string, quantity: number) => {
    if (isLoggedIn && !windowOpen) {
      showError(
        'To prevent insider trading the buying/selling window is closed. It will open on TCB chapter release.'
      );
      return;
    }

    const stock = stocks.find((s) => s.name === name);
    if (!stock) return;

    const previousPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio', isLoggedIn]);
    if (!previousPortfolio) return;

    const newPortfolio = structuredClone(previousPortfolio);
    const holdingIndex = newPortfolio.stocks.findIndex((holding) => holding.stock.id === stock.id);

    if (holdingIndex !== -1) {
      const totalValue = stock.currentPrice * quantity;
      newPortfolio.cash += totalValue;
      newPortfolio.stockValue -= totalValue;
      newPortfolio.stocks[holdingIndex].quantity -= quantity;

      if (newPortfolio.stocks[holdingIndex].quantity === 0) {
        newPortfolio.stocks.splice(holdingIndex, 1);
      }
    }

    queryClient.setQueryData(['portfolio', isLoggedIn], newPortfolio);

    if (isLoggedIn) {
      processPendingTransaction(stock, 'sell', quantity);
    }
  };

  const processPendingTransaction = (stock: CharacterStock, type: 'buy' | 'sell', quantity: number) => {
    if (!pendingTransactions.current[stock.id]) {
      pendingTransactions.current[stock.id] = { buy: 0, sell: 0 };
    }

    pendingTransactions.current[stock.id][type] += quantity;

    if (debounceTimers.current[stock.id]) {
      clearTimeout(debounceTimers.current[stock.id]);
    }

    debounceTimers.current[stock.id] = setTimeout(async () => {
      const pendingBuy = pendingTransactions.current[stock.id].buy;
      const pendingSell = pendingTransactions.current[stock.id].sell;

      pendingTransactions.current[stock.id] = { buy: 0, sell: 0 };

      try {
        if (pendingBuy > pendingSell) {
          const netBuy = pendingBuy - pendingSell;
          await buyStock(stock.name, netBuy);
        } else if (pendingSell > pendingBuy) {
          const netSell = pendingSell - pendingBuy;
          await sellStock(stock.name, netSell);
        }
      } catch (error) {
        console.error('Transaction failed:', error);
        showError(error instanceof Error ? error.message : 'Transaction failed');

        const currentPortfolio = queryClient.getQueryData<UserPortfolio>(['portfolio', isLoggedIn]);
        if (!currentPortfolio) return;
        const updatedPortfolio = structuredClone(currentPortfolio);
        const revertIndex = updatedPortfolio.stocks.findIndex((h) => h.stock.id === stock.id);

        if (pendingBuy > pendingSell) {
          const netBuy = pendingBuy - pendingSell;
          const totalCost = stock.currentPrice * netBuy;
          updatedPortfolio.cash += totalCost;
          updatedPortfolio.stockValue -= totalCost;
          if (revertIndex !== -1) {
            updatedPortfolio.stocks[revertIndex].quantity -= netBuy;
            if (updatedPortfolio.stocks[revertIndex].quantity <= 0) {
              updatedPortfolio.stocks.splice(revertIndex, 1);
            }
          }
        } else if (pendingSell > pendingBuy) {
          const netSell = pendingSell - pendingBuy;
          const totalValue = stock.currentPrice * netSell;
          updatedPortfolio.cash -= totalValue;
          updatedPortfolio.stockValue += totalValue;
          if (revertIndex === -1) {
            updatedPortfolio.stocks.push({
              stock: { ...stock },
              quantity: netSell,
              holdingId: Math.random().toString(36).substring(7),
            });
          } else {
            updatedPortfolio.stocks[revertIndex].quantity += netSell;
          }
        }
        queryClient.setQueryData(['portfolio', isLoggedIn], updatedPortfolio);
      } finally {
        delete debounceTimers.current[stock.id];
      }
    }, 500);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <BountyProfileCard
          userName={isLoggedIn ? portfolio.username || 'Anonymous Pirate' : 'Guest Pirate'}
          netWorth={portfolioStats.netWorth}
          cash={portfolioStats.cash}
          profitLossOverall={portfolioStats.profitLossOverall}
          profitLossLastChapter={portfolioStats.profitLossLastChapter}
          profileImage={portfolio.profilePicture}
          isLoggedIn={isLoggedIn}
        />
        <PriceHistoryGraph
          stocks={stocks}
          ownedStocks={portfolio.stocks.map((holding) => holding.stock.id)}
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
        showError={showError}
        filter={filter}
        onFilterChange={setFilter}
        marketStatus={marketStatus}
      />
    </div>
  );
};

export default HomePage;
