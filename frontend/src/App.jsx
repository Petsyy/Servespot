import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// General
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import Suspended from "@/pages/Suspend";

// Role Selection
import RoleLogin from "@/pages/user-selection/RoleLogin";
import RoleSignup from "@/pages/user-selection/RoleSignup";

// volunteer-pages
import VolunteerLogin from "@/pages/volunteer-pages/auth/VolunteerLogin";
import VolunteerSignup from "@/pages/volunteer-pages/auth/volunteerSignup";
import VolunteerLanding from "@/pages/volunteer-pages/VolunteerLanding";
import VolunteerDashboard from "@/pages/volunteer-pages/VolunteerDashboard";
import BrowseOpportunities from "@/pages/volunteer-pages/browse-page/BrowseOpportunities";
import VolunteerProfile from "@/pages/volunteer-pages/VolunteerProfile";
import VolunteerBadges from "@/pages/volunteer-pages/VolunteerBadges";
import VolunteerNotifications from "@/pages/volunteer-pages/VolunteerNotifications";
import VolunteerTasks from "@/pages/volunteer-pages/VolunteerTasks";

// Organization
import OrganizationLogin from "@/pages/organization-pages/auth/OrganizationLogin";
import OrganizationSignup from "@/pages/organization-pages/auth/OrganizationSignup";
import OrganizationLanding from "@/pages/organization-pages/OrganizationLanding";
import OrganizationDashboard from "@/pages/organization-pages/OrganizationDashboard";
import MyOpportunity from "@/pages/organization-pages/posted-page/PostedOpportunity";
import OrganizationProfile from "@/pages/organization-pages/OrganizationProfile";
import OrganizationReports from "@/pages/organization-pages/OrganizationReports";
import OrganizationNotifications from "@/pages/organization-pages/OrganizationNotifications";

// Admin
import AdminLogin from "@/components/auth/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import AdminReports from "@/pages/admin/AdminReports";
import AdminNotifications from "@/pages/admin/AdminNotifications";

// Shared
import ForgotPassword from "@/pages/auth-password/ForgotPassword";

export default function App() {

  return (
    <>
      <Routes>
        {/* General */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/suspended" element={<Suspended />} />

        {/* Role Selection */}
        <Route path="/role/login" element={<RoleLogin />} />
        <Route path="/role/signup" element={<RoleSignup />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/management" element={<UserManagement />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />

        {/* Volunteer */}
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/volunteer/signup" element={<VolunteerSignup />} />
        <Route path="/volunteer/homepage" element={<VolunteerLanding />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/volunteer/opportunities" element={<BrowseOpportunities />} />
        <Route path="/volunteer/forgot-password" element={<ForgotPassword />} />
        <Route path="/volunteer/tasks" element={<VolunteerTasks/>} />
        <Route path="/volunteer/profile" element={<VolunteerProfile />} />
        <Route path="/volunteer/badges" element={<VolunteerBadges />} />
        <Route path="/volunteer/notifications" element={<VolunteerNotifications />} />

        {/* Organization */}
        <Route path="/organization/login" element={<OrganizationLogin />} />
        <Route path="/organization/signup" element={<OrganizationSignup />} />
        <Route path="/organization/homepage" element={<OrganizationLanding />} />
        <Route path="/organization/dashboard" element={<OrganizationDashboard />} />
        <Route path="/organization/opportunities" element={<MyOpportunity />} />
        <Route path="/organization/forgot-password" element={<ForgotPassword />} />
        <Route path="/organization/profile" element={<OrganizationProfile />} />

        <Route path="/organization/reports" element={<OrganizationReports />} />
        <Route path="/organization/notifications" element={<OrganizationNotifications />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </>
  );
}
