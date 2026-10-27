import jwt from "jsonwebtoken";
import { authService, isDatabaseUnavailableError, normalizeEmail } from "./auth.service.js";
import { clearAuthCookies, setAuthCookie } from "../../utils/authCookies.js";

export { isDatabaseUnavailableError, normalizeEmail };

export const generateToken = (id, role, email = null) => {
  return authService.generateToken(id, role, email);
};

export const parseCookies = (req) => {
  const raw = req.headers.cookie || "";
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...rest] = part.split("=");
      try {
        acc[key] = decodeURIComponent(rest.join("="));
      } catch {
        acc[key] = rest.join("=");
      }
      return acc;
    }, {});
};

// VOLUNTEER SIGNUP
export const registerVolunteer = async (req, res) => {
  try {
    const result = await authService.registerVolunteer(req.body);
    setAuthCookie(res, result.token);

    res.status(201).json({
      message: "Volunteer registered successfully",
      ...result,
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    console.error("❌ Volunteer registration failed:", error);
    res.status(500).json({
      message: "Error registering volunteer",
      error: error.message,
    });
  }
};

// ORGANIZATION SIGNUP
export const registerOrganization = async (req, res) => {
  try {
    const result = await authService.registerOrganization({
      body: req.body,
      file: req.file,
    });
    setAuthCookie(res, result.token);

    res.status(201).json({
      message: "Organization registered successfully",
      ...result,
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    console.error("❌ Organization registration failed:", error);
    res.status(500).json({
      message: "Error registering organization",
      error: error.message,
    });
  }
};

// VOLUNTEER LOGIN
export const loginVolunteer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginVolunteer({ email, password });
    setAuthCookie(res, result.token);

    res.status(200).json(result);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    if (error.status === 403) {
      return res.status(403).json({
        message: error.message,
        reason: error.reason,
      });
    }

    console.error("Volunteer login failed:", error);
    if (isDatabaseUnavailableError(error)) {
      return res.status(503).json({
        message: "Database unavailable. Please try again later.",
      });
    }

    res.status(500).json({
      message: "Error logging in volunteer",
      error: error?.message || String(error),
    });
  }
};

// ORGANIZATION LOGIN
export const loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginOrganization({ email, password });
    setAuthCookie(res, result.token);

    res.status(200).json(result);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    if (error.status === 403) {
      return res.status(403).json({
        message: error.message,
        reason: error.reason,
      });
    }

    console.error("Organization login failed:", error);
    if (isDatabaseUnavailableError(error)) {
      return res.status(503).json({
        message: "Database unavailable. Please try again later.",
      });
    }

    res.status(500).json({
      message: "Error logging in organization",
      error: error?.message || String(error),
    });
  }
};

// STEP 1: SEND OTP
export const sendOTP = async (req, res) => {
  try {
    const { email, role } = req.body;
    const result = await authService.sendOTP({ email, role });
    res.status(200).json(result);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    console.error("❌ OTP send error:", error);
    res.status(error.status || 500).json({ message: error.message || "Failed to send OTP" });
  }
};

// STEP 2: VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, role, otp } = req.body;
    const result = await authService.verifyOTP({ email, role, otp });
    res.status(200).json({ message: "OTP verified successfully", ...result });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "OTP verification failed" });
  }
};

// STEP 3: RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, role, newPassword, resetToken } = req.body;
    const result = await authService.resetPassword({
      email,
      role,
      newPassword,
      resetToken,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Failed to reset password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// LOGOUT
export const logoutSession = (_req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
};

// SESSION VERIFICATION
export const getSession = (req, res) => {
  try {
    const cookies = parseCookies(req);

    if (cookies.adminToken) {
      try {
        const decoded = jwt.verify(cookies.adminToken, process.env.JWT_SECRET);
        return res.status(200).json({
          authenticated: true,
          user: {
            id: decoded.id,
            role: decoded.role || "admin",
            email: decoded.email || null,
          },
        });
      } catch {
        // Fall back to checking authToken
      }
    }

    if (cookies.authToken) {
      try {
        const decoded = jwt.verify(cookies.authToken, process.env.JWT_SECRET);
        return res.status(200).json({
          authenticated: true,
          user: {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email || null,
          },
        });
      } catch {
        // Expired or invalid auth token
      }
    }

    return res.status(401).json({ authenticated: false, message: "No active session" });
  } catch {
    return res.status(401).json({ authenticated: false, message: "Invalid session" });
  }
};

// EMAIL AVAILABILITY
export const checkEmailAvailability = async (req, res) => {
  try {
    const rawEmail = req.query?.email ?? req.body?.email;
    const result = await authService.checkEmailAvailability(rawEmail);
    res.status(200).json(result);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ available: false, message: error.message });
    }
    console.error("Email check error:", error);
    res.status(500).json({ available: false, message: "Error checking email" });
  }
};
