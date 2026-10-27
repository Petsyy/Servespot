import Volunteer from "../volunteers/volunteer.model.js";
import Organization from "../organizations/organization.model.js";
import Admin from "../admin/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail.js";
import { sendNotification } from "../../utils/sendNotification.js";
import { uploadFileToCloudinary } from "../../utils/cloudinaryUpload.js";

export const normalizeEmail = (val) =>
  typeof val === "string" ? val.trim().toLowerCase() : "";

export const isDatabaseUnavailableError = (error) => {
  const name = error?.name || "";
  const message = error?.message || "";
  return (
    name === "MongooseServerSelectionError" ||
    name === "MongoNetworkError" ||
    name === "MongoServerSelectionError" ||
    name === "MongooseError" ||
    message.includes("buffering timed out") ||
    message.includes("topology was destroyed") ||
    message.includes("Server selection timed out")
  );
};

export class AuthService {
  constructor({
    volunteers = Volunteer,
    organizations = Organization,
    admins = Admin,
  } = {}) {
    this.volunteers = volunteers;
    this.organizations = organizations;
    this.admins = admins;
  }

  generateToken(id, role, email = null) {
    return jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  async checkEmailAvailability(rawEmail) {
    const email = normalizeEmail(rawEmail);
    if (!email) {
      const err = new Error("Valid email is required");
      err.status = 400;
      throw err;
    }

    const [vol, org, adm] = await Promise.all([
      this.volunteers.findOne({ email }).lean(),
      this.organizations.findOne({ email }).lean(),
      this.admins.findOne({ email }).lean(),
    ]);

    const isTaken = Boolean(vol || org || adm);
    return {
      available: !isTaken,
      message: isTaken ? "Email is already registered" : "Email is available",
    };
  }

  async registerVolunteer(body) {
    let { firstName, middleName = "", lastName, fullName, email, password, birthdate } = body;

    if (!firstName && fullName) {
      const parts = String(fullName).trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    if (!firstName || !String(firstName).trim()) {
      const err = new Error("First name is required");
      err.status = 400;
      throw err;
    }

    if (!lastName || !String(lastName).trim()) {
      const err = new Error("Last name is required");
      err.status = 400;
      throw err;
    }

    firstName = String(firstName).trim();
    middleName = String(middleName || "").trim();
    lastName = String(lastName).trim();
    const computedFullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      const err = new Error("Email is required");
      err.status = 400;
      throw err;
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      const err = new Error("Password must be at least 8 characters long");
      err.status = 400;
      throw err;
    }

    if (!birthdate) {
      const err = new Error("Birthdate is required");
      err.status = 400;
      throw err;
    }

    const parsedBirthdate = new Date(birthdate);
    if (Number.isNaN(parsedBirthdate.getTime())) {
      const err = new Error("Invalid birthdate. Please provide a valid date.");
      err.status = 400;
      throw err;
    }

    const today = new Date();
    let age = today.getFullYear() - parsedBirthdate.getFullYear();
    const monthDiff = today.getMonth() - parsedBirthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedBirthdate.getDate())) {
      age -= 1;
    }
    if (age < 18) {
      const err = new Error("You must be at least 18 years old to register as a volunteer.");
      err.status = 400;
      throw err;
    }

    const existingVolunteer = await this.volunteers.findOne({ email: normalizedEmail });
    if (existingVolunteer) {
      const err = new Error("Email already registered");
      err.status = 400;
      throw err;
    }

