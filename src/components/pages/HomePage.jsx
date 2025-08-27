import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from "react-toastify";
import ShareButton from '@/components/atoms/ShareButton'
import { userService } from '@/services/api/userService'
import { sightingService } from "@/services/api/sightingService";
import { streakService } from "@/services/api/streakService";
import { impactService } from "@/services/api/impactService";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import SightingCard from "@/components/molecules/SightingCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentSightings, setRecentSightings] = useState([]);
const [streakData, setStreakData] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

const [userData, sightingsData, streakInfo, impactInfo] = await Promise.all([
        userService.getCurrentUser(),
        sightingService.getRecentSightings(6),
        streakService.getUserStreak(1),
        impactService.getUserImpact(1)
      ]);

      setUser(userData);
      setRecentSightings(sightingsData);
setStreakData(streakInfo);
      setImpactData(impactInfo);
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
      plasticItemsAvoided: impactData?.plasticItemsAvoided || (streakData?.currentStreak || 0) * 3,
      pollutionReports: recentSightings.filter(s => s.category === "pollution").length,
      wildlifeSpotted: recentSightings.filter(s => s.category === "wildlife").length,
      carbonReduced: impactData?.carbonReduced || 127,
      fundingGenerated: impactData?.fundingGenerated || 234
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
          Your ocean conservation dashboard
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
          variant="coral"
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

{/* Enhanced Conservation Impact Dashboard */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 text-white relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 opacity-30 animate-wave">
          <ApperIcon name="Waves" size={40} />
        </div>
        <div className="absolute bottom-4 left-6 opacity-20 animate-pulse">
          <ApperIcon name="Fish" size={24} />
        </div>
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ApperIcon name="TrendingUp" size={24} />
                <h3 className="text-xl font-bold font-display">Your Ocean Impact Story</h3>
              </div>
              <p className="text-white/80 text-sm">
                You've helped avoid <span className="font-bold">{impactStats.plasticItemsAvoided} plastic bottles</span> this year! 🌊
              </p>
            </div>
            <ShareButton 
              data={impactStats} 
              type="impact" 
              variant="ghost" 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display mb-1">
                {impactStats.plasticItemsAvoided}
              </div>
              <div className="text-xs text-white/80">Items Avoided</div>
              <div className="flex items-center justify-center mt-2">
                <ApperIcon name="Shield" size={16} className="text-green-300" />
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display mb-1">
                {impactStats.carbonReduced}kg
              </div>
              <div className="text-xs text-white/80">CO₂ Reduced</div>
              <div className="flex items-center justify-center mt-2">
                <ApperIcon name="Leaf" size={16} className="text-emerald-300" />
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display mb-1">
                ${impactStats.fundingGenerated}
              </div>
              <div className="text-xs text-white/80">Ocean Protection</div>
              <div className="flex items-center justify-center mt-2">
                <ApperIcon name="Heart" size={16} className="text-pink-300" />
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold font-display mb-1">
                {impactStats.wildlifeSpotted}
              </div>
              <div className="text-xs text-white/80">Wildlife Spotted</div>
              <div className="flex items-center justify-center mt-2">
                <ApperIcon name="Eye" size={16} className="text-blue-300" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-white/70">
              🌱 Equivalent to {Math.round(impactStats.carbonReduced / 2.3)} trees planted
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => toast.info("Impact dashboard coming soon!")}
            >
              View Full Dashboard
              <ApperIcon name="ArrowRight" size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;