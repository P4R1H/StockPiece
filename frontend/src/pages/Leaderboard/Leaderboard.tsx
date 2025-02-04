import React from 'react';
import { mockLeaderboardData } from '../../assets/data/sampleLb';
import './Leaderboard.css';

const LeaderboardPage: React.FC = () => {
  // Top 3 users from the mock data
  const topUsers = mockLeaderboardData.slice(0, 3);
  // Simulate the current user (fallback if not found)
  const currentUser = mockLeaderboardData.find(user => user.rank === 1) || mockLeaderboardData[1];

  return (
    <div className="page-container">
      <div className="leaderboard-container">
        {/* Title placed on the border of the container */}
        <div className="container-title">
          <h1 className="leaderboard-title">
            <span className="main-title">Most wanted</span>
            <span className="subtitle">for tax evasion</span>
          </h1>
        </div>

        {/* Combined container for Top 3, Leaderboard Table, and Current User Rank */}
        <div className="combined-leaderboard">
          {/* Top 3 Section */}
          <div className="top-three-container">
            <div className="luffy-background">
              {topUsers.map((user, index) => (
                <div key={user.username} className={`top-three-card rank-${index + 1}`}>
                  <div className="rank-badge">#{user.rank}</div>
                  <div className="user-details">
                    <h3 className="username">{user.username}</h3>
                    <div className="user-stats">
                      <div className="stat-item">
                        <span className="stat-label">Bounty</span>
                        <span className="stat-value">{user.totalValue.toLocaleString()} ₿</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Profit</span>
                        <span className={`stat-value ${user.profitPercentage >= 100 ? 'profit-high' : 'profit-normal'}`}>
                          {user.profitPercentage}%
                        </span>
                      </div>
                    </div>
                    <div className="portfolio-hover">{user.topStock}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Leaderboard Table */}
          <div className="leaderboard-table-container scrollable-list">
            <table className="leaderboard-table">
              <thead>
                <tr>
                <th className="left-col">Rank</th>
                <th className="left-col">Pirate Name</th>
                <th className="right-col">Total Treasure</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboardData.slice(3).map((entry) => (
                  <tr key={entry.rank} className={entry.rank <= 10 ? 'top-rank' : ''}>
                    <td className="left-col">
                      <span className="entry-rank">#{entry.rank}</span> 
                    </td>
                    <td className='left-col'>
                      <span className="entry-rank">{entry.username}</span>

                    </td>
                    <td className="right-col">
                      {entry.totalValue.toLocaleString()} ₿
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Current User Rank Card */}
          <div className="current-user-rank">
            <div className="user-rank-details">
              <span>Your Rank</span>
              <h3>#{currentUser.rank}</h3>
            </div>
            <div className="user-rank-stats">
              <div className="stat">
                <span>Total Treasure</span>
                <span>{currentUser.totalValue.toLocaleString()} ₿</span>
              </div>
              {/* Profit field removed per new requirements */}
            </div>
          </div>
        </div>
        {/* End of Combined Leaderboard */}
      </div>
    </div>
  );
};

export default LeaderboardPage;
