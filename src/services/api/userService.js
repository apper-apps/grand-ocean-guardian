import usersData from "@/services/mockData/users.json";

let users = [...usersData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  async getCurrentUser() {
    await delay(300);
    // Simulate logged in user (first user in mock data)
    const currentUser = users.find(user => user.Id === 1);
    return { ...currentUser };
  },

  async getLeaderboard(limit = 20) {
    await delay(200);
    return users
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit)
      .map(user => ({ ...user }));
  },

  async updateUserStats(userId, stats) {
    await delay(250);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex] = { ...users[userIndex], ...stats };
    return { ...users[userIndex] };
  },

  async addAchievement(userId, achievementId) {
    await delay(200);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    if (!users[userIndex].achievements.includes(achievementId)) {
      users[userIndex].achievements.push(achievementId);
    }
    
    return { ...users[userIndex] };
  },

  async updateStreak(userId, currentStreak) {
    await delay(150);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    const user = users[userIndex];
    const bestStreak = Math.max(user.bestStreak, currentStreak);
    
    users[userIndex] = { 
      ...user, 
      currentStreak, 
      bestStreak 
    };
    
    return { ...users[userIndex] };
  },

  async addXP(userId, xpAmount) {
    await delay(100);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].totalXP += xpAmount;
    return { ...users[userIndex] };
  }
};