    const existingOrg = await this.organizations.findOne({ email: normalizedEmail });
    if (existingOrg) {
      const err = new Error("Email is already used by an organization");
      err.status = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let normalizedSkills = body.skills;
    if (typeof normalizedSkills === "string") {
      normalizedSkills = normalizedSkills.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (!Array.isArray(normalizedSkills)) {
      normalizedSkills = [];
    }

    let normalizedInterests = body.interests;
    if (typeof normalizedInterests === "string") {
      normalizedInterests = normalizedInterests.split(",").map((i) => i.trim()).filter(Boolean);
    } else if (!Array.isArray(normalizedInterests)) {
      normalizedInterests = [];
    }

    const volunteer = new Volunteer({
      firstName,
      middleName,
      lastName,
      fullName: computedFullName,
      email: normalizedEmail,
      password: hashedPassword,
      birthdate: parsedBirthdate,
      gender: body.gender,
      contactNumber: body.contactNumber,
      region: body.region,
      province: body.province,
      city: body.city,
      barangay: body.barangay,
      address: body.address,
      skills: normalizedSkills,
      interests: normalizedInterests,
      availability: body.availability,
      bio: body.bio,
      status: "active",
    });

    await volunteer.save();

    const token = this.generateToken(volunteer._id, "volunteer", volunteer.email);
    return {
      token,
      volunteerId: volunteer._id,
      user: {
        id: volunteer._id,
        fullName: volunteer.fullName,
        email: volunteer.email,
        role: "volunteer",
      },
    };
  }

  async registerOrganization({ body, file }) {
    const { orgName, email, password, orgType, contactPerson, contactNumber } = body;
    const normalizedEmail = normalizeEmail(email);

    if (!orgName || !String(orgName).trim()) {
      const err = new Error("Organization name is required");
      err.status = 400;
      throw err;
    }

    if (!normalizedEmail) {
      const err = new Error("Email is required");
      err.status = 400;
      throw err;
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      const err = new Error("Password must be at least 8 characters long");
      err.status = 400;
      throw err;
    }

    const existingOrg = await this.organizations.findOne({ email: normalizedEmail });
    if (existingOrg) {
      const err = new Error("Email already registered");
      err.status = 400;
      throw err;
    }

    const existingVolunteer = await this.volunteers.findOne({ email: normalizedEmail });
    if (existingVolunteer) {
      const err = new Error("Email is already used by a volunteer");
      err.status = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const uploadedDocument = file
      ? await uploadFileToCloudinary(file, "servespot/organization-documents")
      : null;

    const organization = new Organization({
      ...body,
      email: normalizedEmail,
      password: hashedPassword,
      document: uploadedDocument?.url || null,
      documentPublicId: uploadedDocument?.publicId || null,
      documentResourceType: uploadedDocument?.resourceType || null,
      status: "pending",
    });

    await organization.save();

    // Notify admins about new organization registration
    process.nextTick(async () => {
      try {
        const admins = await this.admins.find({});
        const activeAdmins = admins.filter((admin) => admin.status === "active");
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
      }
    });

    const token = this.generateToken(organization._id, "organization", organization.email);
    return {
      token,
      orgId: organization._id,
      user: {
        id: organization._id,
        orgName: organization.orgName,
        email: organization.email,
        role: "organization",
      },
    };
  }

  async loginVolunteer({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    const volunteer = await this.volunteers.findOne({ email: normalizedEmail });
    if (!volunteer) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    if (volunteer.status === "suspended") {
      const err = new Error("Your volunteer account has been suspended.");
      err.status = 403;
      err.reason = volunteer.suspensionReason;
      throw err;
    }

    const isMatch = await bcrypt.compare(String(password), volunteer.password || "");
    if (!isMatch) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    const token = this.generateToken(volunteer._id, "volunteer", volunteer.email);
    return {
      token,
      user: {
        id: volunteer._id,
        fullName: volunteer.fullName,
        email: volunteer.email,
        role: "volunteer",
      },
    };
  }

  async loginOrganization({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    const organization = await this.organizations.findOne({ email: normalizedEmail });
    if (!organization) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    const isMatch = await bcrypt.compare(String(password), organization.password || "");
    if (!isMatch) {
      const err = new Error("Invalid credentials");
      err.status = 400;
      throw err;
    }

    if (organization.status === "suspended") {
      const err = new Error("Your account has been suspended.");
      err.status = 403;
      err.reason = organization.suspensionReason;
      throw err;
    }

    const token = this.generateToken(organization._id, "organization", organization.email);
    return {
      token,
      orgId: organization._id,
      user: {
        id: organization._id,
        orgName: organization.orgName,
        email: organization.email,
        role: "organization",
      },
    };
  }

  async sendOTP({ email, role }) {
    const normalizedEmail = normalizeEmail(email);
    const Model = role === "volunteer" ? this.volunteers : this.organizations;
    const user = await Model.findOne({ email: normalizedEmail });

    if (!user) {
      const err = new Error("Email not found");
      err.status = 404;
      throw err;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otpCode = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

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

    return { message: "OTP sent successfully" };
  }

  async verifyOTP({ email, role, otp }) {
    const normalizedEmail = normalizeEmail(email);
    const Model = role === "volunteer" ? this.volunteers : this.organizations;
    const user = await Model.findOne({ email: normalizedEmail });

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    if (!user.otpCode) {
      const err = new Error("No OTP found");
      err.status = 400;
      throw err;
    }

    if (user.otpExpire < Date.now()) {
      const err = new Error("OTP expired");
      err.status = 400;
      throw err;
    }

    if (String(user.otpCode) !== String(otp)) {
      const err = new Error("Invalid OTP");
      err.status = 400;
      throw err;
    }

    user.otpCode = null;
    user.otpExpire = null;
    await user.save();

    const resetToken = jwt.sign(
      { id: user._id, role, purpose: "pwd_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return { resetToken };
  }

  async resetPassword({ email, role, newPassword, resetToken }) {
    if (!resetToken) {
      const err = new Error("Reset token is required. Please verify OTP first.");
      err.status = 401;
      throw err;
    }

    if (!newPassword || newPassword.length < 8) {
      const err = new Error("Password must be at least 8 characters long.");
      err.status = 400;
      throw err;
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      const err = new Error("Invalid or expired reset token.");
      err.status = 401;
      throw err;
    }

    if (decoded.purpose !== "pwd_reset" || decoded.role !== role) {
      const err = new Error("Invalid reset token.");
      err.status = 401;
      throw err;
    }

    const normalizedEmail = normalizeEmail(email);
    const Model = role === "volunteer" ? this.volunteers : this.organizations;
    const user = await Model.findOne({ email: normalizedEmail });

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    if (user._id.toString() !== decoded.id) {
      const err = new Error("Reset token does not match user account.");
      err.status = 403;
      throw err;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return { message: "Password reset successful" };
  }
}

export const authService = new AuthService();
