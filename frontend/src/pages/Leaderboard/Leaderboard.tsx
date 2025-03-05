import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from './LeaderboardServices';
import { LeaderboardResponse, LeaderboardEntry } from '../../types/Pages';
import './Leaderboard.css';

interface APILeaderboardResponse {
  topUsers: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
}

// Luffy Loader with shimmer effect
const LuffyLoader: React.FC = () => (
  <div className="luffy-loader-container">
    <div className="luffy-logo">
      <img src="/assets/luffy.png" alt="" className="bottom-img" />
      <img src="/assets/luffy.png" alt="" className="top-img" />
    </div>
  </div>
);

interface TopThreeCardsProps {
  topThree: LeaderboardEntry[];
}

const TopThreeCards: React.FC<TopThreeCardsProps> = ({ topThree }) => (
  <div className="top-three-cards">
    {topThree[1] && (
      <div className="top-card top-card--silver">
        <div className="top-card__rank">#{topThree[1].rank}</div>
        <div className="top-card__name">{topThree[1].username}</div>
        <div className="top-card__bounty">
          {topThree[1].totalValue.toLocaleString()} ₿
        </div>
      </div>
    )}
    {topThree[0] && (
      <div className="top-card top-card--gold">
        <div className="top-card__rank">#{topThree[0].rank}</div>
        <div className="top-card__name">{topThree[0].username}</div>
        <div className="top-card__bounty">
          {topThree[0].totalValue.toLocaleString()} ₿
        </div>
      </div>
    )}
    {topThree[2] && (
      <div className="top-card top-card--bronze">
        <div className="top-card__rank">#{topThree[2].rank}</div>
        <div className="top-card__name">{topThree[2].username}</div>
        <div className="top-card__bounty">
          {topThree[2].totalValue.toLocaleString()} ₿
        </div>
      </div>
    )}
  </div>
);

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({ entries }) => (
  <div className="leaderboard-list-container">
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th className="leaderboard-table__header">Rank</th>
          <th className="leaderboard-table__header">Pirate Name</th>
          <th className="leaderboard-table__header">Treasure</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr
            key={entry.rank ?? index}
            className={`table-row ${index < 7 ? 'table-row--highlight' : ''}`}
          >
            <td className="leaderboard-table__cell">#{entry.rank}</td>
            <td className="leaderboard-table__cell">{entry.username}</td>
            <td className="leaderboard-table__cell">
              {entry.totalValue.toLocaleString()} ₿
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface YourRankCardProps {
  currentUser: LeaderboardEntry;
}

const YourRankCard: React.FC<YourRankCardProps> = ({ currentUser }) => (
  <div className="your-rank-card">
    <div className="your-rank-card__item">
      <span className="your-rank-card__label">Your Rank:</span>
      <span className="your-rank-card__value">#{currentUser.rank}</span>
    </div>
    <div className="your-rank-card__item">
      <span className="your-rank-card__label">Total Treasure:</span>
      <span className="your-rank-card__value">
        {currentUser.totalValue.toLocaleString()} ₿
      </span>
    </div>
  </div>
);

const LeaderboardPage: React.FC = () => {
  const { data, isLoading } = useQuery<
    LeaderboardResponse,
    Error,
    APILeaderboardResponse
  >({
    queryKey: ['leaderboardData'],
    queryFn: fetchLeaderboard,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 15,
    select: (response: LeaderboardResponse): APILeaderboardResponse => {
      const topUsers: LeaderboardEntry[] = response.data.topUsers.map((user, index) => ({
        rank: index + 1,
        username: user.name,
        totalValue: Math.floor(user.totalValue),
      }));

      let currentUser: LeaderboardEntry;
      if (response.data.currentUser != null) {
        currentUser = {
          rank: response.data.currentUser.rank,
          username: response.data.currentUser.name,
          totalValue: Math.floor(response.data.currentUser.totalValue),
        };
      } else {
        currentUser = {
          rank: '🐀',
          username: 'Log in to claim your spot',
          totalValue: 0,
        };
      }
      return { topUsers, currentUser };
    },
  });

  if (isLoading) return <LuffyLoader />;
  if (!data) return null;

  const { topUsers, currentUser } = data;
  const topThree = topUsers.slice(0, 3);
  const listEntries = topUsers.slice(3, 103); // ranks 4–100

  return (
    <div className="leaderboard-wrapper">
      <header className="leaderboard-header">
        <div className="header-board">
          <h1 className="header-board__title">
            Most Wanted
          </h1>
          <span className="header-board__subtitle">
            (for tax evasion)
          </span>
        </div>
      </header>
      <section className="leaderboard-top-section">
        <TopThreeCards topThree={topThree} />
      </section>
      <section className="leaderboard-list-section">
        <LeaderboardList entries={listEntries} />
      </section>
      <section className="leaderboard-your-rank-section">
        <YourRankCard currentUser={currentUser} />
      </section>
    </div>
  );
};

export default LeaderboardPage;
