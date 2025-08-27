import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Error = ({ 
  message = "Something went wrong", 
  onRetry, 
  className,
  type = "general"
}) => {
  const getErrorContent = () => {
    if (type === "map") {
      return {
        icon: "MapPin",
        title: "Map Loading Failed",
        description: "Unable to load ocean data. Check your connection and try again."
      };
    }

    if (type === "quiz") {
      return {
        icon: "Brain",
        title: "Quiz Loading Failed", 
        description: "Unable to load quiz questions. Please try again."
      };
    }

    return {
      icon: "AlertTriangle",
      title: "Something Went Wrong",
      description: message
    };
  };

  const { icon, title, description } = getErrorContent();

  return (
    <div className={cn("card text-center py-8", className)}>
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <ApperIcon name={icon} size={32} className="text-red-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ApperIcon name="RefreshCw" size={18} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;