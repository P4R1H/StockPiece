import { LeaderboardResponse } from "../../types/Pages";
import { mockLeaderboardFallback } from "../../assets/data/sampleLb";

export const fetchLeaderboard = async (): Promise<LeaderboardResponse> => {
try {
    const response = await fetch('https://backend.stockpiece.fun/api/v1/user/leaderboard');
    if (!response.ok) throw new Error('Network response not ok');
    return await response.json();
} catch (error) {
    console.error('Error fetching leaderboard:', error);
    return mockLeaderboardFallback;
}
};