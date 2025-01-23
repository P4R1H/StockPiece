import React from 'react';
import { CharacterStock } from '../types/CharacterStock';
import './CharacterStockCard.css';

interface CharacterStockCardProps {
  stock: CharacterStock;
  onBuy: (characterId: string) => void;
  onSell: (characterId: string) => void;
}

const CharacterStockCard: React.FC<CharacterStockCardProps> = ({ stock, onBuy, onSell }) => {
  return (
    <div className="character-stock-card">
      <img src={stock.image} alt={stock.name} className="character-image" />
      <div className="stock-details">
        <h2 className="character-name">{stock.name}</h2>
        <p className="stock-price">Price: {stock.currentPrice.toLocaleString()} Bellies</p>
        <div className="stock-buttons">
          <button className="buy-button" onClick={() => onBuy(stock.id)}>Buy</button>
          <button className="sell-button" onClick={() => onSell(stock.id)}>Sell</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterStockCard;
