import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { impactService } from "@/services/api/impactService";
import { cn } from "@/utils/cn";

const CollectiveImpact = () => {
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebrationMode, setCelebrationMode] = useState(false);

  useEffect(() => {
    loadGlobalImpact();
  }, []);

  const loadGlobalImpact = async () => {
    try {
      setLoading(true);
      const data = await impactService.getGlobalImpact();
      setGlobalData(data);
    } catch (error) {
      toast.error("Failed to load global impact data");
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    setCelebrationMode(true);
    toast.success("🎉 Community milestone reached!", {
      autoClose: 3000,
    });
    setTimeout(() => setCelebrationMode(false), 3000);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const globalMetrics = [
    {
      title: "Global Ocean Protection",
      value: globalData?.totalProtectionFunding || "$1.2M",
      icon: "Shield",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+$127K this month",
      trend: "up"
    },
    {
      title: "Plastic Items Prevented",
      value: globalData?.totalPlasticPrevented || "2.4M",
      icon: "Trash2",
      color: "text-green-600", 
      bgColor: "bg-green-100",
      change: "+847K this month",
      trend: "up"
    },
    {
      title: "Active Ocean Guardians",
      value: globalData?.activeUsers || "15.7K",
      icon: "Users",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+2.3K new this month",
      trend: "up"
    }
  ];

  const conservationGoals = [
    {
      title: "Million Bottle Challenge",
      current: globalData?.totalPlasticPrevented || 2400000,
      target: 5000000,
      icon: "Target",
      color: "bg-gradient-to-r from-blue-500 to-green-500"
    },
    {
      title: "Coral Reef Recovery Fund",
      current: globalData?.coralFunding || 850000,
      target: 2000000,
      icon: "Flower2", 
      color: "bg-gradient-to-r from-coral-500 to-orange-500"
    },
    {
      title: "Marine Protected Areas",
      current: globalData?.protectedAreas || 47,
      target: 100,
      icon: "Map",
      color: "bg-gradient-to-r from-teal-500 to-cyan-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with celebration animation */}
      <Card className={cn(
        "p-6 bg-gradient-to-br from-primary-500 to-seafoam-500 text-white relative overflow-hidden",
        celebrationMode && "animate-bounce-gentle"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <ApperIcon name="Globe" size={28} />
              Global Ocean Impact
            </h2>
            <p className="text-white/80">Together we're making waves of change</p>
          </div>
          <Button
            onClick={triggerCelebration}
            size="sm"
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <ApperIcon name="Sparkles" size={16} />
            Celebrate
          </Button>
        </div>

        {/* Confetti animation overlay */}
        {celebrationMode && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              >
                <ApperIcon 
                  name={["Star", "Heart", "Zap"][Math.floor(Math.random() * 3)]} 
                  size={16} 
                  className="text-yellow-300" 
                />
              </div>
            ))}
          </div>
        )}

        {/* Floating ocean elements */}
        <div className="absolute top-4 right-4 opacity-30 animate-wave">
          <ApperIcon name="Waves" size={32} />
        </div>
        <div className="absolute bottom-4 left-8 opacity-20 animate-pulse">
          <ApperIcon name="Fish" size={20} />
        </div>
      </Card>

      {/* Global Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {globalMetrics.map((metric, index) => (
          <Card key={index} className="p-6 hover:shadow-elevated transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", metric.bgColor)}>
                <ApperIcon name={metric.icon} size={24} className={metric.color} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{metric.title}</h3>
                <div className={cn("text-2xl font-bold font-display", metric.color)}>
                  {metric.value}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ApperIcon 
                    name="TrendingUp" 
                    size={14} 
                    className="text-green-500" 
                  />
                  <span className="text-sm text-green-600 font-medium">{metric.change}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Conservation Goals Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold font-display mb-6 flex items-center gap-2">
          <ApperIcon name="Target" size={20} />
          Global Conservation Goals
        </h3>

        <div className="space-y-6">
          {conservationGoals.map((goal, index) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", goal.color)}>
                      <ApperIcon name={goal.icon} size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                      <p className="text-sm text-gray-600">
                        {goal.current.toLocaleString()} of {goal.target.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={progress >= 100 ? "success" : "secondary"}
                    className="font-medium"
                  >
                    {Math.round(progress)}%
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(progress, 100)} 
                  className="h-3" 
                  variant={progress >= 100 ? "success" : "coral"}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Success Stories Highlight */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Global Success Stories</h3>
          <Button size="sm" variant="outline">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(globalData?.successStories || [
            {
              title: "Pacific Cleanup Initiative",
              impact: "Removed 500K plastic bottles",
              location: "Pacific Ocean",
              date: "Dec 2024",
              image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400"
            },
            {
              title: "Coral Restoration Project",
              impact: "Restored 15 hectares of reef",
              location: "Great Barrier Reef",
              date: "Nov 2024", 
              image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400"
            }
          ]).map((story, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{story.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{story.impact}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{story.location}</span>
                    <span>{story.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CollectiveImpact;