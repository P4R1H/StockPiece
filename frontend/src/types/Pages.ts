import { CharacterStock, UserPortfolio } from "./Stocks";


/* Home */
export interface HomePageProps {
  stocks: CharacterStock[];
  portfolio: UserPortfolio;
  isLoggedIn: boolean;
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