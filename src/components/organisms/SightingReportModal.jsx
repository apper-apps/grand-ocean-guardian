import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { sightingService } from "@/services/api/sightingService";
import { userService } from "@/services/api/userService";

const SightingReportModal = ({ isOpen, onClose, location }) => {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    { value: "wildlife", label: "Wildlife Encounter", icon: "Fish", color: "text-green-600" },
    { value: "pollution", label: "Pollution Report", icon: "AlertTriangle", color: "text-red-600" },
    { value: "coral", label: "Coral Health", icon: "Flower2", color: "text-blue-600" },
    { value: "hazard", label: "Marine Hazard", icon: "AlertCircle", color: "text-orange-600" }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please add a description");
      return;
    }

    if (formData.description.length > 50) {
      toast.error("Description must be 50 characters or less");
      return;
    }

    setLoading(true);

    try {
      // Create sighting
      const sightingData = {
        userId: 1, // Current user
        category: formData.category,
        description: formData.description,
        imageUrl: imagePreview || `https://images.unsplash.com/photo-${Date.now()}?w=400`,
        location: location || {
          lat: 33.7490,
          lng: -118.4065,
          address: "Current Location"
        }
      };

      const newSighting = await sightingService.create(sightingData);
      
      // Award XP to user
      await userService.addXP(1, newSighting.xpAwarded);

      toast.success(`Sighting reported! +${newSighting.xpAwarded} XP earned`);
      
      // Reset form
      setFormData({ category: "", description: "", image: null });
      setImagePreview(null);
      onClose();
      
    } catch (error) {
      console.error("Error submitting sighting:", error);
      toast.error("Failed to submit sighting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              Report Sighting
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105",
                      formData.category === category.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <ApperIcon 
                      name={category.icon} 
                      size={20} 
                      className={cn(
                        "mb-2",
                        formData.category === category.value ? "text-primary-600" : category.color
                      )} 
                    />
                    <div className="text-sm font-medium">{category.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description ({formData.description.length}/50)
              </label>
              <Input
                placeholder="Brief description of what you observed..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: e.target.value.slice(0, 50) 
                }))}
                className={formData.description.length === 50 ? "border-yellow-500" : ""}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <ApperIcon name="X" size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                  <ApperIcon name="Camera" size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Tap to add photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Location Display */}
            {location && (
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ApperIcon name="MapPin" size={16} />
                  <span>{location.address || "Current Location"}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Report Sighting
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default SightingReportModal;