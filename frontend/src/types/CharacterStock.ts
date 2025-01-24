export interface CharacterStock {
  id: string;
  name: string;
  currentPrice: number;
  image: string;
}

export interface UserPortfolio {
  cash: number;
  stocks: {
    [characterId: string]: {
      quantity: number;
      averagePurchasePrice: number;
    };
  };
}
