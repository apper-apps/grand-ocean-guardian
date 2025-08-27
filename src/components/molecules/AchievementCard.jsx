import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Progress from "@/components/atoms/Progress";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const AchievementCard = ({ 
  achievement, 
  earned = false, 
  progress = 0,
  maxProgress = 100,
  onClick,
  className 
}) => {
  const getRarityColor = (rarity) => {
    const colors = {
      common: "text-gray-600 bg-gray-100",
      uncommon: "text-green-600 bg-green-100",
      rare: "text-blue-600 bg-blue-100", 
      epic: "text-purple-600 bg-purple-100",
      legendary: "text-yellow-600 bg-yellow-100"
    };
    return colors[rarity] || colors.common;
  };

  return (
    <Card 
      hover={!!onClick}
      onClick={onClick}
      className={cn(
        "p-4 relative overflow-hidden",
        !earned && "opacity-75 grayscale",
        earned && "ring-2 ring-yellow-200 shadow-elevated",
        className
      )}
    >
      {/* Celebration Effect for Earned Achievements */}
      {earned && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            earned 
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg" 
              : "bg-gray-100 text-gray-400"
          )}>
            <ApperIcon 
              name={achievement.icon} 
              size={24}
            />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge 
              size="sm"
              className={getRarityColor(achievement.rarity)}
            >
              {achievement.rarity}
            </Badge>
            {earned && (
              <Badge variant="success" size="sm">
                <ApperIcon name="CheckCircle" size={12} className="mr-1" />
                Earned
              </Badge>
            )}
          </div>
        </div>

        <h3 className={cn(
          "font-semibold mb-1 font-display",
          earned ? "text-gray-900" : "text-gray-600"
        )}>
          {achievement.name}
        </h3>
        
        <p className={cn(
          "text-sm mb-3 line-clamp-2",
          earned ? "text-gray-700" : "text-gray-500"
        )}>
          {achievement.description}
        </p>

        {/* Progress Bar for Partially Completed */}
        {!earned && progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}/{maxProgress}</span>
            </div>
            <Progress 
              value={progress} 
              max={maxProgress}
              variant="coral"
              size="sm"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={cn(
            "text-sm font-medium",
            earned ? "text-coral-600" : "text-gray-400"
          )}>
            +{achievement.xpReward} XP
          </span>
          
          {earned && (
            <ApperIcon name="Sparkles" size={16} className="text-yellow-500" />
          )}
        </div>
      </div>
    </Card>
  );
};

export default AchievementCard;