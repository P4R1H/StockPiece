import React, { useCallback } from 'react';
import { Eye, EyeOff, Crosshair } from 'lucide-react';
import { CharacterCardProps } from '../../types/Stocks';
import './CharacterCard.css';

const visibilityIcons = {
  show: Eye,
  hide: EyeOff,
  only: Crosshair,
};

const CharacterCard: React.FC<CharacterCardProps> = React.memo(
  ({ stock, qty, maxQty, onBuy, onSell, onVisibilityChange, ownedQuantity }) => {
    const { id, name, image, currentPrice, visibility } = stock;
    const IconComponent = visibilityIcons[visibility] || Eye;

    const cycleVisibility = useCallback(() => {
      const nextState =
        visibility === 'show' ? 'hide' : visibility === 'hide' ? 'only' : 'show';
      onVisibilityChange(id, nextState);
    }, [visibility, id, onVisibilityChange]);

    const buyQuantity = qty === "max" ? maxQty || 0 : parseInt(qty);
    const sellQuantity = qty === "max" ? ownedQuantity : 
                        parseInt(qty) > ownedQuantity ? ownedQuantity : parseInt(qty);

    const displayPrice = (Math.floor(currentPrice) * buyQuantity).toLocaleString() + "฿";
    const sellValue = Math.floor(currentPrice) * sellQuantity;
    const formattedSellValue = sellValue.toLocaleString() + "฿";
    const sellTooltip = sellQuantity > 0 ? `Earns ${formattedSellValue}` : "";

    return (
      <div className="op-stock-card">
        <div className="op-image-container">
          <img draggable="false" src={image} alt={name} className="op-character-image" loading='lazy' />
          <button
            className="op-visibility-toggle"
            onClick={cycleVisibility}
            data-visibility={visibility}
          >
            <IconComponent size={14} />
          </button>
        </div>

        <div className="op-divider" />

        <div className="op-card-body">
          <div className="op-header">
            <h3 className="op-character-name">
              {name} <span className="op-ticker-symbol">{stock.tickerSymbol}</span>
            </h3>
            <span className="op-character-price">
              {displayPrice}
            </span>
            {/* Always show the base price when max is selected, even if quantity is 0 */}
            {(qty === "max" || buyQuantity > 1) && (
              <span className="op-base-price">
                ({Math.floor(currentPrice).toLocaleString()}฿ each)
              </span>
            )}
          </div>
          <div className="op-meta">
            <span className="op-owned">Owned: {ownedQuantity}</span>
            <div className="op-actions">
              <button
                className="op-buy-button"
                onClick={() => onBuy(name)}
                disabled={buyQuantity <= 0}
              >
                Buy{qty === "max" ? (buyQuantity > 0 ? ` ${buyQuantity}` : " 0") : buyQuantity > 1 ? ` ${buyQuantity}` : ''}
              </button>
              <button
                className="op-sell-button"
                onClick={() => onSell(name)}
                disabled={sellQuantity <= 0}
                title={sellTooltip}
              >
                Sell{sellQuantity > 1 ? ` ${sellQuantity}` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CharacterCard;