import { useState } from "react";
import { Heart, Users, Building2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

export default function RoleSignin() {
  const navigate = useNavigate();

  const [loadingVolunteer, setLoadingVolunteer] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);

  const handleVolunteer = () => {
    setLoadingVolunteer(true);
    setTimeout(() => {
      setLoadingVolunteer(false);
      navigate("/volunteer/login");
    }, 1500);
  };

  const handleOrg = () => {
    setLoadingOrg(true);
    setTimeout(() => {
      setLoadingOrg(false);
      navigate("/organization/login");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      {/* Navbar */}
      <Navbar showAuthButtons={false} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Top Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <Heart className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Connect. Volunteer. Impact.
          </h1>
          <p className="text-gray-600 mt-2 max-w-xl">
            Join our community of volunteers and organizations working together
            to make a difference.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Volunteer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              I'm a Volunteer
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to make a difference? Join our community of passionate
              volunteers and find meaningful opportunities.
            </p>
            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={handleVolunteer}
                loading={loadingVolunteer}
                variant="primary"
              >
                {loadingVolunteer ? "Redirecting..." : "Login as Volunteer"}
              </Button>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Building2 className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              I'm an Organization
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with passionate volunteers, gain the support you need to bring your projects to life, and amplify your organizations.
            </p>
            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={handleOrg}
                loading={loadingOrg}
                variant="outline"
              >
                {loadingOrg ? "Redirecting..." : "Login as Organization"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer showAuthButtons={false} />
    </div>
  );
}
