import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react"; // 👈 added Eye, EyeOff icons
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import { Link, useNavigate } from "react-router-dom";
import { loginVolunteer, loginOrganization } from "../../services/api";
import { toast } from "react-toastify";

export default function LoginForm({
  role = "Volunteer", // or "Organization"
  icon: Icon,
}) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 state for toggle
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response =
        role === "Volunteer"
          ? await loginVolunteer(formData)
          : await loginOrganization(formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      console.log("✅ Token received:", response.data.token);

      toast.success(`${role} login successful!`);
      navigate(
        role === "Volunteer"
          ? "/volunteer/dashboard"
          : "/organization/dashboard"
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Outside Form */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-3">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">
          Sign in to your {role.toLowerCase()} account
        </p>
      </div>

      {/* Inside Form Card */}
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

        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(val) => handleChange("email", val)}
          icon={<Mail className="w-4 h-4 text-gray-400" />}
          required
        />

        {/* Password with toggle */}
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

          {/* Toggle button (eye icon) */}
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

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="flex justify-center text-sm ">
          <Link
            to="/forgot-password"
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
