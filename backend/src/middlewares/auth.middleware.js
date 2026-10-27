import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Volunteer from "../modules/volunteers/volunteer.model.js";
import Organization from "../modules/organizations/organization.model.js";

const getCookies = (req) => {
  const raw = req.headers.cookie || "";
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...rest] = part.split("=");
      acc[key] = decodeURIComponent(rest.join("="));
      return acc;
    }, {});
};

const getBearerToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return "";
};

const getToken = (req, cookieName) => {
  const bearerToken = getBearerToken(req);
  if (bearerToken) return bearerToken;

  const cookies = getCookies(req);
  return cookies[cookieName] || "";
};


export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (req.user && req.user.role) {
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Requires role: ${allowedRoles.join(" or ")}`,
        });
      }
      return next();
    }

    let token = getBearerToken(req);
    if (!token) {
      const cookies = getCookies(req);
      if (allowedRoles.length === 1 && allowedRoles[0] === "admin") {
        token = cookies.adminToken || cookies.authToken || "";
      } else if (allowedRoles.includes("admin")) {
        token = cookies.authToken || cookies.adminToken || "";
      } else {
        token = cookies.authToken || "";
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        ...decoded,
        id: decoded.id,
        role:
          decoded.role ||
          (allowedRoles.includes("admin") ? "admin" : undefined),
        email: decoded.email || null,
      };

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Requires role: ${allowedRoles.join(" or ")}`,
        });
      }

      // Extra security: check if account is suspended when DB is connected
      if (mongoose.connection?.readyState === 1) {
        if (req.user.role === "volunteer") {
          const volunteer = await Volunteer.findById(req.user.id);
          if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
          }
          if (volunteer.status === "suspended") {
            return res.status(403).json({
              message: "Your volunteer account has been suspended.",
              reason: volunteer.suspensionReason,
            });
          }
        } else if (req.user.role === "organization") {
          const org = await Organization.findById(req.user.id);
          if (org?.status === "suspended") {
            return res.status(403).json({
              message: "Your organization account has been suspended.",
              reason: org.suspensionReason,
            });
          }
        }
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  };
};

export const requireVolunteer = requireRole("volunteer");
export const requireOrganization = requireRole("organization", "admin");
export const requireAdmin = requireRole("admin");
export const requireAuth = requireRole("volunteer", "organization", "admin");

export const protect = requireRole("volunteer", "organization");
export const verifyToken = requireRole("volunteer", "organization", "admin");
export const protectAdmin = requireRole("admin");
