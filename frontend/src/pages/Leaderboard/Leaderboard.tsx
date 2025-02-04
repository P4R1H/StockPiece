import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from './LeaderboardServices';
import { LeaderboardEntry } from '../../types/Pages';
import './Leaderboard.css';

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry>({ 
    rank: 0, 
    username: '', 
    totalValue: 0 
  });

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchLeaderboard();
      const transformed = response.data.topUsers.map((user, index) => ({
        rank: index + 1,
        username: user.name,
        totalValue: user.stockValue,
      }));
      
      setLeaderboardData(transformed);
      setCurrentUser({
        rank: response.data.currentUser.rank,
        username: response.data.currentUser.name,
        totalValue: response.data.currentUser.stockValue,
      });
    };
    loadData();
  }, []);

  const topUsers = leaderboardData.slice(0, 3);

  return (
    <div className="page-container">
      <div className="leaderboard-container">
        <div className="container-title">
          <h1 className="leaderboard-title">
            <span className="main-title">Most wanted</span>
            <span className="subtitle">for tax evasion</span>
          </h1>
        </div>

        <div className="combined-leaderboard">
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
                        <span className="stat-value">
                          {user.totalValue.toLocaleString()} ₿
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="leaderboard-table-container scrollable-list">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="left-col">Rank</th>
                  <th className="left-col">Pirate Name</th>
                  <th className="left-col"></th>
                  <th className="right-col">Total Treasure</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.slice(3).map((entry) => (
                  <tr key={entry.rank} className={entry.rank <= 10 ? 'top-rank' : 'rest'}>
                    <td className="left-col">
                      <span className="entry-rank">#{entry.rank}</span> 
                    </td>
                    <td className="left-col">
                      <span className="entry-rank">{entry.username}</span>
                    </td>
                    <td className="left-col"></td>
                    <td className="right-col">
                      {entry.totalValue.toLocaleString()} ₿
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;