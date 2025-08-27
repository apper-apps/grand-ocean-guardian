import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/molecules/StatCard";
import AchievementCard from "@/components/molecules/AchievementCard";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Progress from "@/components/atoms/Progress";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { userService } from "@/services/api/userService";
import { achievementService } from "@/services/api/achievementService";
import { sightingService } from "@/services/api/sightingService";
import { format } from "date-fns";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [userSightings, setUserSightings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("achievements");

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userData, achievementsData, sightingsData, leaderboardData] = await Promise.all([
        userService.getCurrentUser(),
        achievementService.getAll(),
        sightingService.getAll({ userId: 1 }),
        userService.getLeaderboard(10)
      ]);

      setUser(userData);
      
      // Map achievements with earned status
      const userAchievements = achievementsData.map(achievement => ({
        ...achievement,
        earned: userData.achievements?.includes(achievement.Id) || false
      }));
      setAchievements(userAchievements);
      
      setUserSightings(sightingsData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Loading />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Loading />
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadProfileData} />;
  }

  const getUserRank = () => {
    const userIndex = leaderboard.findIndex(u => u.Id === user?.Id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const getProfileLevel = () => {
    const xp = user?.totalXP || 0;
    if (xp >= 5000) return { level: "Ocean Master", color: "text-purple-600 bg-purple-100" };
    if (xp >= 2500) return { level: "Marine Expert", color: "text-blue-600 bg-blue-100" };
    if (xp >= 1000) return { level: "Sea Guardian", color: "text-green-600 bg-green-100" };
    return { level: "Ocean Explorer", color: "text-gray-600 bg-gray-100" };
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const profileLevel = getProfileLevel();
  const userRank = getUserRank();

  const tabs = [
    { id: "achievements", label: "Achievements", icon: "Award", count: earnedAchievements.length },
    { id: "sightings", label: "Sightings", icon: "Eye", count: userSightings.length },
    { id: "leaderboard", label: "Leaderboard", icon: "Trophy", count: null }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6 bg-gradient-to-br from-primary-500 to-seafoam-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ApperIcon name="Waves" size={120} className="absolute -top-4 -right-4" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <ApperIcon name="User" size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold font-display mb-1">{user?.username}</h1>
              <Badge className="bg-white/20 text-white border-white/30">
                {profileLevel.level}
              </Badge>
            </div>
            
            <div className="text-right">
              {userRank && (
                <div className="mb-2">
                  <div className="text-2xl font-bold">#{userRank}</div>
                  <div className="text-xs opacity-80">Global Rank</div>
                </div>
              )}
              <p className="text-sm opacity-80">
                Member since {format(new Date(user?.joinedDate), "MMM yyyy")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold font-display">{user?.totalXP?.toLocaleString() || "0"}</div>
              <div className="text-xs opacity-80">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-display">{user?.currentStreak || 0}</div>
              <div className="text-xs opacity-80">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-display">{earnedAchievements.length}</div>
              <div className="text-xs opacity-80">Achievements</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Best Streak"
          value={user?.bestStreak || 0}
          subtitle="consecutive days"
          icon="Calendar"
        />
        <StatCard
          title="Sightings"
          value={userSightings.length}
          subtitle="reports submitted"
          icon="Eye"
        />
        <StatCard
          title="XP This Month"
          value="350"
          subtitle="keep it up!"
          icon="TrendingUp"
        />
        <StatCard
          title="Impact Score"
          value="92"
          subtitle="conservation points"
          icon="Leaf"
        />
      </div>

      {/* Tab Navigation */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <Badge size="sm" variant={activeTab === tab.id ? "primary" : "secondary"}>
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 font-display">
                  Your Achievements ({earnedAchievements.length}/{achievements.length})
                </h3>
                <Progress 
                  value={earnedAchievements.length} 
                  max={achievements.length}
                  variant="coral"
                  className="w-32"
                />
              </div>

              {achievements.length === 0 ? (
                <Empty type="achievements" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(achievement => (
                    <AchievementCard
                      key={achievement.Id}
                      achievement={achievement}
                      earned={achievement.earned}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sightings Tab */}
          {activeTab === "sightings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 font-display">
                  Your Sightings ({userSightings.length})
                </h3>
                <button
                  onClick={() => navigate("/map")}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  Report New <ApperIcon name="Plus" size={14} />
                </button>
              </div>

              {userSightings.length === 0 ? (
                <Empty 
                  type="sightings"
                  actionLabel="Report Your First Sighting"
                  onAction={() => navigate("/map")}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userSightings.slice(0, 6).map(sighting => (
                    <div key={sighting.Id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                      {sighting.imageUrl && (
                        <img 
                          src={sighting.imageUrl} 
                          alt="Sighting"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{sighting.description}</p>
                        <p className="text-sm text-gray-500">{sighting.location.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" size="sm">
                          {sighting.category}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          +{sighting.xpAwarded} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 font-display">
                Global Leaderboard
              </h3>

              <div className="space-y-2">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.Id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      user.Id === 1 ? "bg-primary-50 border-2 border-primary-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? "bg-yellow-100 text-yellow-800" :
                        index === 1 ? "bg-gray-100 text-gray-800" :
                        index === 2 ? "bg-orange-100 text-orange-800" :
                        "bg-gray-50 text-gray-600"
                      }`}>
                        {index < 3 ? (
                          <ApperIcon 
                            name={index === 0 ? "Crown" : index === 1 ? "Medal" : "Award"} 
                            size={16} 
                          />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">
                          {user.currentStreak} day streak • {user.achievements?.length || 0} achievements
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {user.totalXP.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;