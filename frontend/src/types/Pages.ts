/* Home */
export interface HomePageProps {
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