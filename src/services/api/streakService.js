import streakEntriesData from "@/services/mockData/streakEntries.json";
import { userService } from "@/services/api/userService";
import React from "react";
import Error from "@/components/ui/Error";

let streakEntries = [...streakEntriesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const streakService = {
async getUserStreaks(userId) {
    await delay(200);
    const user = await userService.getCurrentUser();
    const userEntries = streakEntries
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const categories = ['plasticFree', 'conservation', 'learning', 'community'];
    const streakData = {};

    for (const category of categories) {
      const categoryEntries = userEntries.filter(entry => entry.category === category);
      const streakInfo = this.calculateCategoryStreak(categoryEntries, category);
      streakData[category] = {
        ...streakInfo,
        todayCompleted: this.isTodayCompletedForCategory(userId, category),
        canUseLifeline: user.lifelineTokens > 0,
        nextMilestone: this.getNextMilestone(streakInfo.currentStreak)
      };
    }

    return {
      categories: streakData,
      lifelineTokens: user.lifelineTokens,
      totalLifelinesEarned: user.totalLifelinesEarned,
      recoveryState: user.recoveryState,
      smartReminders: this.getSmartReminderSuggestions(user, streakData)
    };
  },

  calculateCategoryStreak(entries, category) {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    // Calculate current streak
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.date === checkDate && entry.completed) {
        currentStreak++;
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toISOString().split('T')[0];
      } else if (entry.date === checkDate && !entry.completed && !entry.lifelineUsed) {
        break;
      }
    }

    // Calculate best streak
    for (let entry of entries) {
      if (entry.completed || entry.lifelineUsed) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      currentStreak,
      bestStreak,
      recentEntries: entries.slice(0, 30),
      category
    };
  },

  async getUserStreak(userId) {
    // Legacy method for backward compatibility
    const streaksData = await this.getUserStreaks(userId);
    const plasticFreeData = streaksData.categories.plasticFree;
    
    return {
      currentStreak: plasticFreeData.currentStreak,
      bestStreak: plasticFreeData.bestStreak,
      todayCompleted: plasticFreeData.todayCompleted,
      recentEntries: plasticFreeData.recentEntries
    };
  },

