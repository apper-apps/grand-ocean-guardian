import React, { useState } from "react";
import { toast } from "react-toastify";
import { sightingService } from "@/services/api/sightingService";
import { userService } from "@/services/api/userService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Input from "@/components/atoms/Input";

const SightingReportModal = ({ isOpen, onClose, location }) => {
  const [formData, setFormData] = useState({
category: "",
    subType: "",
    description: "",
    severity: 1,
    endangeredSpecies: false,
    behaviorNotes: "",
    recoveryProgress: 0,
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

const categories = [
    { 
      value: "wildlife", 
      label: "Wildlife Encounter", 
      icon: "Fish", 
      color: "text-green-600",
      subTypes: [
        { value: "endangered", label: "Endangered Species", suggestions: ["Sea Turtle", "Whale", "Seal"] },
        { value: "marine_mammals", label: "Marine Mammals", suggestions: ["Dolphin", "Whale", "Sea Lion"] },
        { value: "fish_schools", label: "Fish Schools", suggestions: ["Sardines", "Anchovies", "Tuna"] },
        { value: "sea_birds", label: "Sea Birds", suggestions: ["Pelican", "Gull", "Cormorant"] }
      ]
    },
    { 
      value: "pollution", 
      label: "Pollution Report", 
      icon: "AlertTriangle", 
      color: "text-red-600",
      subTypes: [
        { value: "microplastics", label: "Microplastics", suggestions: ["Plastic fragments", "Microbeads", "Fibers"] },
        { value: "large_debris", label: "Large Debris", suggestions: ["Plastic bags", "Bottles", "Fishing nets"] },
        { value: "chemical_spills", label: "Chemical Spills", suggestions: ["Oil spill", "Chemical discharge", "Fuel leak"] },
        { value: "oil_slicks", label: "Oil Slicks", suggestions: ["Surface oil", "Tar balls", "Sheen"] }
      ]
    },
    { 
      value: "coral", 
      label: "Coral Health", 
      icon: "Flower2", 
      color: "text-blue-600",
      subTypes: [
        { value: "bleaching", label: "Coral Bleaching", suggestions: ["White coral", "Stressed coral", "Temperature damage"] },
        { value: "healthy", label: "Healthy Coral", suggestions: ["Vibrant colors", "Active polyps", "Good coverage"] },
        { value: "recovering", label: "Recovering Coral", suggestions: ["New growth", "Color returning", "Partial recovery"] },
        { value: "dead", label: "Dead Coral", suggestions: ["Skeleton only", "Algae covered", "No life"] }
      ]
    },
    { 
      value: "infrastructure", 
      label: "Infrastructure", 
      icon: "Map", 
      color: "text-purple-600",
      subTypes: [
        { value: "mpa", label: "Marine Protected Area", suggestions: ["Boundary marker", "Restricted zone", "No-take area"] },
        { value: "cleanup_station", label: "Cleanup Station", suggestions: ["Trash bins", "Equipment", "Collection point"] },
        { value: "monitoring", label: "Monitoring Equipment", suggestions: ["Camera", "Sensor", "Data logger"] },
        { value: "research", label: "Research Site", suggestions: ["Study area", "Experimental site", "Survey point"] }
      ]
    }
  ];

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const getLocationSuggestions = () => {
    if (!selectedCategory || !formData.subType) return [];
    const subType = selectedCategory.subTypes?.find(sub => sub.value === formData.subType);
    return subType?.suggestions || [];
  };

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

    if (!formData.subType) {
      toast.error("Please select a sub-type");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please add a description");
      return;
    }

    if (formData.description.length > 100) {
      toast.error("Description must be 100 characters or less");
      return;
    }

    setLoading(true);

    try {
      // Enhanced sighting data with new fields
      const sightingData = {
        userId: 1, // Current user
        category: formData.category,
        subType: formData.subType,
        description: formData.description,
        severity: formData.severity,
        endangeredSpecies: formData.endangeredSpecies,
        behaviorNotes: formData.behaviorNotes,
        recoveryProgress: formData.category === "coral" ? formData.recoveryProgress : undefined,
        imageUrl: imagePreview || `https://images.unsplash.com/photo-${Date.now()}?w=400`,
        reliabilityScore: 1.0, // Base score for new reports
        verificationCount: 1,
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
{/* Enhanced Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      category: category.value,
                      subType: "",
                      description: ""
                    }))}
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

            {/* Sub-type Selection */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Specific Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedCategory.subTypes?.map((subType) => (
                    <button
                      key={subType.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        subType: subType.value,
                        description: getLocationSuggestions()[0] || ""
                      }))}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all duration-200",
                        formData.subType === subType.value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="text-sm font-medium">{subType.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {getLocationSuggestions().length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Common for this area
                </label>
                <div className="flex flex-wrap gap-2">
                  {getLocationSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        description: suggestion
                      }))}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Severity Scale (for pollution and coral) */}
            {(formData.category === "pollution" || formData.category === "coral") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level ({formData.severity}/4)
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>
            )}

            {/* Wildlife-specific fields */}
            {formData.category === "wildlife" && (
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.endangeredSpecies}
                    onChange={(e) => setFormData(prev => ({ ...prev, endangeredSpecies: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Endangered species</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Behavior Notes
                  </label>
                  <Input
                    placeholder="Describe observed behavior..."
                    value={formData.behaviorNotes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      behaviorNotes: e.target.value.slice(0, 50) 
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Coral-specific recovery progress */}
            {formData.category === "coral" && formData.subType === "recovering" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recovery Progress ({formData.recoveryProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.recoveryProgress}
                  onChange={(e) => setFormData(prev => ({ ...prev, recoveryProgress: parseInt(e.target.value) }))}
                  className="w-full"
className="w-full"
                />
              </div>
            )}

            {/* Enhanced Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description ({formData.description.length}/100)
              </label>
              <Input
                placeholder="Detailed description of what you observed..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: e.target.value.slice(0, 100) 
                }))}
                className={formData.description.length === 100 ? "border-yellow-500" : ""}
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