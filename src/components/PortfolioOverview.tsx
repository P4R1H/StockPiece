import React from 'react';
import { UserPortfolio } from '../types/CharacterStock';
import './PortfolioOverview.css';

interface PortfolioOverviewProps {
  portfolio: UserPortfolio;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio }) => {
  return (
    <div className="portfolio-overview">
      <div className="treasure-chest">
        <img src="/assets/treasure-chest.png" alt="Treasure Chest" />
      </div>
      <div className="portfolio-details">
        <h2>Your Treasure</h2>
        <p><strong>Cash:</strong> {portfolio.cash.toLocaleString()} Bellies</p>
        <h3>Stocks:</h3>
        <ul>
          {Object.entries(portfolio.stocks).map(([characterId, holding]) => (
            <li key={characterId}>
              {characterId}: {holding.quantity} shares
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PortfolioOverview;
