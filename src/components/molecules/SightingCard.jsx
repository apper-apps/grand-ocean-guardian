import { formatDistanceToNow } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SightingCard = ({ sighting, onClick, className }) => {
  const getCategoryInfo = (category) => {
    const info = {
      wildlife: { 
        icon: "Fish", 
        color: "text-green-600 bg-green-100",
        label: "Wildlife"
      },
      pollution: { 
        icon: "AlertTriangle", 
        color: "text-red-600 bg-red-100",
        label: "Pollution"
      },
      coral: { 
        icon: "Flower2", 
        color: "text-blue-600 bg-blue-100",
        label: "Coral"
      },
      hazard: { 
        icon: "AlertCircle", 
        color: "text-orange-600 bg-orange-100",
        label: "Hazard"
      }
    };
    return info[category] || info.wildlife;
  };

  const categoryInfo = getCategoryInfo(sighting.category);
  const timeAgo = formatDistanceToNow(new Date(sighting.timestamp), { addSuffix: true });

  return (
    <Card 
      hover
      onClick={onClick}
      className={cn("p-4 cursor-pointer", className)}
    >
      <div className="flex items-start gap-4">
        {sighting.imageUrl && (
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            <img 
              src={sighting.imageUrl} 
              alt="Sighting"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <Badge 
              variant="default"
              className={categoryInfo.color}
            >
              <ApperIcon name={categoryInfo.icon} size={14} className="mr-1" />
              {categoryInfo.label}
            </Badge>
            
            {sighting.verified && (
              <Badge variant="success" size="sm">
                <ApperIcon name="CheckCircle" size={12} className="mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
            {sighting.description}
          </p>
          
          <div className="flex items-center text-xs text-gray-500 gap-3">
            <span className="flex items-center gap-1">
              <ApperIcon name="MapPin" size={12} />
              {sighting.location.address}
            </span>
            <span className="flex items-center gap-1">
              <ApperIcon name="Clock" size={12} />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SightingCard;