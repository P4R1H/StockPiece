/* Home */
export interface HomePageProps {
  isLoggedIn: boolean;
}

/* Leaderboard */

export interface LeaderboardPageProps {
  isLoggedIn: boolean;
}

export interface LeaderboardEntry {
  rank: number | string;
  username: string;
  totalValue: number;
}

export interface LeaderboardUser {
  name: string;
  totalValue: number;
}

export interface CurrentUser {
  name: string;
  totalValue: number;
  rank: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    topUsers: LeaderboardUser[];
    currentUser: CurrentUser;
  };
  message: string;
  statusCode: number;
}


/* Login */