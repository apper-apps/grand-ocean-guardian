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
  },

  async addLifelineTokens(userId, amount) {
    await delay(100);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].lifelineTokens += amount;
    users[userIndex].totalLifelinesEarned += amount;
    return { ...users[userIndex] };
  },

  async useLifelineToken(userId) {
    await delay(100);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    if (users[userIndex].lifelineTokens <= 0) {
      throw new Error("No lifeline tokens available");
    }
    
    users[userIndex].lifelineTokens -= 1;
    return { ...users[userIndex] };
  },

  async startRecovery(userId, category) {
    await delay(150);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].recoveryState = {
      inRecovery: true,
      brokenStreakCategory: category,
      recoveryStartDate: new Date().toISOString(),
      educationalProgress: users[userIndex].recoveryState.educationalProgress
    };
    
    return { ...users[userIndex] };
  },

  async completeRecovery(userId) {
    await delay(150);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].recoveryState = {
      inRecovery: false,
      brokenStreakCategory: null,
      recoveryStartDate: null,
      educationalProgress: users[userIndex].recoveryState.educationalProgress
    };
    
    return { ...users[userIndex] };
  },

  async updateEducationalProgress(userId, type, increment = 1) {
    await delay(100);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].recoveryState.educationalProgress[type] += increment;
    return { ...users[userIndex] };
  },

  async updateNotificationPreferences(userId, preferences) {
    await delay(150);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].notificationPreferences = {
      ...users[userIndex].notificationPreferences,
      ...preferences
    };
    
    return { ...users[userIndex] };
  },

  async updateCategoryStreak(userId, category, currentStreak) {
    await delay(150);
    const userIndex = users.findIndex(user => user.Id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    const user = users[userIndex];
    if (!user.streaks) user.streaks = {};
    if (!user.streaks[category]) {
      user.streaks[category] = { current: 0, best: 0, lastActivity: null };
    }
    
    const categoryStreak = user.streaks[category];
    categoryStreak.current = currentStreak;
    categoryStreak.best = Math.max(categoryStreak.best, currentStreak);
    categoryStreak.lastActivity = new Date().toISOString().split('T')[0];
    
    // Update legacy currentStreak for plastic-free category
    if (category === 'plasticFree') {
      user.currentStreak = currentStreak;
      user.bestStreak = Math.max(user.bestStreak, currentStreak);
    }
return { ...users[userIndex] };
  }
};