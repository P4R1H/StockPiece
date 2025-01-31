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
      popularity: 0, // Set default value as it's not in schema
      ownedCount: 0, // Set default value as it's not in schema
      visibility: 'show' // Set default value as it's not in schema
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

export const buyStock = async ( name : string )  => {
  const response = await fetch('/api/v1/stock/buy', {
    method : 'POST', 
    credentials : "include", 
    headers: {
    'Content-Type': 'application/json',
    }
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login to view your portfolio');
    }
    throw new Error(0 || 'Failed to fetch portfolio data');
  }

}

export const sellStock = async ( name : string ) => {
  const response = await fetch('/api/v1/stock/sell', {
    method : 'POST', 
    credentials : "include", 
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

}

