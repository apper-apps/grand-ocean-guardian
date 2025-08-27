import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import SightingReportModal from "./SightingReportModal";
import { sightingService } from "@/services/api/sightingService";
import { cn } from "@/utils/cn";

const InteractiveMap = () => {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSighting, setSelectedSighting] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    dateRange: "all",
    verified: "all"
  });
  const [currentLocation, setCurrentLocation] = useState({
    lat: 33.7490,
    lng: -118.4065,
    address: "Redondo Beach, CA"
  });

  const loadSightings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterOptions = {};
      if (filters.category !== "all") {
        filterOptions.category = filters.category;
      }
      if (filters.dateRange !== "all") {
        filterOptions.dateRange = filters.dateRange;
      }

      const data = await sightingService.getAll(filterOptions);
      setSightings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSightings();
  }, [filters]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Your Location"
          });
        },
        () => {
          // Use default location if geolocation fails
          toast.info("Using default location. Enable location services for accurate positioning.");
        }
      );
    }
  }, []);

  const getCategoryInfo = (category) => {
    const info = {
      wildlife: { icon: "Fish", color: "text-green-600 bg-green-100", label: "Wildlife" },
      pollution: { icon: "AlertTriangle", color: "text-red-600 bg-red-100", label: "Pollution" },
      coral: { icon: "Flower2", color: "text-blue-600 bg-blue-100", label: "Coral" },
      hazard: { icon: "AlertCircle", color: "text-orange-600 bg-orange-100", label: "Hazard" }
    };
    return info[category] || info.wildlife;
  };

  const filterOptions = [
    { value: "all", label: "All Categories" },
    { value: "wildlife", label: "Wildlife" },
    { value: "pollution", label: "Pollution" },
    { value: "coral", label: "Coral Health" },
    { value: "hazard", label: "Hazards" }
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "24h", label: "Last 24 Hours" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
  ];

  if (loading) return <Loading type="map" className="h-[600px]" />;
  if (error) return <Error type="map" message={error} onRetry={loadSightings} />;

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Ocean Map</h1>
          <p className="text-gray-600">Discover and report marine life sightings</p>
        </div>
        <Button 
          onClick={() => setShowReportModal(true)}
          icon="Plus"
          size="sm"
        >
          Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {sightings.length > 0 && (
            <Badge variant="secondary" className="self-center">
              {sightings.length} sightings found
            </Badge>
          )}
        </div>
      </Card>

      {/* Map Placeholder with Sightings */}
      <Card className="p-0 overflow-hidden">
        {/* Map View */}
        <div className="relative h-96 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
          {/* Ocean Background Effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-8 h-8 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-16 w-6 h-6 bg-white rounded-full animate-pulse animation-delay-1000"></div>
            <div className="absolute bottom-16 left-20 w-10 h-10 bg-white rounded-full animate-pulse animation-delay-2000"></div>
          </div>

          {/* Current Location Indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-coral-500 rounded-full shadow-lg animate-ping"></div>
              <div className="w-4 h-4 bg-coral-500 rounded-full shadow-lg absolute"></div>
              <span className="text-white text-xs font-medium mt-2 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                You are here
              </span>
            </div>
          </div>

          {/* Sighting Markers */}
          {sightings.slice(0, 8).map((sighting, index) => {
            const categoryInfo = getCategoryInfo(sighting.category);
            const positions = [
              { top: "20%", left: "15%" },
              { top: "30%", left: "75%" },
              { top: "60%", left: "25%" },
              { top: "70%", left: "80%" },
              { top: "25%", left: "60%" },
              { top: "80%", left: "40%" },
              { top: "40%", left: "85%" },
              { top: "15%", left: "40%" }
            ];

            const position = positions[index] || positions[0];

            return (
              <button
                key={sighting.Id}
                onClick={() => setSelectedSighting(sighting)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-110 transition-transform duration-200"
                style={{ top: position.top, left: position.left }}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white",
                  sighting.category === "wildlife" && "bg-green-500",
                  sighting.category === "pollution" && "bg-red-500",
                  sighting.category === "coral" && "bg-blue-500",
                  sighting.category === "hazard" && "bg-orange-500"
                )}>
                  <ApperIcon name={categoryInfo.icon} size={16} />
                </div>
                {sighting.verified && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white">
                    <ApperIcon name="Check" size={8} className="text-white ml-0.5 mt-0.5" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={() => toast.info("Zooming in...")}
            >
              <ApperIcon name="Plus" size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={() => toast.info("Zooming out...")}
            >
              <ApperIcon name="Minus" size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={() => toast.info("Locating you...")}
            >
              <ApperIcon name="Crosshair" size={16} />
            </Button>
          </div>
        </div>

        {/* Selected Sighting Details */}
        {selectedSighting && (
          <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-start gap-4">
              {selectedSighting.imageUrl && (
                <img 
                  src={selectedSighting.imageUrl} 
                  alt="Sighting"
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getCategoryInfo(selectedSighting.category).color}>
                    <ApperIcon name={getCategoryInfo(selectedSighting.category).icon} size={14} className="mr-1" />
                    {getCategoryInfo(selectedSighting.category).label}
                  </Badge>
                  <button
                    onClick={() => setSelectedSighting(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ApperIcon name="X" size={16} />
                  </button>
                </div>
                <p className="font-medium text-gray-900 mb-1">{selectedSighting.description}</p>
                <p className="text-sm text-gray-600">{selectedSighting.location.address}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Floating Report Button */}
      <Button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-elevated z-40 bg-coral-500 hover:bg-coral-600"
        aria-label="Report Sighting"
      >
        <ApperIcon name="Plus" size={24} />
      </Button>

      {/* Report Modal */}
      <SightingReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        location={currentLocation}
      />
    </div>
  );
};

export default InteractiveMap;