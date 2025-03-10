import { LeaderboardResponse } from "../../types/Pages";
import { mockLeaderboardFallback } from "../../assets/data/sampleLb";
import { server } from '../../App.tsx'


export const fetchLeaderboard = async (): Promise<LeaderboardResponse> => {
try {
    const response = await fetch(`${server}/api/v1/user/leaderboard`);
    if (!response.ok) throw new Error('Network response not ok');
    return await response.json();
} catch (error) {
    console.error('Error fetching leaderboard:', error);
    return mockLeaderboardFallback;
}
};