async checkInCategory(userId, category, activities, extraActivities = []) {
    await delay(250);
    const today = new Date().toISOString().split('T')[0];
    
    // Remove existing entry for today if any
    streakEntries = streakEntries.filter(
      entry => !(entry.userId === userId && entry.date === today && entry.category === category)
    );

    // Calculate bonus XP for extra activities
    const bonusXP = extraActivities.length * 5;
    
    // Award lifeline tokens for extra activities (1 token per 2 extra activities)
    const lifelineTokensEarned = Math.floor(extraActivities.length / 2);
    if (lifelineTokensEarned > 0) {
      await userService.addLifelineTokens(userId, lifelineTokensEarned);
    }

    const newId = Math.max(...streakEntries.map(e => e.Id), 0) + 1;
    const newEntry = {
      Id: newId,
      userId,
      date: today,
      completed: true,
      category,
      activities,
      extraActivities,
      lifelineUsed: false,
      bonusXP
    };

    streakEntries.push(newEntry);
    
    // Recalculate streaks
    const streaksData = await this.getUserStreaks(userId);
    const categoryData = streaksData.categories[category];
    
    return {
      ...newEntry,
      newStreak: categoryData.currentStreak,
      lifelineTokensEarned,
      milestoneReached: this.checkMilestone(categoryData.currentStreak, category)
    };
  },

  async checkInToday(userId, activities, extraActivities = []) {
    // Legacy method for backward compatibility - defaults to plasticFree category
    return this.checkInCategory(userId, 'plasticFree', activities, extraActivities);
  },

  async useLifeline(userId, category) {
    await delay(200);
    const user = await userService.getCurrentUser();
    
    if (user.lifelineTokens <= 0) {
      throw new Error("No lifeline tokens available");
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Create a lifeline entry
    const newId = Math.max(...streakEntries.map(e => e.Id), 0) + 1;
    const lifelineEntry = {
      Id: newId,
      userId,
      date: today,
      completed: false,
      category,
      activities: [],
      extraActivities: [],
      lifelineUsed: true,
      bonusXP: 0,
      recoveryContent: this.generateRecoveryContent(category)
    };

    streakEntries.push(lifelineEntry);
    
    // Deduct lifeline token
    await userService.useLifelineToken(userId);
    
    // Start recovery mode
    await userService.startRecovery(userId, category);

    return {
      success: true,
      streakSaved: true,
      recoveryContent: lifelineEntry.recoveryContent,
      remainingTokens: user.lifelineTokens - 1
    };
  },

  generateRecoveryContent(category) {
    const contentMap = {
      plasticFree: {
        articlesProvided: ["plastic-reduction-basics", "ocean-impact-guide", "sustainable-alternatives"],
        videosRecommended: ["daily-habits-change", "plastic-free-kitchen"],
        quizSuggested: "plastic-awareness-quiz",
        tips: ["Start small with single-use items", "Keep reusables visible as reminders"]
      },
      conservation: {
        articlesProvided: ["water-conservation-home", "energy-saving-tips", "sustainable-living"],
        videosRecommended: ["home-conservation-methods", "renewable-energy-basics"],
        quizSuggested: "conservation-fundamentals",
        tips: ["Set daily conservation goals", "Track your resource usage"]
      },
      learning: {
        articlesProvided: ["ocean-science-basics", "marine-ecosystem-guide", "climate-change-ocean"],
        videosRecommended: ["ocean-documentary-series", "marine-biology-intro"],
        quizSuggested: "ocean-knowledge-test",
        tips: ["Set aside 15 minutes daily for learning", "Join study groups"]
      },
      community: {
        articlesProvided: ["community-engagement-guide", "environmental-activism", "local-conservation"],
        videosRecommended: ["community-organizing-basics", "environmental-leadership"],
        quizSuggested: "community-action-quiz",
        tips: ["Start with online communities", "Attend local environmental events"]
      }
    };
    
    return contentMap[category] || contentMap.plasticFree;
  },

async getStreakHistory(userId, days = 30, category = null) {
    await delay(150);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const history = [];
    let userEntries = streakEntries.filter(entry => entry.userId === userId);
    
    if (category) {
      userEntries = userEntries.filter(entry => entry.category === category);
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = userEntries.filter(e => e.date === dateStr);
      
      history.push({
        date: dateStr,
        entries: dayEntries,
        categories: dayEntries.reduce((acc, entry) => {
          acc[entry.category] = {
            completed: entry.completed || entry.lifelineUsed,
            lifelineUsed: entry.lifelineUsed,
            activities: entry.activities,
            extraActivities: entry.extraActivities || [],
            bonusXP: entry.bonusXP || 0
          };
          return acc;
        }, {}),
        totalBonusXP: dayEntries.reduce((sum, entry) => sum + (entry.bonusXP || 0), 0)
      });
    }

    return history.reverse(); // Most recent first
  },

  async completeRecoveryChallenge(userId, category, challengeType, challengeData) {
    await delay(200);
    const user = await userService.getCurrentUser();
    
    if (!user.recoveryState.inRecovery || user.recoveryState.brokenStreakCategory !== category) {
      throw new Error("User is not in recovery mode for this category");
    }

    // Award XP and progress for completing recovery challenges
    let xpAwarded = 0;
    let progressMade = false;

    switch (challengeType) {
      case 'article':
        await userService.updateEducationalProgress(userId, 'articlesRead', 1);
        xpAwarded = 10;
        progressMade = true;
        break;
      case 'video':
        await userService.updateEducationalProgress(userId, 'videosWatched', 1);
        xpAwarded = 15;
        progressMade = true;
        break;
      case 'quiz':
        if (challengeData.score >= 80) {
          await userService.updateEducationalProgress(userId, 'quizzesCompleted', 1);
          xpAwarded = 25;
          progressMade = true;
        }
        break;
    }

    if (progressMade) {
      await userService.addXP(userId, xpAwarded);
      
      // Check if recovery is complete (3 different types of content consumed)
      const updatedUser = await userService.getCurrentUser();
      const progress = updatedUser.recoveryState.educationalProgress;
      const recoveryStart = new Date(updatedUser.recoveryState.recoveryStartDate);
      const daysSinceRecovery = Math.floor((new Date() - recoveryStart) / (1000 * 60 * 60 * 24));
      
      if (daysSinceRecovery >= 3 && progress.articlesRead > 0 && progress.videosWatched > 0 && progress.quizzesCompleted > 0) {
        await userService.completeRecovery(userId);
        return {
          recoveryComplete: true,
          xpAwarded,
          message: "Recovery completed! You're ready to start building your streak again."
        };
      }
    }

    return {
      recoveryComplete: false,
      xpAwarded,
      progressMade,
message: progressMade ? "Great progress on your recovery journey!" : "Keep trying to improve your score!"
    };
  },

  isTodayCompleted(userId, category = 'plasticFree') {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = streakEntries.find(
      entry => entry.userId === userId && entry.date === today && entry.category === category
    );
    return todayEntry ? (todayEntry.completed || todayEntry.lifelineUsed) : false;
  },

  isTodayCompletedForCategory(userId, category) {
    return this.isTodayCompleted(userId, category);
  },

  getSmartReminderSuggestions(user, streakData) {
    const suggestions = {
      optimalTimes: [],
      riskCategories: [],
      motivationalMessages: [],
      streakInsights: []
    };

    // Analyze user patterns and suggest optimal notification times
    if (user.notificationPreferences.smartTiming) {
      // Simulate ML-based optimal timing (in reality, this would use historical engagement data)
      const baseTime = new Date(user.notificationPreferences.preferredTimes[0]);
      suggestions.optimalTimes = [
        this.adjustTimeForEngagement(baseTime, 'high'),
        this.adjustTimeForEngagement(baseTime, 'medium')
      ];
    }

    // Identify at-risk categories
    Object.entries(streakData).forEach(([category, data]) => {
      if (!data.todayCompleted && data.currentStreak > 7) {
        suggestions.riskCategories.push({
          category,
          streak: data.currentStreak,
          riskLevel: data.currentStreak > 30 ? 'high' : 'medium'
        });
      }
    });

    return suggestions;
  },

  adjustTimeForEngagement(baseTime, engagementLevel) {
    const adjustments = {
      high: -30, // 30 minutes earlier
      medium: 0,
      low: 60    // 1 hour later
    };
    
const adjusted = new Date(baseTime);
    adjusted.setMinutes(adjusted.getMinutes() + adjustments[engagementLevel]);
    return adjusted.toTimeString().slice(0, 5); // Return HH:MM format
  },

  checkMilestone(streakCount) {
    const milestones = [7, 30, 50, 100, 365];
    return milestones.find(milestone => streakCount === milestone);
  },
async getStreakActivities(category = 'plasticFree') {
    await delay(100);
    
    const activitiesByCategory = {
      plasticFree: [
        "avoided-plastic-bag", "used-reusable-bottle", "brought-reusable-cup",
        "refused-plastic-straw", "used-metal-utensils", "bought-bulk-items",
        "zero-waste-lunch", "composted-organics", "glass-containers",
        "avoided-packaged-foods", "reusable-shopping-bag", "bamboo-toothbrush"
      ],
      conservation: [
        "water-conservation", "energy-saving", "public-transport",
        "bike-walking", "reduced-meat-consumption", "local-food-purchase",
        "repair-reuse", "efficient-appliances", "garden-native-plants",
        "rainwater-collection", "led-lights", "unplugged-devices"
      ],
      learning: [
        "completed-ocean-quiz", "read-conservation-article", "watched-documentary",
        "attended-webinar", "shared-ocean-fact", "researched-species",
        "studied-climate-impact", "learned-new-skill", "read-scientific-paper",
        "joined-discussion", "took-course", "mentored-someone"
      ],
      community: [
        "mentored-new-user", "shared-conservation-tip", "organized-cleanup",
        "led-virtual-event", "recruited-friend", "social-media-advocacy",
        "local-group-participation", "petition-signing", "volunteer-work",
        "donation-made", "awareness-campaign", "policy-advocacy"
      ]
    };

    return activitiesByCategory[category] || activitiesByCategory.plasticFree;
  },

  async getExtraActivities(category = 'plasticFree') {
    await delay(100);
    
    const extraActivitiesByCategory = {
      plasticFree: [
        "organized-beach-cleanup", "taught-plastic-reduction", "created-awareness-content",
        "convinced-business-change", "started-community-initiative"
      ],
      conservation: [
        "organized-conservation-workshop", "installed-renewable-energy",
        "created-community-garden", "led-efficiency-audit", "advocated-green-policy"
      ],
      learning: [
        "created-educational-content", "presented-at-event", "wrote-research-article",
        "developed-course-material", "organized-study-group"
      ],
      community: [
        "organized-major-event", "recruited-10-plus-members", "secured-funding",
        "partnered-with-organization", "launched-campaign"
      ]
    };
return extraActivitiesByCategory[category] || extraActivitiesByCategory.plasticFree;
  },

  getActivityDisplayName(activity) {
    const names = {
      // Plastic-Free Activities
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
      "bamboo-toothbrush": "Used bamboo toothbrush",
      
      // Conservation Activities
      "water-conservation": "Conserved water",
      "energy-saving": "Saved energy at home",
      "public-transport": "Used public transportation",
      "bike-walking": "Biked or walked instead of driving",
      "reduced-meat-consumption": "Chose plant-based meal",
      "local-food-purchase": "Bought local/seasonal food",
      "repair-reuse": "Repaired instead of replacing",
      "efficient-appliances": "Used energy-efficient appliances",
      
      // Learning Activities
      "completed-ocean-quiz": "Completed ocean conservation quiz",
      "read-conservation-article": "Read conservation article",
      "watched-documentary": "Watched environmental documentary",
      "attended-webinar": "Attended environmental webinar",
      "shared-ocean-fact": "Shared ocean conservation fact",
      "researched-species": "Researched marine species",
      
      // Community Activities
      "mentored-new-user": "Mentored new community member",
      "shared-conservation-tip": "Shared conservation tip",
      "organized-cleanup": "Organized cleanup event",
      "led-virtual-event": "Led virtual environmental event",
      "recruited-friend": "Recruited friend to join",
      "social-media-advocacy": "Posted environmental advocacy"
    };
    return names[activity] || activity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  getCategoryDisplayName(category) {
    const categoryNames = {
      plasticFree: "Plastic-Free Days",
      conservation: "Conservation Actions", 
      learning: "Learning Streaks",
      community: "Community Contributions"
    };
    return categoryNames[category] || category;
  },

  getCategoryIcon(category) {
    const categoryIcons = {
      plasticFree: "Recycle",
      conservation: "Leaf",
      learning: "BookOpen",
      community: "Users"
    };
    return categoryIcons[category] || "Calendar";
  },

  getNextMilestone(currentStreak) {
    const milestones = [7, 30, 100, 365, 1000];
    return milestones.find(m => m > currentStreak) || null;
  },

  checkMilestone(streak, category = 'plasticFree') {
    const milestones = {
      plasticFree: [7, 30, 100, 365],
      conservation: [7, 30, 100, 365],
      learning: [7, 30, 100, 365], 
      community: [7, 30, 100, 365]
    };
    
const categoryMilestones = milestones[category] || milestones.plasticFree;
    return categoryMilestones.includes(streak) ? streak : null;
  }
};