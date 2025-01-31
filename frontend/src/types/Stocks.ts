
export interface CharacterStock {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  popularity: number;
  ownedCount: number;
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
  stocks: {
    [characterId: string]: {
      quantity: number;
      averagePurchasePrice: number;
    };
  };
  initialCash: number;
  lastChapCash: number;
  profilePicture?: string;
  isLoggedIn: boolean;
}