import usersData from "@/services/mockData/users.json";

let users = [...usersData];
let currentAuthUser = null;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test users for demonstration
const TEST_USERS = {
  admin: { email: 'admin@ocean.com', password: 'admin123', role: 'admin' },
  user: { email: 'explorer@ocean.com', password: 'user123', role: 'user' },
  moderator: { email: 'watcher@waves.com', password: 'mod123', role: 'moderator' }
};

const generateToken = () => {
  return 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9);
};

export const authService = {
  async login(email, password) {
    await delay(800);
    
    // Check test users first
    const testUser = Object.entries(TEST_USERS).find(([key, user]) => user.email === email);
    if (testUser) {
      const [key, userData] = testUser;
      if (userData.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      // Find or create user in mock data
      let user = users.find(u => u.email === email);
      if (!user) {
        user = {
          Id: users.length + 1,
          username: key.charAt(0).toUpperCase() + key.slice(1) + 'User',
          email: email,
          role: userData.role,
          totalXP: userData.role === 'admin' ? 5000 : 1000,
          currentStreak: 1,
          bestStreak: 1,
          achievements: userData.role === 'admin' ? [1, 2, 3, 4, 5] : [1],
          joinedDate: new Date().toISOString(),
          profileImage: null,
          streaks: {
            plasticFree: { current: 1, best: 1, lastActivity: new Date().toISOString().split('T')[0] }
          },
          lifelineTokens: userData.role === 'admin' ? 10 : 3,
          totalLifelinesEarned: userData.role === 'admin' ? 20 : 5,
          notificationPreferences: {
            enabled: true,
            preferredTimes: ["09:00", "18:00"],
            timezone: "UTC-5",
            reminderTypes: ["streak", "recovery", "milestone"],
            smartTiming: true
          },
          recoveryState: {
            inRecovery: false,
            brokenStreakCategory: null,
            recoveryStartDate: null,
            educationalProgress: {
              articlesRead: 0,
              videosWatched: 0,
              quizzesCompleted: 0
            }
          }
        };
        users.push(user);
      }
      
      currentAuthUser = user;
      return {
        user: { ...user },
        token: generateToken()
      };
    }
    
    // Check existing users
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    currentAuthUser = user;
    return {
      user: { ...user },
      token: generateToken()
    };
  },

  async signup(userData) {
    await delay(900);
    
    const { username, email, password } = userData;
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    if (users.find(u => u.username === username)) {
      throw new Error('Username already taken');
    }
    
    const newUser = {
      Id: users.length + 1,
      username,
      email,
      password,
      role: 'user',
      totalXP: 0,
      currentStreak: 0,
      bestStreak: 0,
      achievements: [],
      joinedDate: new Date().toISOString(),
      profileImage: null,
      streaks: {
        plasticFree: { current: 0, best: 0, lastActivity: null },
        conservation: { current: 0, best: 0, lastActivity: null },
        learning: { current: 0, best: 0, lastActivity: null },
        community: { current: 0, best: 0, lastActivity: null }
      },
      lifelineTokens: 3,
      totalLifelinesEarned: 3,
      notificationPreferences: {
        enabled: true,
        preferredTimes: ["09:00", "18:00"],
        timezone: "UTC-5",
        reminderTypes: ["streak", "recovery", "milestone"],
        smartTiming: true
      },
      recoveryState: {
        inRecovery: false,
        brokenStreakCategory: null,
        recoveryStartDate: null,
        educationalProgress: {
          articlesRead: 0,
          videosWatched: 0,
          quizzesCompleted: 0
        }
      }
    };
    
    users.push(newUser);
    currentAuthUser = newUser;
    
    return {
      user: { ...newUser },
      token: generateToken()
    };
  },

  async googleAuth() {
    await delay(1200);
    
    // Simulate Google OAuth flow
    const mockGoogleUser = {
      Id: users.length + 1,
      username: 'GoogleUser' + Math.floor(Math.random() * 1000),
      email: 'google.user@gmail.com',
      role: 'user',
      totalXP: 100,
      currentStreak: 1,
      bestStreak: 1,
      achievements: [1],
      joinedDate: new Date().toISOString(),
      profileImage: null,
      authProvider: 'google',
      streaks: {
        plasticFree: { current: 1, best: 1, lastActivity: new Date().toISOString().split('T')[0] }
      },
      lifelineTokens: 3,
      totalLifelinesEarned: 3,
      notificationPreferences: {
        enabled: true,
        preferredTimes: ["09:00", "18:00"],
        timezone: "UTC-5",
        reminderTypes: ["streak", "recovery", "milestone"],
        smartTiming: true
      },
      recoveryState: {
        inRecovery: false,
        brokenStreakCategory: null,
        recoveryStartDate: null,
        educationalProgress: {
          articlesRead: 0,
          videosWatched: 0,
          quizzesCompleted: 0
        }
      }
    };
    
    users.push(mockGoogleUser);
    currentAuthUser = mockGoogleUser;
    
    return {
      user: { ...mockGoogleUser },
      token: generateToken()
    };
  },

async getCurrentUser() {
    await delay(200);
    
    // Check if we have a current user
    if (!currentAuthUser) {
      // Try to restore from token if available
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        // In a real app, you would validate the token with the server
        // For demo purposes, we'll check if it's a valid format
        try {
          // Simple token validation (in real app, verify with backend)
          const tokenData = JSON.parse(atob(token.split('.')[1] || '{}'));
          if (tokenData && tokenData.userId) {
            // Find user in mock data
            const allUsers = Object.values(TEST_USERS).concat(Object.values(usersData));
            const user = allUsers.find(u => u.id === tokenData.userId || u.email === tokenData.email);
            if (user) {
              currentAuthUser = { ...user };
              return { ...currentAuthUser };
            }
          }
        } catch (error) {
          // Invalid token, remove it
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('authToken');
          }
        }
      }
      return null;
    }
    return { ...currentAuthUser };
  },

  async logout() {
    await delay(100);
    currentAuthUser = null;
    return { success: true };
  }
};