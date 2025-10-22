import Volunteer from "../models/Volunteer.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// VOLUNTEER SIGNUP
export const registerVolunteer = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if email already exists
    const existing = await Volunteer.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create volunteer
    const volunteer = new Volunteer({ ...req.body, password: hashedPassword });
    await volunteer.save();

    //  Generate token for auto-login
    const token = generateToken(volunteer._id, "volunteer");

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
    res.status(500).json({ message: "Error registering volunteer", error });
  }
};

// ORGANIZATION SIGNUP
export const registerOrganization = async (req, res) => {
  try {
    const { orgName, email, password } = req.body;

    // Check if email already exists
    const existing = await Organization.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Hash provided or dummy password
    const hashedPassword = await bcrypt.hash(password || "temporary123", 10);

    // handle uploaded document
    const documentPath = req.file ? `/uploads/${req.file.filename}` : null;

    const organization = new Organization({
      ...req.body,
      password: hashedPassword,
      document: documentPath,
      status: "pending",
    });

    await organization.save();

    // Generate token
    const token = generateToken(organization._id, "organization");

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

    const token = generateToken(volunteer._id, "volunteer");

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
    res.status(500).json({ message: "Error logging in volunteer", error });
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

    const token = generateToken(organization._id, "organization");

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
    res.status(500).json({ message: "Error logging in organization", error });
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
    const user = await Model.findOne({ email });
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

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ===============================
// STEP 3: RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { email, role, newPassword } = req.body;
    const Model = role === "volunteer" ? Volunteer : Organization;

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};