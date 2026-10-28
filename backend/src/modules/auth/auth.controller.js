import jwt from "jsonwebtoken";
import {
  authService,
  isDatabaseUnavailableError,
  normalizeEmail,
} from "./auth.service.js";
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
    res
      .status(error.status || 500)
      .json({ message: error.message || "Failed to send OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, role, otp } = req.body;
    const result = await authService.verifyOTP({ email, role, otp });
    res.status(200).json({ message: "OTP verified successfully", ...result });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "OTP verification failed" });
  }
};

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

export const logoutSession = (_req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
};

// SESSION VERIFICATION
export const getSession = (req, res) => {
  try {
    let bearerToken = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      bearerToken = req.headers.authorization.split(" ")[1];
    }

    const cookies = parseCookies(req);
    const candidateTokens = [
      cookies.adminToken,
      cookies.authToken,
      bearerToken,
    ].filter(Boolean);

    for (const token of candidateTokens) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({
          authenticated: true,
          user: {
            id: decoded.id,
            role:
              decoded.role ||
              (token === cookies.adminToken ? "admin" : undefined),
            email: decoded.email || null,
          },
        });
      } catch {
        // Fall back to next token candidate
      }
    }

    return res
      .status(401)
      .json({ authenticated: false, message: "No active session" });
  } catch {
    return res
      .status(401)
      .json({ authenticated: false, message: "Invalid session" });
  }
};

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
