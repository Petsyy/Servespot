import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import RoleLogin from "@/pages/selection/RoleLogin";
import RoleSignup from "@/pages/selection/RoleSignup";
import VolunteerSignup from "@/pages/volunteer/VolunteerSignup";
import OrganizationSignup from "@/pages/organization/OrganizationSignup";
import VolunteerLogin from "@/pages/volunteer/VolunteerLogin";
import OrganizationLogin from "@/pages/organization/OrganizationLogin";
import VolunteerLanding from "@/pages/volunteer/VolunteerLanding";
import OrganizationLanding from "@/pages/organization/OrganizationLanding";
import BrowseOpportunities from "@/pages/organization/BrowseOpportunities";
import TaskDetails from "@/pages/organization/TaskDetails";
import BadgesAndPoints from "@/pages/organization/BadgesAndPoints";
import Notifications from "@/pages/organization/Notifications";

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

        {/* Organization */}
        <Route path="/organization/login" element={<OrganizationLogin />} />
        <Route path="/organization/signup" element={<OrganizationSignup />} />
        <Route path="/organization/homepage" element={<OrganizationLanding />} />
        <Route path="/organization/homepage" element={<OrganizationLanding />} />
        <Route path="/organization/browse-opportunities" element={<BrowseOpportunities />} />
        <Route path="/organization/task-details" element={<TaskDetails />} />
        <Route path="/organization/badges-and-points" element={<BadgesAndPoints />} />
        <Route path="/organization/notifications" element={<Notifications />} />


      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}
