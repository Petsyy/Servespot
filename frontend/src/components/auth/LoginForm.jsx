import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { Link, useNavigate } from "react-router-dom";
import { loginVolunteer, loginOrganization } from "@/services/api";
import useApi from "@/hooks/useApi";

export default function LoginForm({ role = "Volunteer", icon: Icon }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { request, loading } = useApi();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // clear old session (prevents wrong volunteer reuse)
      localStorage.clear();

      const data =
        role.toLowerCase() === "volunteer"
          ? await request(
              () => loginVolunteer(formData),
              "Volunteer login successful!"
            )
          : await request(
              () => loginOrganization(formData),
              "Organization login successful!"
            );

      if (role.toLowerCase() === "volunteer") {
        localStorage.setItem("volToken", data.token);

        //  backend returns "user", not "volunteer"
        const userId = data.user?.id || data.user?._id;
        localStorage.setItem("volunteerId", userId);
        localStorage.setItem("volUser", JSON.stringify(data.user));

        localStorage.setItem("token", data.token);
        localStorage.setItem("activeRole", "volunteer");

        navigate("/volunteer/homepage");
      } else {
        // unified token handling
        localStorage.setItem("token", data.token);
        localStorage.setItem("activeRole", "organization");

        // save organization info
        const orgId = data.organization?._id || data.orgId;
        localStorage.setItem("orgId", orgId);
         localStorage.setItem("orgToken", data.token);

        localStorage.setItem(
          "orgUser",
          JSON.stringify(data.organization || data.user)
        );

        navigate("/organization/homepage");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-3">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">
          Sign in to your {role.toLowerCase()} account
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-5"
      >
        <div className="flex flex-col items-center text-center mb-4">
          <h3 className="font-semibold text-lg">{role} Login</h3>
          <p className="text-gray-500 text-sm">
            Enter your credentials to access your {role.toLowerCase()} dashboard
          </p>
        </div>

        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(val) => handleChange("email", val)}
          icon={<Mail className="w-4 h-4 text-gray-400" />}
          required
        />

        {/* Password */}
        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(val) => handleChange("password", val)}
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        {/* Links */}
        <div className="flex justify-center text-sm">
          <Link
            to={`/${role.toLowerCase()}/forgot-password`}
            className="text-green-600 hover:underline flex"
          >
            Forgot password?
          </Link>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to={`/${role.toLowerCase()}/signup`}
            className="text-green-600 hover:underline"
          >
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
