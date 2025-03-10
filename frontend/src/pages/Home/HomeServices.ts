import { CharacterStock, UserPortfolio } from "../../types/Stocks";
import { server } from '../../App.tsx'

export const getStockMarketData = async (): Promise<CharacterStock[]> => {
  const response = await fetch(`${server}/api/v1/stock/stocks`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch stock data');
  return data.data.map((stock: any) => ({
    id: stock._id,
    name: stock.name,
    image: stock.imageURL,
    currentPrice: stock.currentValue,
    initialValue: stock.initialValue, 
    popularity: stock.popularityCount,
    visibility: 'show',
    tickerSymbol: stock.tickerSymbol ? '$' + stock.tickerSymbol : '',
  }));
};

export const checkWindowStatus = async(): Promise<Boolean> => {
<<<<<<< HEAD
  const response = await fetch('https://backend.stockpiece.fun/api/v1/market/status', {
=======
  const response = await fetch(`${server}/api/v1/market/status`, {
>>>>>>> cft
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch window data');

  if(data.data === "closed") return false;
  return true;
}

export const getPortfolioData = async (): Promise<UserPortfolio> => {
<<<<<<< HEAD
  const response = await fetch('https://backend.stockpiece.fun/api/v1/user/portfolio', {
=======
  const response = await fetch(`${server}/api/v1/user/portfolio`, {
>>>>>>> cft
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch portfolio data');

  const portfolio: UserPortfolio = {
    username: data.data.username,
    cash: data.data.accountValue,
    stocks: data.data.ownedStocks.map((item: any) => ({
      stock: {
        id: item.stock._id,
        name: item.stock.name,
        currentValue: item.stock.currentValue,
        initialValue: item.stock.initialValue,
        image: '', // Placeholder, as image is not in the provided response
        currentPrice: item.stock.currentValue, // Setting currentPrice for component compatibility, even though API returns currentValue
        popularity: 0, // Placeholder
        ownedCount: 0, // Placeholder
        visibility: 'show', // Default visibility
      },
      quantity: item.quantity,
      holdingId: item._id,
    })),
    profilePicture: data.data.avatar,
    isLoggedIn: true,
    profit: data.data.profit,
    stockValue: data.data.stockValue,
  };

  return portfolio;
};


export const buyStock = async (name: string, quantity: number) => {
<<<<<<< HEAD
  const response = await fetch('https://backend.stockpiece.fun/api/v1/stock/transactions/buy', {
=======
  const response = await fetch(`${server}/api/v1/stock/transactions/buy`, {
>>>>>>> cft
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, quantity })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to buy stock');
  return data;
};

export const sellStock = async (name: string, quantity: number) => {
<<<<<<< HEAD
  const response = await fetch('https://backend.stockpiece.fun/api/v1/stock/transactions/sell', {
=======
  const response = await fetch(`${server}/api/v1/stock/transactions/sell`, {
>>>>>>> cft
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, quantity })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to sell stock');
  return data;
};