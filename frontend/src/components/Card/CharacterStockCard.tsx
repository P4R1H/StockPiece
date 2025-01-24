import React from 'react';
import { CharacterStock } from '../../types/CharacterStock';
import './CharacterStockCard.css';

interface CharacterStockCardProps {
  stock: CharacterStock;
  onBuy: (characterId: string) => void;
  onSell: (characterId: string) => void;
  ownedCount?: number; // Add this prop
}

const CharacterStockCard: React.FC<CharacterStockCardProps> = ({ stock, onBuy, onSell, ownedCount = 0 }) => {
  return (
    <div className="character-stock-card">
      <div className="card-content">
        <img src={stock.image} alt={stock.name} className="character-image" />
        <div className="stock-details">
          <h3 className="character-name">{stock.name}</h3>
          <p className="stock-price">{stock.currentPrice.toLocaleString()} ₿</p>
          <p className="owned-count">Owned: {ownedCount}</p>
          <div className="stock-buttons">
            <button className="buy-button" onClick={() => onBuy(stock.id)}>+</button>
            <button className="sell-button" onClick={() => onSell(stock.id)}>-</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CharacterStockCard;