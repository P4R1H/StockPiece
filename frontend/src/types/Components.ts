import { CharacterStock } from "./Stocks";


/* Graph */
export interface PriceHistoryGraphProps {
  stocks: CharacterStock[];
  ownedStocks: string[];
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
  netWorth: string;
  profitLossOverall: string;
  profitLossLastChapter: string;
  profileImage?: string;
}
