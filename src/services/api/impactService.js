import impactsData from "@/services/mockData/impacts.json";

let impacts = [...impactsData];
let globalImpact = {
  totalProtectionFunding: 1200000,
  totalPlasticPrevented: 2400000,
  activeUsers: 15700,
  coralFunding: 850000,
  protectedAreas: 47
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const impactService = {
  async getUserImpact(userId) {
    await delay(300);
    
    // Calculate user-specific impact metrics
    const userImpacts = impacts.filter(impact => impact.userId === userId);
    const plasticItemsAvoided = userImpacts.reduce((sum, impact) => sum + (impact.plasticItemsAvoided || 0), 847);
    const carbonReduced = userImpacts.reduce((sum, impact) => sum + (impact.carbonReduced || 0), 127);
    const fundingGenerated = userImpacts.reduce((sum, impact) => sum + (impact.fundingGenerated || 0), 234);
    const communityScore = Math.min(100, Math.round(plasticItemsAvoided / 10) + Math.round(carbonReduced / 5));

    return {
      plasticItemsAvoided,
      carbonReduced,
      fundingGenerated,
      communityScore,
      recentStories: userImpacts.slice(-3).map(impact => ({
        date: new Date(impact.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        title: impact.title,
        impact: impact.shortDescription,
        image: impact.beforePhoto || impact.afterPhoto || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400"
      }))
    };
  },

  async getGlobalImpact() {
    await delay(200);
    return { ...globalImpact };
  },

  async getCarbonFootprint(userId, timeframe = "month") {
    await delay(250);
    
    const baseData = {
      plasticFreeSavings: 45.2,
      transportSavings: 23.8,
      conservationSavings: 12.4,
      dietSavings: 31.6
    };

    // Adjust based on timeframe
    const multipliers = {
      week: 0.23,
      month: 1,
      year: 12
    };

    const multiplier = multipliers[timeframe] || 1;
    
    return {
      plasticFreeSavings: Math.round(baseData.plasticFreeSavings * multiplier * 10) / 10,
      transportSavings: Math.round(baseData.transportSavings * multiplier * 10) / 10,
      conservationSavings: Math.round(baseData.conservationSavings * multiplier * 10) / 10,
      dietSavings: Math.round(baseData.dietSavings * multiplier * 10) / 10
    };
  },

  async getAll(filters = {}) {
    await delay(200);
    let filteredImpacts = [...impacts];

    if (filters.category) {
      filteredImpacts = filteredImpacts.filter(impact => impact.category === filters.category);
    }

    if (filters.userId) {
      filteredImpacts = filteredImpacts.filter(impact => impact.userId === filters.userId);
    }

    if (filters.verified !== undefined) {
      filteredImpacts = filteredImpacts.filter(impact => impact.verified === filters.verified);
    }

    return filteredImpacts.map(impact => ({ ...impact }));
  },

  async getById(id) {
    await delay(100);
    const impact = impacts.find(impact => impact.Id === id);
    if (!impact) throw new Error("Impact story not found");
    return { ...impact };
  },

  async createStory(storyData) {
    await delay(300);
    const newId = Math.max(...impacts.map(impact => impact.Id)) + 1;
    
    const newStory = {
      Id: newId,
      userId: 1, // Current user
      ...storyData,
      timestamp: new Date().toISOString(),
      verified: false,
      plasticItemsAvoided: this.extractPlasticCount(storyData.impact),
      carbonReduced: this.extractCarbonReduction(storyData.impact),
      fundingGenerated: Math.round(Math.random() * 500) + 50,
      views: 0,
      likes: 0,
      shares: 0
    };

    impacts.unshift(newStory);
    return { ...newStory };
  },

  async updateStory(id, storyData) {
    await delay(200);
    const index = impacts.findIndex(impact => impact.Id === id);
    if (index === -1) throw new Error("Impact story not found");

    impacts[index] = {
      ...impacts[index],
      ...storyData,
      updatedAt: new Date().toISOString()
    };

    return { ...impacts[index] };
  },

  async deleteStory(id) {
    await delay(150);
    const index = impacts.findIndex(impact => impact.Id === id);
    if (index === -1) throw new Error("Impact story not found");

    impacts.splice(index, 1);
    return true;
  },

  async getSuccessStories(limit = 10) {
    await delay(200);
    return impacts
      .filter(impact => impact.verified)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(impact => ({ ...impact }));
  },

  async incrementViews(id) {
    await delay(50);
    const impact = impacts.find(impact => impact.Id === id);
    if (impact) {
      impact.views = (impact.views || 0) + 1;
    }
    return impact?.views || 0;
  },

  async addReaction(id, type) {
    await delay(100);
    const impact = impacts.find(impact => impact.Id === id);
    if (impact) {
      impact[type] = (impact[type] || 0) + 1;
    }
    return impact?.[type] || 0;
  },

  // Helper methods
  extractPlasticCount(impactText) {
    const matches = impactText.match(/(\d+).*(?:plastic|bottle|bag|container)/i);
    return matches ? parseInt(matches[1]) : Math.floor(Math.random() * 100) + 10;
  },

  extractCarbonReduction(impactText) {
    const matches = impactText.match(/(\d+(?:\.\d+)?).*(?:kg|carbon|co2)/i);
    return matches ? parseFloat(matches[1]) : Math.floor(Math.random() * 50) + 5;
  },

  // Analytics
  async getImpactAnalytics(userId) {
    await delay(200);
    const userImpacts = impacts.filter(impact => impact.userId === userId);
    
    return {
      totalStories: userImpacts.length,
      totalViews: userImpacts.reduce((sum, impact) => sum + (impact.views || 0), 0),
      totalLikes: userImpacts.reduce((sum, impact) => sum + (impact.likes || 0), 0),
      totalShares: userImpacts.reduce((sum, impact) => sum + (impact.shares || 0), 0),
      verifiedStories: userImpacts.filter(impact => impact.verified).length,
      topStory: userImpacts.sort((a, b) => (b.views || 0) - (a.views || 0))[0] || null
    };
  }
};