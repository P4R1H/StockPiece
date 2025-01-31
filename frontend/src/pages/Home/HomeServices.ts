import { CharacterStock, UserPortfolio } from "../../types/Stocks";

export const getStockMarketData = async (): Promise<CharacterStock[]> => {
    const response = await fetch('/api/v1/stock/all-stocks', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please login to continue');
      }
      throw new Error(data.message || 'Failed to fetch stock data');
    }
  
    const stocks: CharacterStock[] = data.data.map((stock: any) => ({
      id: stock._id,
      name: stock.name,
      image: stock.imageURL,
      currentPrice: stock.currentValue,
      popularity: 0,
      visibility: 'show'
    }));
  
    return stocks;
};

export const getPortfolioData = async (): Promise<UserPortfolio> => {
    const response = await fetch('/api/v1/user/portfolio', {
      method: 'GET', 
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please login to view your portfolio');
      }
      throw new Error(data.message || 'Failed to fetch portfolio data');
    }
  
    return data.data; 
};

export const buyStock = async (name: string, quantity: number) => {
  const response = await fetch('/api/v1/stock/buy', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, quantity })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to buy stock');
  }

  return data;
};

export const sellStock = async (name: string, quantity: number) => {
  const response = await fetch('/api/v1/stock/sell', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, quantity })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to sell stock');
  }

  return data;
};