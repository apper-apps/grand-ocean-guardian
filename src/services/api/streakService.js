import streakEntriesData from "@/services/mockData/streakEntries.json";

let streakEntries = [...streakEntriesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const streakService = {
  async getUserStreak(userId) {
    await delay(200);
    const userEntries = streakEntries
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    for (let i = 0; i < userEntries.length; i++) {
      const entry = userEntries[i];
      if (entry.date === checkDate && entry.completed) {
        currentStreak++;
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toISOString().split('T')[0];
      } else if (entry.date === checkDate && !entry.completed) {
        break;
      }
    }

    // Calculate best streak
    for (let entry of userEntries) {
      if (entry.completed) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      currentStreak,
      bestStreak,
      todayCompleted: this.isTodayCompleted(userId),
      recentEntries: userEntries.slice(0, 30) // Last 30 days
    };
  },

  async checkInToday(userId, activities = []) {
    await delay(250);
    const today = new Date().toISOString().split('T')[0];
    
    // Remove existing entry for today if any
    streakEntries = streakEntries.filter(
      entry => !(entry.userId === userId && entry.date === today)
    );

    // Add new entry
    const newId = Math.max(...streakEntries.map(e => e.Id), 0) + 1;
    const newEntry = {
      Id: newId,
      userId,
      date: today,
      completed: true,
      activities
    };

    streakEntries.push(newEntry);
    
    // Recalculate streak
    const streakData = await this.getUserStreak(userId);
    return {
      ...newEntry,
      newStreak: streakData.currentStreak,
      milestoneReached: this.checkMilestone(streakData.currentStreak)
    };
  },

  async getStreakHistory(userId, days = 30) {
    await delay(150);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const history = [];
    const userEntries = streakEntries.filter(entry => entry.userId === userId);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const entry = userEntries.find(e => e.date === dateStr);
      
      history.push({
        date: dateStr,
        completed: entry ? entry.completed : false,
        activities: entry ? entry.activities : []
      });
    }

    return history.reverse(); // Most recent first
  },

  isTodayCompleted(userId) {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = streakEntries.find(
      entry => entry.userId === userId && entry.date === today
    );
    return todayEntry ? todayEntry.completed : false;
  },

  checkMilestone(streakCount) {
    const milestones = [7, 30, 50, 100, 365];
    return milestones.find(milestone => streakCount === milestone);
  },

  async getStreakActivities() {
    await delay(100);
    return [
      "avoided-plastic-bag",
      "used-reusable-bottle", 
      "brought-reusable-cup",
      "refused-plastic-straw",
      "used-metal-utensils",
      "bought-bulk-items",
      "zero-waste-lunch",
      "composted-organics",
      "glass-containers",
      "avoided-packaged-foods",
      "reusable-shopping-bag",
      "bamboo-toothbrush"
    ];
  },

  getActivityDisplayName(activity) {
    const names = {
      "avoided-plastic-bag": "Avoided plastic bags",
      "used-reusable-bottle": "Used reusable water bottle",
      "brought-reusable-cup": "Brought reusable cup",
      "refused-plastic-straw": "Refused plastic straw", 
      "used-metal-utensils": "Used metal utensils",
      "bought-bulk-items": "Bought items in bulk",
      "zero-waste-lunch": "Had zero-waste lunch",
      "composted-organics": "Composted organic waste",
      "glass-containers": "Used glass containers",
      "avoided-packaged-foods": "Avoided packaged foods",
      "reusable-shopping-bag": "Used reusable shopping bags",
      "bamboo-toothbrush": "Used bamboo toothbrush"
    };
    return names[activity] || activity;
  }
};