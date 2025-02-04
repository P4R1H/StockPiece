/* Home */
export interface HomePageProps {
  isLoggedIn: boolean;
}

/* Leaderboard */

export interface LeaderboardEntry {
  rank: number;
  username: string;
  totalValue: number;
}

export interface LeaderboardUser {
  name: string;
  stockValue: number;
}

export interface CurrentUser {
  name: string;
  stockValue: number;
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