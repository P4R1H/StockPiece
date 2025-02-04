import { LeaderboardResponse } from "../../types/Pages";

export const mockLeaderboardFallback: LeaderboardResponse = {
    success: true,
    data: {
      topUsers: [
        { name: "Luffy", stockValue: 5000000 },
        { name: "Zoro", stockValue: 3200000 },
        { name: "Nami", stockValue: 2800000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Sanji", stockValue: 2400000 },
        { name: "Chopper", stockValue: 1800000 },
      ],
      currentUser: {
        name: "Luffy",
        stockValue: 5000000,
        rank: 1,
      },
    },
    message: "Using fallback data",
    statusCode: 200,
  };
  
