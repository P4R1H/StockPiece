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

/* Admin */
export interface Stock {
  id: string;
  name: string;
  tickerSymbol: string;
  currentPrice: number;
  image: string;
}

export interface StockStats {
  name: string;
  oldValue: number;
  newValue: number;
  totalBuys: number;
  totalSells: number;
  totalQuantity: number;
  _id: string;
}

export interface Stats {
  [key: string]: {
    buys?: number;
    sells?: number;
    totalQuantity?: number;
    newValue?: number;
  };
}

export interface LatestChapter {
  chapter: number;
  releaseDate: string;
  windowEndDate: string;
  isWindowClosed: boolean;
  isAutoReleaseEnabled?: boolean; // Add this new property
}

export interface AdminStockCardProps {
  stock: Stock;
  stats: Stats;
  onRemove: (name: string) => void;
  onPriceUpdate: (name: string, price: number) => void;
  onImageClick: (stock: Stock) => void;
}

export interface ErrorLog {
  _id: string;
  message: string;
  stack: string;
  name: string;
  statusCode: number;
  isInternalServerError: boolean;
  isHighPriority: boolean;
  additionalInfo: {
    path: string;
    method: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}
