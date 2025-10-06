import { useState, useCallback } from "react";
import { toast } from "react-toastify";
/**
 * Custom reusable hook for API requests with loading & toast feedback.
 * Usage:
 * const { request, loading } = useApi();
 * await request(() => sendOtp({ email }));
 */
export default function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall, successMessage = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (successMessage) toast.success(successMessage);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}
