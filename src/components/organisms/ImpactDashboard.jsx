import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { impactService } from "@/services/api/impactService";
import { cn } from "@/utils/cn";

const ImpactDashboard = ({ userId = 1 }) => {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("personal");

  useEffect(() => {
    loadImpactData();
  }, [userId]);

  const loadImpactData = async () => {
    try {
      setLoading(true);
      const data = await impactService.getUserImpact(userId);
      setImpactData(data);
    } catch (error) {
      toast.error("Failed to load impact data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  const impactMetrics = [
    {
      title: "Plastic Items Avoided",
      value: impactData?.plasticItemsAvoided || 847,
      icon: "Shield",
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "bottles, bags, and containers prevented from ocean pollution"
    },
    {
      title: "Carbon Footprint Reduced",
      value: `${impactData?.carbonReduced || 127}kg`,
      icon: "Leaf",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "CO2 equivalent saved through sustainable choices"
    },
    {
      title: "Ocean Protection Funded",
      value: `$${impactData?.fundingGenerated || 234}`,
      icon: "Waves",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "contributed to real conservation projects"
    },
    {
      title: "Community Impact Score",
      value: impactData?.communityScore || 92,
      icon: "Users",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "influence on local conservation efforts"
    }
  ];

  const milestones = [
    { threshold: 100, label: "Ocean Defender", achieved: impactData?.plasticItemsAvoided >= 100 },
    { threshold: 500, label: "Plastic Warrior", achieved: impactData?.plasticItemsAvoided >= 500 },
    { threshold: 1000, label: "Conservation Champion", achieved: impactData?.plasticItemsAvoided >= 1000 },
    { threshold: 2500, label: "Ocean Guardian Legend", achieved: impactData?.plasticItemsAvoided >= 2500 }
  ];

  const currentMilestone = milestones.find(m => !m.achieved) || milestones[milestones.length - 1];
  const progress = Math.min(((impactData?.plasticItemsAvoided || 0) / currentMilestone.threshold) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header with beautiful ocean gradient */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 text-white relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                <ApperIcon name="TrendingUp" size={28} />
                Your Ocean Impact Story
              </h2>
              <p className="text-white/80">Every action creates waves of change</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => toast.success("Impact report shared!")}
              >
                <ApperIcon name="Share2" size={16} />
                Share
              </Button>
            </div>
          </div>

          {/* Current milestone progress */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Next Milestone: {currentMilestone.label}</span>
              <span className="text-sm opacity-90">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-2 bg-white/20" variant="seafoam" />
            <p className="text-sm opacity-90">
              {currentMilestone.threshold - (impactData?.plasticItemsAvoided || 0)} more items to unlock
            </p>
          </div>
        </div>

        {/* Floating elements for visual appeal */}
        <div className="absolute top-4 right-4 opacity-30">
          <ApperIcon name="Waves" size={40} className="animate-bounce" />
        </div>
        <div className="absolute bottom-6 left-6 opacity-20">
          <ApperIcon name="Fish" size={24} className="animate-pulse" />
        </div>
      </Card>

      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {impactMetrics.map((metric, index) => (
          <Card key={index} className="p-6 hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", metric.bgColor)}>
                    <ApperIcon name={metric.icon} size={24} className={metric.color} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{metric.title}</h3>
                    <div className={cn("text-3xl font-bold font-display mt-1", metric.color)}>
                      {metric.value}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Achievement Showcase */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Conservation Milestones</h3>
          <Badge variant="success" className="bg-green-100 text-green-800">
            {milestones.filter(m => m.achieved).length}/{milestones.length} Unlocked
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                milestone.achieved
                  ? "border-green-200 bg-green-50 shadow-card"
                  : "border-gray-200 bg-gray-50 opacity-60"
              )}
            >
              <div className="text-center">
                <div className={cn(
                  "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center",
                  milestone.achieved
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-500"
                )}>
                  {milestone.achieved ? (
                    <ApperIcon name="Check" size={20} />
                  ) : (
                    <ApperIcon name="Lock" size={20} />
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {milestone.label}
                </div>
                <div className="text-xs text-gray-600">
                  {milestone.threshold} items
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Impact Stories */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Your Conservation Stories</h3>
          <Button
            size="sm"
            onClick={() => toast.info("Story submission coming soon!")}
          >
            <ApperIcon name="Plus" size={16} />
            Add Story
          </Button>
        </div>

        <div className="space-y-3">
          {(impactData?.recentStories || [
            {
              date: "Dec 8, 2024",
              title: "Beach Cleanup Success",
              impact: "Removed 47 plastic bottles",
              image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400"
            },
            {
              date: "Dec 5, 2024", 
              title: "Zero Waste Week",
              impact: "Avoided 23 disposable items",
              image: "https://images.unsplash.com/photo-1542838686-3c8ac6be0a95?w=400"
            }
          ]).map((story, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <img 
                src={story.image} 
                alt={story.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{story.title}</h4>
                <p className="text-sm text-gray-600">{story.impact}</p>
                <p className="text-xs text-gray-500 mt-1">{story.date}</p>
              </div>
              <Button size="sm" variant="ghost">
                <ApperIcon name="Share2" size={14} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ImpactDashboard;