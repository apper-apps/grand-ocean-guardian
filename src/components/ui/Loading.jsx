import { cn } from "@/utils/cn";

const Loading = ({ className, type = "card" }) => {
  if (type === "map") {
    return (
      <div className={cn("flex items-center justify-center h-full bg-surface rounded-xl", className)}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-seafoam-500 rounded-full wave-loading"></div>
          <p className="text-gray-600 font-medium">Loading ocean data...</p>
        </div>
      </div>
    );
  }

  if (type === "quiz") {
    return (
      <div className={cn("card space-y-4", className)}>
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card space-y-4", className)}>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
      </div>
    </div>
  );
};

export default Loading;