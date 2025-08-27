import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ShareButton = ({ 
  data, 
  type = "impact", 
  variant = "primary", 
  size = "default",
  className 
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareData = {
    impact: {
      title: `I've helped avoid ${data?.plasticItemsAvoided || 847} plastic bottles this year! 🌊`,
      description: "Join me in protecting our oceans with Ocean Guardian App",
      hashtags: "#OceanGuardian #PlasticFree #ConservationHero #SaveTheOceans"
    },
    achievement: {
      title: `Just unlocked ${data?.title || "Ocean Defender"} achievement! 🏆`,
      description: "Making waves in ocean conservation",
      hashtags: "#Achievement #OceanConservation #EcoWarrior #MarineProtection"
    },
    cleanup: {
      title: `Before & after: Amazing cleanup transformation! 🧹✨`,
      description: "See how we're restoring our beautiful coastlines",
      hashtags: "#BeachCleanup #OceanCleanup #ConservationInAction #RestoreTheCoast"
    },
    carbon: {
      title: `Reduced my carbon footprint by ${data?.carbonReduced || 127}kg this month! 🌱`,
      description: "Small actions, big impact for our planet",
      hashtags: "#CarbonNeutral #ClimateAction #SustainableLiving #EcoFriendly"
    }
  };

  const platforms = [
    {
      name: "Instagram Stories",
      icon: "Instagram",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      optimized: "Stories format with marine photography background"
    },
    {
      name: "Instagram Feed",
      icon: "Image",
      color: "bg-gradient-to-r from-orange-400 to-pink-500",
      optimized: "Square format with impact infographics"
    },
    {
      name: "LinkedIn",
      icon: "Linkedin",
      color: "bg-blue-600",
      optimized: "Professional impact report format"
    },
    {
      name: "TikTok",
      icon: "Video",
      color: "bg-black",
      optimized: "Vertical video with animated stats"
    },
    {
      name: "Twitter",
      icon: "Twitter",
      color: "bg-blue-400",
      optimized: "Concise impact summary with hashtags"
    },
    {
      name: "Facebook",
      icon: "Facebook",
      color: "bg-blue-700",
      optimized: "Detailed story with photo gallery"
    }
  ];

  const generateOptimizedContent = async (platform) => {
    setIsGenerating(true);
    
    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = shareData[type];
      const platformContent = {
        title: content.title,
        description: content.description,
        hashtags: content.hashtags,
        platform: platform.name,
        optimizations: platform.optimized
      };

      // Copy to clipboard
      const shareText = `${platformContent.title}\n\n${platformContent.description}\n\n${platformContent.hashtags}`;
      await navigator.clipboard.writeText(shareText);
      
      toast.success(`📱 ${platform.name} content copied to clipboard!`, {
        autoClose: 3000
      });
      
      setShowShareMenu(false);
      
    } catch (error) {
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData[type].title,
          text: shareData[type].description,
          url: window.location.href
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error("Share failed");
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleQuickShare}
        loading={isGenerating}
      >
        <ApperIcon name="Share2" size={16} />
        Share Impact
      </Button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <Card className="absolute top-full right-0 mt-2 w-80 p-4 z-50 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold font-display">Share Your Impact</h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {platforms.map((platform, index) => (
                <button
                  key={index}
                  onClick={() => generateOptimizedContent(platform)}
                  disabled={isGenerating}
                  className={cn(
                    "w-full p-3 rounded-xl text-white text-left transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100",
                    platform.color
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ApperIcon name={platform.icon} size={20} />
                    <div className="flex-1">
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm opacity-90">{platform.optimized}</div>
                    </div>
                    {isGenerating ? (
                      <ApperIcon name="Loader2" size={16} className="animate-spin" />
                    ) : (
                      <ApperIcon name="ChevronRight" size={16} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ApperIcon name="Sparkles" size={14} />
                <span>AI-optimized content for each platform</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ShareButton;