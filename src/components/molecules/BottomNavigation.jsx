import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

const navItems = [
    { id: "home", label: "Home", icon: "Home", path: "/dashboard" },
    { id: "map", label: "Map", icon: "Map", path: "/map" },
    { id: "streak", label: "Streak", icon: "Calendar", path: "/streak" },
    { id: "learn", label: "Learn", icon: "BookOpen", path: "/learn" },
    { id: "profile", label: "Profile", icon: "User", path: "/profile" }
  ];

const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/" || location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-xl min-w-0 touch-target transition-all duration-200",
                active 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <ApperIcon 
                name={item.icon} 
                size={20} 
                className={cn(
                  "mb-1 transition-colors",
                  active && "text-primary-600"
                )}
              />
              <span className={cn(
                "text-xs font-medium leading-none",
                active && "text-primary-600"
              )}>
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;