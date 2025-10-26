import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn, Shield } from 'lucide-react';
import { loginAdmin } from "@/services/admin.api";

const AdminLogin = () => {
  const navigate = useNavigate();

  // State for form data and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for empty fields
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting admin login with:', { email });
      
      // Use the imported API service
      const formData = { email, password };
      const response = await loginAdmin(formData);

      // Log the response to see the actual structure
      console.log('Login response:', response);

      // Handle different possible response structures
      const token = response.data?.token || response.data?.data?.token || response.token;
      const adminData = response.data?.admin || response.data?.data?.admin || response.admin || response.data?.user;

      if (!token) {
        console.error('No token in response:', response);
        throw new Error('No authentication token received from server');
      }

      // Store token and admin data in local storage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('activeRole', 'admin');
      
      if (adminData) {
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        localStorage.setItem('adminId', adminData._id || adminData.id);
      }

      console.log('Admin login successful, redirecting...');
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      toast.success('Admin login successful!');

    } catch (error) {
      console.error('Full login error:', error);
      
      // Enhanced error handling with more details
      let errorMessage = 'Login failed! Please check your credentials.';
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        console.error('Server error response:', serverError);
        
        errorMessage = serverError.message || 
                      serverError.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      <div className="w-full max-w-sm p-6 bg-white shadow-xl rounded-2xl border border-green-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h2>
          <p className="text-xs text-gray-600">
            Secure access to system administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="admin@servespot.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Authenticating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-4 h-4 mr-1.5" />
                Access Admin Panel
              </div>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200 mt-4">
          <p className="text-xs text-gray-500">
            Restricted access • Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;