import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import LandingPage from "@/components/pages/LandingPage";
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Layout><HomePage /></Layout>} />
          <Route path="/map" element={<Layout><MapPage /></Layout>} />
          <Route path="/streak" element={<Layout><StreakPage /></Layout>} />
          <Route path="/learn" element={<Layout><LearnPage /></Layout>} />
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
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