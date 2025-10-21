import jwt from "jsonwebtoken";
import Volunteer from "../models/Volunteer.js";
import Organization from "../models/Organization.js"; 

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role, // volunteer or organization
      };

      // ✅ Extra security: check if the user is suspended
      if (req.user.role === "volunteer") {
        const volunteer = await Volunteer.findById(req.user.id);
        if (!volunteer)
          return res.status(404).json({ message: "Volunteer not found" });

        if (volunteer.status === "suspended") {
          return res.status(403).json({
            message: "Your volunteer account has been suspended.",
            reason: volunteer.suspensionReason,
          });
        }
      }

      // (Optional) also prevent suspended organizations
      if (req.user.role === "organization") {
        const org = await Organization.findById(req.user.id);
        if (org?.status === "suspended") {
          return res.status(403).json({
            message: "Your organization account has been suspended.",
            reason: org.suspensionReason,
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email || null,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(403).json({ message: "Invalid token" });
  }
};

export const protectAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach the decoded user data to the request
    next(); // Allow the request to proceed
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

