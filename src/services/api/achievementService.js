import achievementsData from "@/services/mockData/achievements.json";

let achievements = [...achievementsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const achievementService = {
  async getAll() {
    await delay(200);
    return achievements.map(a => ({ ...a }));
  },

  async getById(id) {
    await delay(100);
    const achievement = achievements.find(a => a.Id === id);
    if (!achievement) throw new Error("Achievement not found");
    return { ...achievement };
  },

  async getUserAchievements(userAchievementIds = []) {
    await delay(150);
    return achievements
      .map(achievement => ({
        ...achievement,
        earned: userAchievementIds.includes(achievement.Id),
        earnedDate: userAchievementIds.includes(achievement.Id) ? new Date().toISOString() : null
      }));
  },

  async checkAchievements(userId, stats) {
    await delay(100);
    const earnedAchievements = [];

    // Check streak achievements
    if (stats.currentStreak >= 7 && !stats.achievements.includes(2)) {
      earnedAchievements.push(2); // Week Warrior
    }
    if (stats.currentStreak >= 30 && !stats.achievements.includes(4)) {
      earnedAchievements.push(4); // Plastic-Free Month
    }
    if (stats.currentStreak >= 100 && !stats.achievements.includes(9)) {
      earnedAchievements.push(9); // Streak Master
    }
    if (stats.currentStreak >= 365 && !stats.achievements.includes(10)) {
      earnedAchievements.push(10); // Guardian Legend
    }

    // Check XP achievements
    if (stats.totalXP >= 1000 && !stats.achievements.includes(7)) {
      earnedAchievements.push(7); // Community Helper
    }

    return earnedAchievements.map(id => achievements.find(a => a.Id === id));
  },

  getRarityColor(rarity) {
    const colors = {
      common: "text-gray-600 bg-gray-100",
      uncommon: "text-green-600 bg-green-100", 
      rare: "text-blue-600 bg-blue-100",
      epic: "text-purple-600 bg-purple-100",
      legendary: "text-yellow-600 bg-yellow-100"
    };
    return colors[rarity] || colors.common;
  },

  getCategoryIcon(category) {
    const icons = {
      sighting: "Eye",
      streak: "Calendar",
      learning: "Brain",
      community: "Users"
    };
    return icons[category] || "Award";
  }
};