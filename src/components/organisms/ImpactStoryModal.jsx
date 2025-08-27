import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { impactService } from "@/services/api/impactService";
import { cn } from "@/utils/cn";

const ImpactStoryModal = ({ isOpen, onClose, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "cleanup",
    impact: initialData?.impact || "",
    location: initialData?.location || "",
    beforePhoto: initialData?.beforePhoto || null,
    afterPhoto: initialData?.afterPhoto || null,
    policyImpact: initialData?.policyImpact || "",
    researchContribution: initialData?.researchContribution || "",
    ...initialData
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("story");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.Id) {
        await impactService.updateStory(initialData.Id, formData);
        toast.success("🎉 Success story updated!");
      } else {
        await impactService.createStory(formData);
        toast.success("🎉 Success story submitted for review!");
      }
      onClose();
    } catch (error) {
      toast.error("Failed to save story");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "cleanup", label: "Beach/Ocean Cleanup", icon: "Trash2" },
    { value: "restoration", label: "Habitat Restoration", icon: "Flower2" },
    { value: "research", label: "Scientific Research", icon: "Microscope" },
    { value: "policy", label: "Policy Change", icon: "Scale" },
    { value: "community", label: "Community Mobilization", icon: "Users" },
    { value: "education", label: "Education Initiative", icon: "GraduationCap" }
  ];

  const tabs = [
    { id: "story", label: "Story Details", icon: "FileText" },
    { id: "impact", label: "Impact Metrics", icon: "BarChart3" },
    { id: "photos", label: "Documentation", icon: "Camera" },
    { id: "contribution", label: "Research & Policy", icon: "BookOpen" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold font-display">
              {initialData ? "Edit Success Story" : "Share Your Impact Story"}
            </h2>
            <p className="text-gray-600">Document how your actions created real change</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-coral-500 text-coral-600 bg-coral-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <ApperIcon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Story Details Tab */}
            {activeTab === "story" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="e.g., Community Beach Cleanup Removes 500kg of Plastic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map(category => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-left",
                          formData.category === category.value
                            ? "border-coral-500 bg-coral-50 text-coral-700"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <ApperIcon name={category.icon} size={16} />
                          <span className="text-sm font-medium">{category.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="Tell your conservation success story... What happened? Who was involved? What challenges did you overcome?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="e.g., Santa Monica Beach, California"
                    required
                  />
                </div>
              </div>
            )}

            {/* Impact Metrics Tab */}
            {activeTab === "impact" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantified Impact
                  </label>
                  <input
                    type="text"
                    value={formData.impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="e.g., 500kg of plastic removed, 25 hectares of coral restored"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      People Involved
                    </label>
                    <input
                      type="number"
                      value={formData.peopleInvolved || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, peopleInvolved: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                      placeholder="Number of volunteers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.duration || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                      placeholder="Total time invested"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long-term Benefits
                  </label>
                  <textarea
                    value={formData.longTermBenefits || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, longTermBenefits: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="What ongoing positive effects has this action created?"
                  />
                </div>
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === "photos" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Before Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-coral-500 transition-colors cursor-pointer">
                      <ApperIcon name="Upload" size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload before photo</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      After Photo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                      <ApperIcon name="Upload" size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload after photo</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Media
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <ApperIcon name="Camera" size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload videos, time-lapse, or additional photos</p>
                    <p className="text-xs text-gray-500 mt-1">Supports images, videos up to 10MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Research & Policy Tab */}
            {activeTab === "contribution" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Impact
                  </label>
                  <textarea
                    value={formData.policyImpact}
                    onChange={(e) => setFormData(prev => ({ ...prev, policyImpact: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="How did your action influence local policies, regulations, or government decisions?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Contribution
                  </label>
                  <textarea
                    value={formData.researchContribution}
                    onChange={(e) => setFormData(prev => ({ ...prev, researchContribution: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="Did your data contribute to scientific research, studies, or publications?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media Coverage
                  </label>
                  <input
                    type="url"
                    value={formData.mediaCoverage || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, mediaCoverage: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    placeholder="Links to news articles, blog posts, or social media coverage"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="Info" size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Why This Matters</h4>
                      <p className="text-sm text-blue-800">
                        Documenting policy and research impacts helps us demonstrate the real-world effectiveness 
                        of conservation actions and builds evidence for scaling successful interventions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <ApperIcon name="Shield" size={16} className="inline mr-1" />
                Your story will be reviewed before publication
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!formData.title || !formData.description}
                >
                  {initialData ? "Update Story" : "Submit Story"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ImpactStoryModal;