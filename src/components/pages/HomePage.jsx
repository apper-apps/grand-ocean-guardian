import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/molecules/StatCard";
import SightingCard from "@/components/molecules/SightingCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { userService } from "@/services/api/userService";
import { sightingService } from "@/services/api/sightingService";
import { streakService } from "@/services/api/streakService";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentSightings, setRecentSightings] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userData, sightingsData, streakInfo] = await Promise.all([
        userService.getCurrentUser(),
        sightingService.getRecentSightings(6),
        streakService.getUserStreak(1)
      ]);

      setUser(userData);
      setRecentSightings(sightingsData);
      setStreakData(streakInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Loading />
        <Loading />
        <Loading />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  const getUserSightings = () => {
    return recentSightings.filter(s => s.userId === user?.Id).length;
  };

  const getImpactStats = () => {
    const userSightings = getUserSightings();
    return {
      plasticItemsAvoided: (streakData?.currentStreak || 0) * 3,
      pollutionReports: recentSightings.filter(s => s.category === "pollution").length,
      wildlifeSpotted: recentSightings.filter(s => s.category === "wildlife").length
    };
  };

  const impactStats = getImpactStats();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Welcome back, {user?.username}! 🌊
        </h1>
        <p className="text-gray-600">
          Continue your ocean guardian journey
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Streak"
          value={`${streakData?.currentStreak || 0}`}
          subtitle="plastic-free days"
          icon="Calendar"
          variant="coral"
        />
        <StatCard
          title="Total XP"
          value={user?.totalXP?.toLocaleString() || "0"}
          subtitle={`${user?.achievements?.length || 0} achievements`}
          icon="Award"
          variant="primary"
        />
        <StatCard
          title="Sightings"
          value={getUserSightings()}
          subtitle="reports submitted"
          icon="Eye"
          variant="seafoam"
        />
        <StatCard
          title="Impact"
          value={impactStats.plasticItemsAvoided}
          subtitle="plastic items avoided"
          icon="Shield"
        />
      </div>

      {/* Streak Status */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-seafoam-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 font-display">
              Today's Streak Status
            </h3>
            <p className="text-gray-600 text-sm">
              {streakData?.todayCompleted 
                ? "Great job! You've checked in today." 
                : "Don't forget to check in and maintain your streak!"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {streakData?.todayCompleted ? (
              <Badge variant="success" className="text-sm">
                <ApperIcon name="CheckCircle" size={14} className="mr-1" />
                Completed
              </Badge>
            ) : (
              <Button
                onClick={() => navigate("/streak")}
                size="sm"
                icon="Calendar"
              >
                Check In
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 font-display">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate("/map")}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <ApperIcon name="MapPin" size={24} className="text-coral-500" />
            <span>Report Sighting</span>
          </Button>
          
          <Button
            onClick={() => navigate("/learn")}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <ApperIcon name="Brain" size={24} className="text-primary-500" />
            <span>Take Quiz</span>
          </Button>
          
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <ApperIcon name="Trophy" size={24} className="text-seafoam-500" />
            <span>View Achievements</span>
          </Button>
        </div>
      </Card>

      {/* Recent Ocean Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 font-display">Recent Ocean Activity</h3>
          <Button
            variant="ghost"
            onClick={() => navigate("/map")}
            size="sm"
            icon="ArrowRight"
          >
            View All
          </Button>
        </div>

        {recentSightings.length === 0 ? (
          <Empty
            type="sightings"
            actionLabel="Report First Sighting"
            onAction={() => navigate("/map")}
          />
        ) : (
          <div className="space-y-3">
            {recentSightings.map((sighting) => (
              <SightingCard
                key={sighting.Id}
                sighting={sighting}
                onClick={() => navigate("/map")}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Conservation Impact */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <ApperIcon name="Waves" size={32} className="text-primary-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2 font-display">Your Ocean Impact</h3>
          <p className="text-gray-600 text-sm mb-4">
            Every action counts toward protecting our marine ecosystems
          </p>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-coral-600 font-display">
                {impactStats.plasticItemsAvoided}
              </div>
              <div className="text-xs text-gray-600">Items Avoided</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 font-display">
                {impactStats.pollutionReports}
              </div>
              <div className="text-xs text-gray-600">Pollution Reports</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 font-display">
                {impactStats.wildlifeSpotted}
              </div>
              <div className="text-xs text-gray-600">Wildlife Spotted</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;