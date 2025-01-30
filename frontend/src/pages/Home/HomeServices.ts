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
  
    return data.data; 
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

export const refreshUserToken = async () => {
  const response = await fetch('/api/v1/user/refresh-token', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
};