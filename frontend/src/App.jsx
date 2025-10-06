import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// General Pages
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";

// Role Selection
import RoleLogin from "@/pages/selection/RoleLogin";
import RoleSignup from "@/pages/selection/RoleSignup";

// Volunteer Pages
import VolunteerLogin from "@/pages/volunteer/VolunteerLogin";
import VolunteerSignup from "@/pages/volunteer/VolunteerSignup";
import VolunteerLanding from "@/pages/volunteer/VolunteerLanding";
import VolunteerDashboard from "@/pages/volunteer/VolunteerDashboard";
import BrowseOpportunities from "@/pages/volunteer/opportunities/BrowseOpportunities";

// Organization Pages
import OrganizationLogin from "@/pages/organization/OrganizationLogin";
import OrganizationSignup from "@/pages/organization/OrganizationSignup";
import OrganizationLanding from "@/pages/organization/OrganizationLanding";
import OrganizationDashboard from "@/pages/organization/OrganizationDashboard";
import PostOpportunity from "@/pages/organization/PostOpportunity";
import MyOpportunity from "@/pages/organization/opportunity/PostedOpportunity";

// Auth (Shared)
import ForgotPassword from "@/pages/auth/ForgotPassword";

export default function App() {
  return (
    <>
      <Routes>
        {/* General */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />

        {/* Role Selection */}
        <Route path="/role/login" element={<RoleLogin />} />
        <Route path="/role/signup" element={<RoleSignup />} />

        {/* Volunteer */}
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/volunteer/signup" element={<VolunteerSignup />} />
        <Route path="/volunteer/homepage" element={<VolunteerLanding />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/opportunities" element={<BrowseOpportunities />} />
        <Route path="/volunteer/forgot-password" element={<ForgotPassword />} />

        {/* Organization */}
        <Route path="/organization/login" element={<OrganizationLogin />} />
        <Route path="/organization/signup" element={<OrganizationSignup />} />
        <Route path="/organization/homepage" element={<OrganizationLanding />} />
        <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
        <Route path="/organization/post-task" element={<PostOpportunity />} />
        <Route path="/organization/opportunities" element={<MyOpportunity />} />
        <Route path="/organization/forgot-password" element={<ForgotPassword />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </>
  );
}
