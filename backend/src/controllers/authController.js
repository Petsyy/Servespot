import Volunteer from "../models/Volunteer.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerVolunteer = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if exists
    const existing = await Volunteer.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const volunteer = new Volunteer({ ...req.body, password: hashedPassword });
    await volunteer.save();

    res.status(201).json({ message: "Volunteer registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering volunteer", error });
  }
};

export const registerOrganization = async (req, res) => {
  try {
    const { orgName, email, password } = req.body;

    // Check if exists
    const existing = await Organization.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = new Organization({ ...req.body, password: hashedPassword });
    await organization.save();

    res.status(201).json({ message: "Organization registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering organization", error });
  }
};

export const loginVolunteer = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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

export const loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;

    const organization = await Organization.findOne({ email });
    if (!organization) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, organization.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(organization._id, "organization");

    res.status(200).json({
      token,
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