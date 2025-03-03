import { LeaderboardResponse } from "../../types/Pages";

export const mockLeaderboardFallback: LeaderboardResponse = {
    success: true,
    data: {
      topUsers: [
        { name: "Luffy", totalValue: 5000000 },
        { name: "Zoro", totalValue: 3200000 },
        { name: "Nami", totalValue: 2800000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Sanji", totalValue: 2400000 },
        { name: "Chopper", totalValue: 1800000 },
      ],
      currentUser: {
        name: "Luffy",
        totalValue: 5000000,
        rank: 1,
      },
    },
    message: "Using fallback data",
    statusCode: 200,
  };
  
