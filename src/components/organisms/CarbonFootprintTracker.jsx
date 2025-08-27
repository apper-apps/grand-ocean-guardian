import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { impactService } from "@/services/api/impactService";
import { cn } from "@/utils/cn";

const CarbonFootprintTracker = ({ userId = 1 }) => {
  const [carbonData, setCarbonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  useEffect(() => {
    loadCarbonData();
  }, [userId, selectedTimeframe]);

  const loadCarbonData = async () => {
    try {
      setLoading(true);
      const data = await impactService.getCarbonFootprint(userId, selectedTimeframe);
      setCarbonData(data);
    } catch (error) {
      toast.error("Failed to load carbon footprint data");
    } finally {
      setLoading(false);
    }
  };

  const lifestyleChoices = [
    {
      category: "Plastic-Free Living",
      impact: carbonData?.plasticFreeSavings || 45.2,
      icon: "Recycle",
      color: "text-green-600",
      bgColor: "bg-green-100",
      actions: ["Reusable bags", "Refillable bottles", "Zero waste meals"]
    },
    {
      category: "Sustainable Transport",
      impact: carbonData?.transportSavings || 23.8,
      icon: "Bike",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      actions: ["Bike commuting", "Public transport", "Reduced flights"]
    },
    {
      category: "Conservation Actions",
      impact: carbonData?.conservationSavings || 12.4,
      icon: "Leaf",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      actions: ["Beach cleanups", "Tree planting", "Water conservation"]
    },
    {
      category: "Sustainable Diet",
      impact: carbonData?.dietSavings || 31.6,
      icon: "Apple",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      actions: ["Plant-based meals", "Local produce", "Reduced food waste"]
    }
  ];

  const totalSavings = lifestyleChoices.reduce((sum, choice) => sum + choice.impact, 0);
  const monthlyTarget = 150; // kg CO2
  const progress = Math.min((totalSavings / monthlyTarget) * 100, 100);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with carbon savings summary */}
      <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-30">
          <ApperIcon name="Leaf" size={40} className="animate-pulse" />
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                <ApperIcon name="TrendingDown" size={28} />
                Carbon Footprint Reduced
              </h2>
              <p className="text-green-100">Your positive impact on climate change</p>
            </div>
            
            <div className="flex gap-2">
              {["week", "month", "year"].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                    selectedTimeframe === period
                      ? "bg-white/30 text-white"
                      : "text-green-100 hover:text-white hover:bg-white/20"
                  )}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <div className="text-4xl font-bold font-display mb-2">
                {totalSavings.toFixed(1)} kg
              </div>
              <p className="text-green-100 text-sm">CO₂ equivalent saved this {selectedTimeframe}</p>
            </div>
            
            <div>
              <div className="text-2xl font-bold font-display mb-2">
                {progress.toFixed(0)}%
              </div>
              <p className="text-green-100 text-sm mb-2">of monthly target achieved</p>
              <Progress 
                value={progress} 
                className="bg-white/20" 
                variant="seafoam"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-100">
            <ApperIcon name="Info" size={16} />
            Equivalent to {Math.round(totalSavings / 2.3)} trees planted or {Math.round(totalSavings * 2.2)} miles not driven
          </div>
        </div>
      </Card>

      {/* Lifestyle Impact Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
          <ApperIcon name="BarChart3" size={20} />
          Impact by Lifestyle Choices
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifestyleChoices.map((choice, index) => (
            <div key={index} className="p-4 border rounded-xl hover:shadow-card transition-shadow">
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", choice.bgColor)}>
                  <ApperIcon name={choice.icon} size={20} className={choice.color} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{choice.category}</h4>
                  <div className={cn("text-xl font-bold font-display mb-2", choice.color)}>
                    -{choice.impact.toFixed(1)} kg CO₂
                  </div>
                  
                  <div className="space-y-1">
                    {choice.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <ApperIcon name="Check" size={12} className="text-green-500" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Trends */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">Monthly Reduction Trends</h3>
          <Badge variant="success" className="bg-green-100 text-green-800">
            📈 Improving
          </Badge>
        </div>

        <div className="space-y-4">
          {[
            { month: "December", savings: totalSavings, trend: "up", percentage: 15 },
            { month: "November", savings: totalSavings * 0.85, trend: "up", percentage: 8 },
            { month: "October", savings: totalSavings * 0.77, trend: "up", percentage: 12 },
            { month: "September", savings: totalSavings * 0.65, trend: "up", percentage: 5 }
          ].map((monthData, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900 w-20">{monthData.month}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-green-600">
                      -{monthData.savings.toFixed(1)} kg CO₂
                    </span>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ApperIcon name="TrendingUp" size={12} />
                      +{monthData.percentage}%
                    </div>
                  </div>
                  <Progress 
                    value={(monthData.savings / monthlyTarget) * 100} 
                    className="h-2"
                    variant="success"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
        <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
          <ApperIcon name="Lightbulb" size={20} />
          Boost Your Impact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              action: "Switch to Renewable Energy",
              potential: "25 kg CO₂/month",
              icon: "Zap",
              difficulty: "Easy"
            },
            {
              action: "Reduce Meat Consumption",
              potential: "18 kg CO₂/month", 
              icon: "Salad",
              difficulty: "Medium"
            },
            {
              action: "Home Energy Efficiency",
              potential: "12 kg CO₂/month",
              icon: "Home",
              difficulty: "Easy"
            }
          ].map((recommendation, index) => (
            <div key={index} className="p-4 bg-white rounded-xl shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ApperIcon name={recommendation.icon} size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{recommendation.action}</h4>
                  <p className="text-sm text-gray-600 mb-2">Save up to {recommendation.potential}</p>
                  <div className="flex items-center justify-between">
                    <Badge size="sm" variant="outline" className="border-green-200 text-green-700">
                      {recommendation.difficulty}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
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

export default CarbonFootprintTracker;