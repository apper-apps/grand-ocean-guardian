import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import StatCard from '@/components/molecules/StatCard';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Wildlife Sighting Reports",
      description: "Document marine life encounters and contribute to conservation research with GPS-tagged observations.",
      icon: "Eye",
      color: "text-coral-500",
      bgColor: "bg-coral-50"
    },
    {
      title: "Plastic-Free Streak Tracking",
      description: "Build sustainable habits by tracking your daily progress in reducing plastic consumption.",
      icon: "Calendar",
      color: "text-seafoam-500", 
      bgColor: "bg-seafoam-50"
    },
    {
      title: "Interactive Ocean Map",
      description: "Explore real-time marine data, conservation zones, and community-reported sightings.",
      icon: "Map",
      color: "text-primary-500",
      bgColor: "bg-primary-50"
    },
    {
      title: "Impact Dashboard",
      description: "Visualize your conservation impact with detailed metrics on plastic reduction and carbon footprint.",
      icon: "TrendingUp",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Conservation Learning",
      description: "Expand your knowledge with interactive quizzes and educational content about marine ecosystems.",
      icon: "Brain",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Community Challenges",
      description: "Join fellow ocean guardians in collective conservation efforts and achievement unlocks.",
      icon: "Users",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    }
  ];

  const impactStats = [
    { label: "Plastic Items Prevented", value: "2.1M+", icon: "Shield" },
    { label: "Active Guardians", value: "15K+", icon: "Users" },
    { label: "Wildlife Reports", value: "47K+", icon: "Eye" },
    { label: "Conservation Projects", value: "$127K+", icon: "Heart" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {/* Navigation Header */}
      <nav className="relative z-10 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-coral-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Waves" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-gray-900">Ocean Guardian</h1>
              <p className="text-xs text-gray-600">Protect Our Blue Planet</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            size="sm"
            icon="ArrowRight"
          >
            Enter App
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating ocean elements */}
          <div className="absolute top-8 left-8 opacity-20 animate-bounce">
            <ApperIcon name="Fish" size={32} className="text-blue-400" />
          </div>
          <div className="absolute top-16 right-12 opacity-30 animate-pulse">
            <ApperIcon name="Waves" size={28} className="text-teal-400" />
          </div>
          <div className="absolute bottom-12 left-16 opacity-25 animate-wave">
            <ApperIcon name="Shell" size={24} className="text-coral-400" />
          </div>

          <div className="relative z-10">
            <Badge variant="success" className="mb-6 bg-seafoam-100 text-seafoam-800 px-4 py-2">
              <ApperIcon name="Sparkles" size={16} className="mr-2" />
              Join the Ocean Conservation Movement
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 mb-6 leading-tight">
              Every Action Creates
              <span className="block bg-gradient-to-r from-coral-500 via-primary-500 to-seafoam-500 bg-clip-text text-transparent">
                Waves of Change
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your daily choices into powerful ocean conservation. Track your impact, discover marine life, and join thousands of guardians protecting our blue planet for future generations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="min-w-48"
                icon="Waves"
              >
                Start Your Journey
              </Button>
              <Button
                onClick={() => navigate('/map')}
                variant="outline"
                size="lg"
                className="min-w-48"
                icon="Play"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ApperIcon name="Shield" size={16} className="text-green-500" />
                <span>Science-Based Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Users" size={16} className="text-blue-500" />
                <span>15,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Award" size={16} className="text-purple-500" />
                <span>Featured by Ocean Conservancy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="px-4 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">
              Collective Ocean Impact
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Together, our community has achieved remarkable conservation milestones
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                variant={index % 4 === 0 ? "coral" : index % 4 === 1 ? "primary" : index % 4 === 2 ? "seafoam" : "default"}
                className="text-center"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">
              Powerful Conservation Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to make a meaningful impact on ocean health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-elevated transition-all duration-300 group hover:scale-105">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <ApperIcon name={feature.icon} size={24} className={feature.color} />
                </div>
                <h3 className="text-lg font-semibold font-display text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-8 right-8 opacity-30 animate-wave">
          <ApperIcon name="Waves" size={64} className="text-white" />
        </div>
        <div className="absolute bottom-8 left-8 opacity-20 animate-pulse">
          <ApperIcon name="Fish" size={48} className="text-white" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-white mb-6">
            Our Mission: Heal the Ocean, One Action at a Time
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            We believe that individual actions, when multiplied across millions of people, can create unprecedented positive change for our oceans. Through technology, community, and science-based insights, we're building a movement that makes conservation accessible, engaging, and impactful.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 min-w-48"
              icon="Compass"
            >
              Begin Your Impact
            </Button>
            <Button
              onClick={() => navigate('/learn')}
              variant="ghost"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-w-48"
              icon="BookOpen"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-coral-50 to-seafoam-50 rounded-2xl p-8 lg:p-12 border border-coral-100">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-coral-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ApperIcon name="Heart" size={32} className="text-white" />
            </div>
            
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">
              Ready to Become an Ocean Guardian?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of ocean advocates who are already making waves. Your conservation journey starts with a single step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/dashboard')}
                size="lg"
                className="min-w-48"
                icon="ArrowRight"
              >
                Start Protecting Oceans
              </Button>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <ApperIcon name="Clock" size={14} />
                <span>Takes less than 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-coral-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Waves" size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold font-display">Ocean Guardian</div>
                <div className="text-xs text-gray-400">Protecting our blue planet</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Contact Us</button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-xs text-gray-500">
            © 2024 Ocean Guardian. Every wave counts in our mission to protect marine life.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;