import { Navigate, Route, Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/components/pages/LoginPage";
import SignupPage from "@/components/pages/SignupPage";
import React from "react";
import LearnPage from "@/components/pages/LearnPage";
import StreakPage from "@/components/pages/StreakPage";
import HomePage from "@/components/pages/HomePage";
import ProfilePage from "@/components/pages/ProfilePage";
import MapPage from "@/components/pages/MapPage";
import LandingPage from "@/components/pages/LandingPage";
import Layout from "@/components/organisms/Layout";
import Loading from "@/components/ui/Loading";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/map" 
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/streak" 
            element={
              <ProtectedRoute>
                <StreakPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-50"
        />
      </Layout>
    </Router>
  );
}

export default App;