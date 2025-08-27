import { useState, useRef } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { impactService } from "@/services/api/impactService";
import { cn } from "@/utils/cn";

const BeforeAfterPhotos = ({ siteId, onUpdate }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("type", type);
      formData.append("siteId", siteId);

      // Simulate upload - in real app would call API
      const photoUrl = URL.createObjectURL(file);
      const newPhoto = {
        id: Date.now(),
        url: photoUrl,
        type,
        timestamp: new Date().toISOString(),
        location: "Cleanup Site"
      };

      setPhotos(prev => [...prev, newPhoto]);
      toast.success(`${type} photo uploaded successfully!`);
      
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const beforePhotos = photos.filter(p => p.type === "before");
  const afterPhotos = photos.filter(p => p.type === "after");

  const comparisons = beforePhotos.map(before => ({
    before,
    after: afterPhotos.find(after => 
      Math.abs(new Date(after.timestamp) - new Date(before.timestamp)) < 86400000 // Within 24 hours
    )
  })).filter(comp => comp.after);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold font-display flex items-center gap-2">
              <ApperIcon name="Camera" size={20} />
              Document Your Impact
            </h3>
            <p className="text-gray-600">Capture the transformation of conservation sites</p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {photos.length} Photos
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Before Photos</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-coral-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-coral-500"
            >
              <ApperIcon name="Plus" size={24} />
              <span className="text-sm font-medium">Add Before Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, "before")}
            />

            <div className="grid grid-cols-2 gap-2">
              {beforePhotos.map(photo => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.url} 
                    alt="Before" 
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <ApperIcon name="Eye" size={16} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">After Photos</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-green-500"
            >
              <ApperIcon name="Plus" size={24} />
              <span className="text-sm font-medium">Add After Photo</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {afterPhotos.map(photo => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.url} 
                    alt="After" 
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <ApperIcon name="Eye" size={16} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Before/After Comparisons */}
      {comparisons.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
            <ApperIcon name="RotateCcw" size={20} />
            Transformation Gallery
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {comparisons.map((comparison, index) => (
              <div key={index} className="space-y-4">
                <div className="relative overflow-hidden rounded-xl bg-gray-100 h-64">
                  {/* Before/After Slider */}
                  <div className="relative w-full h-full">
                    <img 
                      src={comparison.before.url}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 overflow-hidden transition-all duration-200"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img 
                        src={comparison.after.url}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Slider Control */}
                    <div className="absolute inset-0 flex items-center">
                      <div 
                        className="absolute w-1 bg-white shadow-lg cursor-col-resize z-10"
                        style={{ left: `${sliderPosition}%`, height: '100%' }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <ApperIcon name="ArrowLeftRight" size={16} className="text-gray-600" />
                        </div>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize"
                    />
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white">Before</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">After</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Cleanup Site • {new Date(comparison.before.timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.success("Comparison shared!")}
                    >
                      <ApperIcon name="Share2" size={14} />
                      Share
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedComparison(comparison)}
                    >
                      <ApperIcon name="ZoomIn" size={14} />
                      View Full
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Progress Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
          <ApperIcon name="TrendingUp" size={20} />
          Recovery Timeline
        </h3>

        <div className="space-y-4">
          {[
            { date: "Week 1", status: "Initial Assessment", progress: 0, color: "bg-red-500" },
            { date: "Week 4", status: "Cleanup Completed", progress: 40, color: "bg-yellow-500" },
            { date: "Week 8", status: "Recovery Visible", progress: 70, color: "bg-green-500" },
            { date: "Week 12", status: "Ecosystem Restored", progress: 100, color: "bg-emerald-500" }
          ].map((phase, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={cn("w-4 h-4 rounded-full", phase.color)}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{phase.status}</span>
                  <span className="text-sm text-gray-500">{phase.date}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full transition-all duration-1000", phase.color)}
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default BeforeAfterPhotos;