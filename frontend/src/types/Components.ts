import { CharacterStock } from './Stocks';

export interface PriceHistoryGraphProps {
  stocks: CharacterStock[];
  ownedStocks: string[];
  onVisibilityChange: (characterId: string, newVisibility: 'show' | 'hide' | 'only') => void;
  currentFilter: 'All' | 'Owned' | 'Popular';
}

export interface Dataset {
    label: string;
    borderColor: string;
  }

export interface DatasetMeta {
    hidden: boolean;
    data: DataPoint[];
  }

export interface DataPoint {
    x: number;
    y: number;
}

export interface Chart {
    ctx: CanvasRenderingContext2D;
    data: {
      datasets: Dataset[];
    };
    getDatasetMeta: (index: number) => DatasetMeta;
}

export interface ChartPlugin {
    id: string;
    afterDatasetsDraw: (chart: Chart) => void;
}

/* Portfolio */

export interface BountyProfileCardProps {
  userName: string;
  netWorth: number; // Changed from string
  cash: number; // Changed from string
  profitLossOverall: number; // Changed from string
  profitLossLastChapter: number; // Changed from string
  profileImage?: string;
  isLoggedIn: boolean;
}