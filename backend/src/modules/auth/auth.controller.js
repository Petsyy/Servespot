import Volunteer from "../volunteers/volunteer.model.js";
import Organization from "../organizations/organization.model.js";
import Admin from "../admin/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sendEmail } from "../../utils/sendEmail.js";
import { sendNotification } from "../../utils/sendNotification.js";
import { uploadFileToCloudinary } from "../../utils/cloudinaryUpload.js";
import { clearAuthCookies, setAuthCookie } from "../../utils/authCookies.js";

const generateToken = (id, role, email = null) => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const isDatabaseUnavailableError = (error) => {
  const name = error?.name || "";
  return (
    name === "MongooseServerSelectionError" ||
    name === "MongoNetworkError" ||
    name === "MongoServerSelectionError"
  );
};

const parseCookies = (req) => {
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

const normalizeEmail = (val) => (typeof val === "string" ? val.trim().toLowerCase() : "");

// VOLUNTEER SIGNUP
export const registerVolunteer = async (req, res) => {
  try {
    let { firstName, middleName = "", lastName, fullName, email, password, birthdate } = req.body;


    // Support firstName + lastName or split from fullName
    if (!firstName && fullName) {
      const parts = String(fullName).trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    if (!firstName || !String(firstName).trim()) {
      return res.status(400).json({ message: "First name is required" });
    }

    if (!lastName || !String(lastName).trim()) {
      return res.status(400).json({ message: "Last name is required" });
    }

    firstName = String(firstName).trim();
    middleName = String(middleName || "").trim();
    lastName = String(lastName).trim();
    const computedFullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Validate birthdate and age (18+)
    if (!birthdate) {
      return res.status(400).json({ message: "Birthdate is required" });
    }

    const parsedBirthdate = new Date(birthdate);
    if (Number.isNaN(parsedBirthdate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid birthdate. Please provide a valid date." });
    }

    const today = new Date();
    let age = today.getFullYear() - parsedBirthdate.getFullYear();
    const monthDiff = today.getMonth() - parsedBirthdate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < parsedBirthdate.getDate())
    ) {
      age -= 1;
    }

    if (age < 18) {
      return res.status(400).json({
        message:
          "You must be at least 18 years old to create a volunteer account.",
      });
    }

    // Check if email already exists
    const existing = await Volunteer.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create volunteer
    const volunteer = new Volunteer({
      ...req.body,
      email: normalizedEmail,
      // Ensure we store a proper Date instance for birthdate
      birthdate: parsedBirthdate,
      password: hashedPassword,
    });
    await volunteer.save();

    // Notify admins about new volunteer registration
    try {
      const Admin = (await import("../admin/admin.model.js")).default;
      const admins = await Admin.find({});
      
      // Filter to active admins, fallback to all admins if none are active
      const activeAdmins = admins.filter(admin => admin.status === "active");
      const adminsToNotify = activeAdmins.length > 0 ? activeAdmins : admins;
      
      for (const admin of adminsToNotify) {
        await sendNotification({
          userId: admin._id,
          userModel: "Admin",
          title: "New volunteer signup",
          message: `New volunteer ${volunteer.fullName} joined ServeSpot.`,
          type: "volunteer_signup",
          channel: "inApp",
          link: "/admin/volunteers",
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify admins of new volunteer:", notifErr);
      // Don't fail the main request if notification fails
    }

    //  Generate token for auto-login
    const token = generateToken(volunteer._id, "volunteer", volunteer.email);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "Volunteer registered successfully",
      token,
      user: {
        id: volunteer._id,
        fullName: volunteer.fullName,
        email: volunteer.email,
        role: "volunteer",
      },
    });
  } catch (error) {
    console.error("Volunteer registration failed:", error);
    res.status(500).json({
      message: "Error registering volunteer",
      error: error.message || String(error),
    });
  }
};

// ORGANIZATION SIGNUP
export const registerOrganization = async (req, res) => {
  try {
    const { orgName, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password is required and must be at least 8 characters long",
      });
    }

    // Check if email already exists
    const existing = await Organization.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Hash provided or dummy password
    const hashedPassword = await bcrypt.hash(password, 10);

    const uploadedDocument = req.file
      ? await uploadFileToCloudinary(
          req.file,
          "servespot/organization-documents"
        )
      : null;

    const organization = new Organization({
      ...req.body,
      email: normalizedEmail,
      password: hashedPassword,
      document: uploadedDocument?.url || null,
      documentPublicId: uploadedDocument?.publicId || null,
      documentResourceType: uploadedDocument?.resourceType || null,
      status: "pending",
    });

    await organization.save();

    // Notify admins about new organization registration
    try {
      const Admin = (await import("../admin/admin.model.js")).default;
      const admins = await Admin.find({});
      
      // Filter to active admins, fallback to all admins if none are active
      const activeAdmins = admins.filter(admin => admin.status === "active");
      const adminsToNotify = activeAdmins.length > 0 ? activeAdmins : admins;
      
      for (const admin of adminsToNotify) {
        await sendNotification({
          userId: admin._id,
          userModel: "Admin",
          title: "New organization signup",
          message: `New organization ${organization.orgName} registered and is awaiting approval.`,
          type: "organization_signup",
          channel: "inApp",
          link: "/admin/organizations",
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify admins of new organization:", notifErr);
      // Don't fail the main request if notification fails
    }

    // Generate token
    const token = generateToken(organization._id, "organization", organization.email);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "Organization registered successfully",
      token,
      orgId: organization._id,
      user: {
        id: organization._id,
        orgName: organization.orgName,
        email: organization.email,
        role: "organization",
      },
    });
  } catch (error) {
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

    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer)
      return res.status(400).json({ message: "Invalid credentials" });

    if (volunteer.status === "suspended") {
      return res.status(403).json({
        message: "Your volunteer account has been suspended.",
        reason: volunteer.suspensionReason,
      });
    }

    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(volunteer._id, "volunteer", volunteer.email);
    setAuthCookie(res, token);

    res.status(200).json({
      token,
      user: {
        id: volunteer._id,
        fullName: volunteer.fullName,
        email: volunteer.email,
        role: "volunteer",
      },
    });
  } catch (error) {
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

    const organization = await Organization.findOne({ email });
    if (!organization)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, organization.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (organization.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended.",
        reason: organization.suspensionReason,
      });
    }

    const token = generateToken(organization._id, "organization", organization.email);
    setAuthCookie(res, token);

    res.status(200).json({
      token,
      orgId: organization._id,
      user: {
        id: organization._id,
        orgName: organization.orgName,
        email: organization.email,
        role: "organization",
      },
    });
  } catch (error) {
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

// ===============================
// STEP 1: SEND OTP
// ===============================
export const sendOTP = async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log("Received request for OTP:", email, role);

    const Model = role === "volunteer" ? Volunteer : Organization;
    const user = await Model.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otpCode = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("OTP generated:", otp);

    // Send using centralized email utility
    await sendEmail({
      to: email,
      subject: "ServeSpot OTP Code for Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 24px;">
          <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2E8B57; margin: 0;">ServeSpot</h1>
              <p style="color: #555; font-size: 14px;">Volunteer & Organization Portal</p>
            </div>
            <hr style="border: none; border-top: 2px solid #e0e0e0; margin: 16px 0;" />
            <h2 style="color: #333; text-align: center; font-size: 18px; margin-bottom: 8px;">
              Password Reset OTP
            </h2>
            <p style="color: #555; text-align: center; font-size: 14px;">
              Hello, we received a request to reset your ServeSpot account password.<br/>
              Please use the OTP code below to proceed:
            </p>
            <div style="text-align: center; margin: 25px 0;">
              <div style="
                display: inline-block;
                background: #2E8B57;
                color: white;
                padding: 15px 40px;
                font-size: 26px;
                letter-spacing: 5px;
                border-radius: 8px;
                font-weight: bold;
              ">
                ${otp}
              </div>
            </div>
            <p style="color: #777; text-align: center; font-size: 13px;">
              This code will expire in <strong>5 minutes</strong> for your security.<br/>
              If you did not request this, please ignore this message.
            </p>
            <hr style="border: none; border-top: 2px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} ServeSpot. All rights reserved.<br/>
              This is an automated email — please do not reply.
            </p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ OTP send error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ===============================
// STEP 2: VERIFY OTP
// ===============================
export const verifyOTP = async (req, res) => {
  try {
    const { email, role, otp } = req.body;
    const Model = role === "volunteer" ? Volunteer : Organization;
    const user = await Model.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });


    if (!user.otpCode) return res.status(400).json({ message: "No OTP found" });
    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });
    if (user.otpCode != otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.otpCode = null;
    user.otpExpire = null;
    await user.save();

    const resetToken = jwt.sign(
      { id: user._id, role, purpose: "pwd_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.status(200).json({ message: "OTP verified successfully", resetToken });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ===============================
// STEP 3: RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { email, role, newPassword, resetToken } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!resetToken) {
      return res.status(401).json({ message: "Reset token is required. Please verify OTP first." });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired reset token." });
    }

    if (decoded.purpose !== "pwd_reset" || decoded.role !== role) {
      return res.status(401).json({ message: "Invalid reset token." });
    }
    const Model = role === "volunteer" ? Volunteer : Organization;

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });



    if (user._id.toString() !== decoded.id) {
      return res.status(403).json({ message: "Reset token does not match user account." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export const logoutSession = (_req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
};

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
        // Expired or invalid admin token, fall back to checking authToken
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

export const checkEmailAvailability = async (req, res) => {
  try {
    const rawEmail = req.query.email;
    const email = normalizeEmail(rawEmail);
    if (!email) {
      return res.status(400).json({ available: false, message: "Valid email is required" });
    }

    const [vol, org, adm] = await Promise.all([
      Volunteer.findOne({ email }).select("_id").lean(),
      Organization.findOne({ email }).select("_id").lean(),
      Admin.findOne({ email }).select("_id").lean(),
    ]);

    const exists = Boolean(vol || org || adm);
    return res.status(200).json({ available: !exists });
  } catch (err) {
    if (isDatabaseUnavailableError(err)) {
      return res.status(503).json({ available: false, message: "Database temporarily unavailable" });
    }
    console.error("checkEmailAvailability error:", err);
    return res.status(500).json({ available: false, message: "Failed to check email availability" });
  }
};
