import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  title = "No Data Found", 
  description = "Nothing to display right now", 
  actionLabel, 
  onAction,
  className,
  type = "general"
}) => {
  const getEmptyContent = () => {
    if (type === "sightings") {
      return {
        icon: "Waves",
        title: "No Sightings Yet",
        description: "Be the first to report marine life or pollution in your area! Your contribution helps protect our oceans."
      };
    }

    if (type === "achievements") {
      return {
        icon: "Award",
        title: "No Achievements Yet",
        description: "Start your ocean guardian journey by reporting sightings and maintaining your plastic-free streak!"
      };
    }

    if (type === "streak") {
      return {
        icon: "Calendar",
        title: "Start Your Journey",
        description: "Begin your plastic-free streak today and help protect marine life one day at a time."
      };
    }

    return {
      icon: "Compass",
      title,
      description
    };
  };

  const { icon, title: emptyTitle, description: emptyDescription } = getEmptyContent();

  return (
    <div className={cn("card text-center py-12", className)}>
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-seafoam-100 rounded-full flex items-center justify-center">
        <ApperIcon name={icon} size={40} className="text-primary-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3 font-display">{emptyTitle}</h3>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">{emptyDescription}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default Empty;