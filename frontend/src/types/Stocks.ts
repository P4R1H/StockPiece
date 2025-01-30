
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
  onBuy: (characterId: string) => void;
  onSell: (characterId: string) => void;
  onVisibilityChange: (characterId: string, newState: 'show' | 'hide' | 'only') => void;
}

export interface UserPortfolio {
  cash: number;
  initialCash: number;
  lastChapCash: number;
  stocks: {
    [characterId: string]: {
      quantity: number;
      averagePurchasePrice: number;
    };
  };
  profilePicture: string | undefined; 
  isLoggedIn: boolean;
}
