import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services/api/userService";
import { achievementService } from "@/services/api/achievementService";
import { sightingService } from "@/services/api/sightingService";
import { impactService } from "@/services/api/impactService";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import AchievementCard from "@/components/molecules/AchievementCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const ProfilePage = () => {
  const navigate = useNavigate();
const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [userSightings, setUserSightings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("achievements");

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
const [userData, achievementsData, sightingsData, leaderboardData, impactDataRes] = await Promise.all([
        userService.getCurrentUser(),
        achievementService.getAll(),
        sightingService.getAll({ userId: 1 }),
        userService.getLeaderboard(10),
        impactService.getUserImpact(1)
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
      setImpactData(impactDataRes);
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
    { id: "impact", label: "Impact", icon: "TrendingUp", count: impactData?.recentStories?.length || 0 },
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
          title="Plastic Items Avoided"
          value={impactData?.plasticItemsAvoided || 847}
          subtitle="bottles & bags prevented"
          icon="Shield"
          variant="coral"
        />
        <StatCard
          title="Impact Score"
          value={impactData?.communityScore || 92}
          subtitle="conservation points"
          icon="Leaf"
          variant="seafoam"
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

      {/* Impact Tab Content */}
      {activeTab === "impact" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display flex items-center gap-2">
              <ApperIcon name="TrendingUp" size={20} />
              Your Conservation Impact
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ApperIcon name="Share2" size={14} />
                Share Impact
              </Button>
              <Button size="sm">
                <ApperIcon name="Plus" size={14} />
                Add Story
              </Button>
            </div>
          </div>

          {/* Impact Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <ApperIcon name="Shield" size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700 font-display">
                    {impactData?.plasticItemsAvoided || 847}
                  </div>
                  <div className="text-sm text-green-600">Plastic Items Avoided</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <ApperIcon name="Leaf" size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700 font-display">
                    {impactData?.carbonReduced || 127}kg
                  </div>
                  <div className="text-sm text-blue-600">CO₂ Reduced</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <ApperIcon name="DollarSign" size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700 font-display">
                    ${impactData?.fundingGenerated || 234}
                  </div>
                  <div className="text-sm text-purple-600">Ocean Protection Funded</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Impact Stories */}
          <div className="space-y-4">
            {(impactData?.recentStories || []).map((story, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{story.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{story.impact}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{story.date}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <ApperIcon name="Eye" size={12} />
                        View
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ApperIcon name="Share2" size={12} />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(impactData?.recentStories?.length || 0) === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Camera" size={24} className="text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No Impact Stories Yet</h4>
              <p className="text-gray-600 mb-4">Start documenting your conservation actions and their real-world impact</p>
              <Button>
                <ApperIcon name="Plus" size={16} />
                Share Your First Story
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;