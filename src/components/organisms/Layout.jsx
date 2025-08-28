import React from 'react';
import BottomNavigation from "@/components/molecules/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
const Layout = ({ children }) => {
const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logout Button - Only show when authenticated */}
      {isAuthenticated && (
        <header className="bg-white shadow-card border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ApperIcon name="Waves" size={24} className="text-primary-500" />
                <h1 className="text-lg font-bold text-gray-900 font-display">
                  Ocean Guardian
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.totalXP?.toLocaleString() || 0} XP
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-seafoam-500 rounded-full flex items-center justify-center">
                    <ApperIcon name="User" size={16} className="text-white" />
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                  icon="LogOut"
                >
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className={`px-4 py-6 max-w-4xl mx-auto ${isAuthenticated ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {isAuthenticated && <BottomNavigation />}
    </div>
  );
};

export default Layout;