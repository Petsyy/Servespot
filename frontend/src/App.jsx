import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import RoleLogin from "./pages/selection/RoleLogin";
import RoleSignup from "./pages/selection/RoleSignup";
import VolunteerSignup from "./pages/volunteer/VolunteerSignup";
import OrganizationSignup from "./pages/organization/OrganizationSignup";
import VolunteerLogin from "./pages/volunteer/VolunteerLogin";
import OrganizationLogin from "./pages/organization/OrganizationLogin";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import OrganizationDashboard from "./pages/organization/OrganizationDashboard";

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/role/login" element={<RoleLogin />} />
      <Route path="/role/signup" element={<RoleSignup />} />
      <Route path="/volunteer/login" element={<VolunteerLogin />} />
      <Route path="/organization/login" element={<OrganizationLogin />} />
      <Route path="/volunteer/signup" element={<VolunteerSignup />} />
      <Route path="/organization/signup" element={<OrganizationSignup />} />
      <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
      <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}
