import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import HomePage from "@/components/pages/HomePage";
import MapPage from "@/components/pages/MapPage";
import StreakPage from "@/components/pages/StreakPage";
import LearnPage from "@/components/pages/LearnPage";
import ProfilePage from "@/components/pages/ProfilePage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/streak" element={<StreakPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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