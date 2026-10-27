import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getSession, logoutSession } from "@/shared/services/api";
import { registerUserSocket } from "@/shared/utils/socket";
import { SOCKET_ENABLED } from "@/shared/utils/runtime";
import { setCookie, clearClientSessionCookies } from "@/shared/utils/cookies";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncCookies = (userData, userRole) => {
    if (!userData || !userRole) return;
    setCookie("role", userRole);

    const userId = userData.id || userData._id;

    if (userRole === "volunteer") {
      if (userId) setCookie("volunteerId", userId);
      if (userData.fullName) setCookie("volunteerName", userData.fullName);
    } else if (userRole === "organization") {
      if (userId) setCookie("orgId", userId);
      const orgName = userData.name || userData.orgName;
      if (orgName) setCookie("orgName", orgName);
    } else if (userRole === "admin") {
      if (userId) setCookie("adminId", userId);
    }
  };

  const clearStorage = () => {
    clearClientSessionCookies();

    // Legacy storage cleanup
    localStorage.removeItem("role");
    localStorage.removeItem("adminId");
    localStorage.removeItem("orgId");
    localStorage.removeItem("volunteerId");
    localStorage.removeItem("volunteerName");
    localStorage.removeItem("orgName");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("orgUser");
    localStorage.removeItem("volUser");
    localStorage.removeItem("user");
  };

  const checkSession = useCallback(async () => {
    try {
      const res = await getSession();
      if (res.data?.authenticated && res.data?.user) {
        const currentUser = res.data.user;
        const currentRole = currentUser.role;
        setUser(currentUser);
        setRole(currentRole);
        syncCookies(currentUser, currentRole);

        if (SOCKET_ENABLED && (currentUser.id || currentUser._id)) {
          registerUserSocket(currentUser.id || currentUser._id, currentRole);
        }
        return { authenticated: true, user: currentUser, role: currentRole };
      } else {
        setUser(null);
        setRole(null);
        return { authenticated: false };
      }
    } catch {
      setUser(null);
      setRole(null);
      return { authenticated: false };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    syncCookies(userData, userRole);
    if (SOCKET_ENABLED && (userData.id || userData._id)) {
      registerUserSocket(userData.id || userData._id, userRole);
    }
  };

  const logout = async () => {
    try {
      await logoutSession();
    } catch (e) {
      console.warn("Logout session error:", e);
    } finally {
      setUser(null);
      setRole(null);
      clearStorage();
    }
  };

  const value = {
    user,
    role,
    isAuthenticated: Boolean(user && role),
    loading,
    checkSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
