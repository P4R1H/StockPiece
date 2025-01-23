import React from 'react';
import CharacterStockCard from '../../components/Card/CharacterStockCard';
import PortfolioOverview from '../../components/PortfolioOverview/PortfolioOverview';
import PriceHistoryGraph from '../../components/StockGraph/PriceHistoryGraph';
import { CharacterStock, UserPortfolio } from '../../types/CharacterStock';
import 'Home.css'

interface HomePageProps {
  stocks: CharacterStock[];
  portfolio: UserPortfolio;
  onBuy: (characterId: string) => void;
  onSell: (characterId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ stocks, portfolio, onBuy, onSell }) => {
  return (
    <div>
      <div className="dashboard">
        <PortfolioOverview portfolio={portfolio} />
        <PriceHistoryGraph stocks={stocks} />
      </div>
      <main className="stock-market-main">
        <div className="stock-grid">
          {stocks.map(stock => (
            <CharacterStockCard 
              key={stock.id}
              stock={stock}
              onBuy={onBuy}
              onSell={onSell}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;