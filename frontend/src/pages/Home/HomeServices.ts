import { CharacterStock, UserPortfolio } from "../../types/Stocks";

export const getStockMarketData = async (refreshToken : string): Promise<CharacterStock[]> => {
    const response = await fetch('/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refreshToken),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }
  
    return data;
};


export const getPortfolioData = async (refreshToken: string): Promise<UserPortfolio> => {
    const response = await fetch('/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }
  
    return data;
};
