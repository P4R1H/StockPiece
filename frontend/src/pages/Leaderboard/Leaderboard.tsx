import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from './LeaderboardServices';
import { LeaderboardResponse, LeaderboardEntry } from '../../types/Pages';
import './Leaderboard.css';

interface LeaderboardAPIResponse {
  leaderboardData: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
}

const LeaderboardPage: React.FC = () => {
  
  const { data } = useQuery<
    LeaderboardResponse, 
    Error,
    LeaderboardAPIResponse
  >({
    queryKey: ['leaderboardData'],
    queryFn: fetchLeaderboard,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 15,
    select: (response: LeaderboardResponse): LeaderboardAPIResponse => {
      const leaderboardData: LeaderboardEntry[] = response.data.topUsers.map(
        (user, index) => ({
          rank: index + 1,
          username: user.name,
          totalValue: user.stockValue,
        })
      );

      let currentUser: LeaderboardEntry;
      if(response.data.currentUser!=null) {
        currentUser = {
          rank: response.data.currentUser.rank,
          username: response.data.currentUser.name,
          totalValue: response.data.currentUser.stockValue,
        };
      } else {
        currentUser = {
          rank: "🐀",
          username: "Could be you if you logged in",
          totalValue: 0,
        };
      }

      return { leaderboardData, currentUser };
    },
  });


  if (!data) return null;
  
  const { leaderboardData, currentUser } = data;
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
                  <tr key={entry.rank ?? 0} className={(Number(entry.rank) || Infinity) <= 10 ? 'top-rank' : 'rest'}>
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
