import React from 'react';
import './PortfolioOverview.css';

interface BountyProfileCardProps {
  userName: string;
  netWorth: string;
  profitLossOverall: string;
  profitLossLastChapter: string;
  profileImage?: string;
}

const BountyProfileCard: React.FC<BountyProfileCardProps> = ({
  userName,
  netWorth,
  profitLossOverall,
  profitLossLastChapter,
  profileImage,
}) => {
  return (
    <div className="bounty-card">
      <div className="bounty-image-container">
        <img
          src={profileImage || '/assets/placeholder-profile.png'}
          alt="User"
          className="bounty-image"
        />
      </div>
      <div className="bounty-details">
        <h1 className="bounty-name">{userName}</h1>
        <p className="bounty-status">Gamer vipul</p>
        <p className="bounty-net-worth">Net Worth: {netWorth} Bellies</p>
        <p className="bounty-profit-loss">
          Profit/Loss Overall: {profitLossOverall}{' '}
          <span className="profit-loss-last-chapter">
            (Last Chapter: {profitLossLastChapter})
          </span>
        </p>
      </div>
    </div>
  );
};

export default BountyProfileCard;
