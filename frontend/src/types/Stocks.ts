
export interface CharacterStock {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  initialValue: number;
  popularity: number;
  ownedCount: number;
  visibility: 'show' | 'hide' | 'only';
  tickerSymbol: string;
}

export interface CharacterCardProps {
  stock: CharacterStock;
  qty: string;
  maxQty?: number;
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