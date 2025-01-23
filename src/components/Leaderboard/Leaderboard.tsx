import React from 'react';
import './Leaderboard.css';

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalValue: number;
  topStock: string;
  profitPercentage: number;
}

const mockLeaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      username: "PirateKing",
      totalValue: 500000,
      topStock: "Monkey D. Luffy",
      profitPercentage: 156
    },
    {
      rank: 2,
      username: "BerryHunter",
      totalValue: 450000,
      topStock: "Roronoa Zoro",
      profitPercentage: 120
    },
    {
      rank: 3,
      username: "NaviMaster",
      totalValue: 400000,
      topStock: "Nami",
      profitPercentage: 95
    },
    {
      rank: 4,
      username: "SwordCollector",
      totalValue: 350000,
      topStock: "Zoro",
      profitPercentage: 82
    },
    {
      rank: 5,
      username: "MeatLover",
      totalValue: 300000,
      topStock: "Sanji",
      profitPercentage: 75
    }
  ];

const LeaderboardPage: React.FC = () => {
  return (
    <div className="page-container">
      <h2 className="leaderboard-title">Grand Line's Top Investors</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Pirate Name</th>
            <th>Total Treasure</th>
            <th>Favorite Stock</th>
            <th>Profit %</th>
          </tr>
        </thead>
        <tbody>
          {mockLeaderboardData.map((entry) => (
            <tr key={entry.rank} className={entry.rank === 1 ? 'top-rank' : ''}>
              <td>#{entry.rank}</td>
              <td>{entry.username}</td>
              <td>{entry.totalValue.toLocaleString()} ₿</td>
              <td>{entry.topStock}</td>
              <td className={entry.profitPercentage >= 100 ? 'profit-high' : 'profit-normal'}>
                {entry.profitPercentage}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardPage;

