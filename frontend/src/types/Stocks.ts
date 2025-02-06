// types/Stocks.ts
export interface CharacterStock {
  id: string;
  name: string;
  image: string; // Kept for potential future use or existing components
  currentPrice: number; // Renamed to currentValue to match API, but keeping for compatibility in components and renaming it in getStockMarketData if needed.
  currentValue: number;
  initialValue: number;
  popularity: number; // Kept for potential future use
  ownedCount: number; // Kept for potential future use
  visibility: 'show' | 'hide' | 'only';
}

export interface CharacterCardProps {
  stock: CharacterStock;
  onBuy: (name: string) => void;
  onSell: (name: string) => void;
  onVisibilityChange: (id: string, visibility: 'show' | 'hide' | 'only') => void;
  ownedQuantity: number;
}

export interface UserPortfolio {
  username: string;
  cash: number;
  stocks: StockHolding[];
  profilePicture?: string;
  isLoggedIn: boolean;
  profit: number;
  stockValue: number;
}

export interface StockHolding {
  stock: CharacterStock;
  quantity: number;
  holdingId: string; // Renamed _id to holdingId for clarity
}