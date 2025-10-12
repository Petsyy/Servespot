import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// General Pages
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";

// Role Selection
import RoleLogin from "@/pages/user-selection/RoleLogin";
import RoleSignup from "@/pages/user-selection/RoleSignup";

// Volunteer Pages
import VolunteerLogin from "@/pages/volunteer/auth/VolunteerLogin";
import VolunteerSignup from "@/pages/volunteer/auth/VolunteerSignup";
import VolunteerLanding from "@/pages/volunteer/VolunteerLanding";
import VolunteerDashboard from "@/pages/volunteer/VolunteerDashboard";
import BrowseOpportunities from "@/pages/volunteer/browse-page/BrowseOpportunities";
import VolunteerEditProfile from "@/pages/volunteer/VolunteerEditProfile";

// Organization Pages
import OrganizationLogin from "@/pages/organization/auth/OrganizationLogin";
import OrganizationSignup from "@/pages/organization/auth/OrganizationSignup";
import OrganizationLanding from "@/pages/organization/OrganizationLanding";
import OrganizationDashboard from "@/pages/organization/OrganizationDashboard";
import MyOpportunity from "@/pages/organization/posted-page/PostedOpportunity";
import OrganizationEditProfile from "@/pages/organization/OrganizationEditProfile";

// Auth (Shared)
import ForgotPassword from "@/pages/auth/ForgotPassword";
import MyTasks from "@/pages/volunteer/tasks/MyTasks";

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
        <Route path="/volunteer/tasks" element={<MyTasks />} />
        <Route path="/volunteer/profile" element={<VolunteerEditProfile />} />
         
        {/* Organization */}
        <Route path="/organization/login" element={<OrganizationLogin />} />
        <Route path="/organization/signup" element={<OrganizationSignup />} />
        <Route path="/organization/homepage" element={<OrganizationLanding />} />
        <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
        <Route path="/organization/opportunities" element={<MyOpportunity />} />
        <Route path="/organization/forgot-password" element={<ForgotPassword />} />
        <Route path="/organization/profile" element={<OrganizationEditProfile/>} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </>
  );
}
