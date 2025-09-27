import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import RoleLogin from "./pages/role/RoleLogin";
import RoleSignup from "./pages/role/RoleSignup";
import VolunteerSignup from "./pages/volunteer/VolunteerSignup";
import OrganizationSignup from "./pages/organization/OrganizationSignup";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/role/login" element={<RoleLogin />} />
      <Route path="/role/signup" element={<RoleSignup />} />
      <Route path="/volunteer/signup" element={<VolunteerSignup />} />
      <Route path="/organization/signup" element={<OrganizationSignup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
