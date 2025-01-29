import { CharacterStock, UserPortfolio } from "./Stocks";


/* Home */
export interface HomePageProps {
  stocks: CharacterStock[];
  portfolio: UserPortfolio;
  onBuy: (characterId: string) => void;
  onSell: (characterId: string) => void;
  onToggleVisibility: (characterId: string) => void;
}


/* Leaderboard */

export interface LeaderboardEntry {
  rank: number;
  username: string;
  totalValue: number;
  topStock: string;
  profitPercentage: number;
}


/* Login */