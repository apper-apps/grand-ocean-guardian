import sightingsData from "@/services/mockData/sightings.json";

let sightings = [...sightingsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sightingService = {
  async getAll(filters = {}) {
    await delay(300);
    let filtered = [...sightings];

    if (filters.category) {
      filtered = filtered.filter(s => s.category === filters.category);
    }

    if (filters.dateRange) {
      const now = new Date();
      let cutoffDate;
      
      switch (filters.dateRange) {
        case "24h":
          cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case "week":
          cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(s => new Date(s.timestamp) >= cutoffDate);
    }

    if (filters.userId) {
      filtered = filtered.filter(s => s.userId === filters.userId);
    }

    return filtered
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(s => ({ ...s }));
  },

  async getById(id) {
    await delay(150);
    const sighting = sightings.find(s => s.Id === id);
    if (!sighting) throw new Error("Sighting not found");
    return { ...sighting };
  },

  async create(sightingData) {
    await delay(400);
    const newId = Math.max(...sightings.map(s => s.Id), 0) + 1;
    
    const newSighting = {
      Id: newId,
      ...sightingData,
      timestamp: new Date().toISOString(),
      verified: false,
      xpAwarded: this.calculateXP(sightingData.category)
    };

    sightings.push(newSighting);
    return { ...newSighting };
  },

  async update(id, updateData) {
    await delay(300);
    const index = sightings.findIndex(s => s.Id === id);
    if (index === -1) throw new Error("Sighting not found");
    
    sightings[index] = { ...sightings[index], ...updateData };
    return { ...sightings[index] };
  },

  async delete(id) {
    await delay(200);
    const index = sightings.findIndex(s => s.Id === id);
    if (index === -1) throw new Error("Sighting not found");
    
    const deleted = sightings.splice(index, 1)[0];
    return { ...deleted };
  },

  calculateXP(category) {
    const xpMap = {
      wildlife: 15,
      pollution: 20,
      coral: 25,
      hazard: 30
    };
    return xpMap[category] || 10;
  },

  async getRecentSightings(limit = 10) {
    await delay(200);
    return sightings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(s => ({ ...s }));
  },

  async getSightingsByLocation(lat, lng, radiusKm = 10) {
    await delay(250);
    // Simple distance calculation for mock data
    return sightings
      .filter(s => {
        const distance = Math.sqrt(
          Math.pow(s.location.lat - lat, 2) + 
          Math.pow(s.location.lng - lng, 2)
        ) * 111; // Rough km conversion
        return distance <= radiusKm;
      })
      .map(s => ({ ...s }));
  }
};