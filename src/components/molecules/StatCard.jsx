import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  trendValue,
  variant = "default",
  className 
}) => {
  const variants = {
    default: "bg-white",
    primary: "bg-gradient-to-br from-primary-500 to-primary-600 text-white",
    coral: "bg-gradient-to-br from-coral-500 to-coral-600 text-white",
    seafoam: "bg-gradient-to-br from-seafoam-500 to-seafoam-600 text-white"
  };

  const isGradient = variant !== "default";

  return (
    <Card className={cn("p-6", variants[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            isGradient ? "text-white/80" : "text-gray-600"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold mt-2 font-display",
            isGradient ? "text-white" : "text-gray-900"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-sm mt-1",
              isGradient ? "text-white/70" : "text-gray-500"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            "rounded-xl p-3",
            isGradient 
              ? "bg-white/20 backdrop-blur-sm" 
              : "bg-gray-100"
          )}>
            <ApperIcon 
              name={icon} 
              size={24} 
              className={cn(
                isGradient ? "text-white" : "text-gray-600"
              )} 
            />
          </div>
        )}
      </div>
      
      {trend && trendValue && (
        <div className="flex items-center mt-4 pt-4 border-t border-white/20">
          <ApperIcon 
            name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
            size={16} 
            className={cn(
              trend === "up" ? "text-green-500" : "text-red-500",
              isGradient && "text-white"
            )} 
          />
          <span className={cn(
            "text-sm font-medium ml-2",
            isGradient ? "text-white" : "text-gray-900"
          )}>
            {trendValue}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;