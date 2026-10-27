import "./loadEnv.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./src/config/db.js";
import Organization from "./src/modules/organizations/organization.model.js";
import Volunteer from "./src/modules/volunteers/volunteer.model.js";
import Opportunity from "./src/modules/opportunities/opportunity.model.js";

async function seedDatabase() {
  try {
    console.log("🌱 Connecting to database...");
    await connectDB();
    console.log(" Connected to MongoDB!");

    const defaultPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 1. SEED / UPSERT ORGANIZATION
    console.log("\n🏢 Seeding Organization account...");
    const orgData = {
      orgName: "Bayanihan Community Foundation",
      email: "organization@servespot.com",
      password: hashedPassword,
      contactPerson: "Maria Santos",
      contactNumber: "09171234567",
      region: "National Capital Region (NCR)",
      city: "City of Manila",
      province: "Metro Manila",
      barangay: "Barangay 649",
      address: "123 Bonifacio Drive, Port Area",
      orgType: "Non-Profit Organization",
      description:
        "Dedicated to empowering marginalized communities through sustainable environmental greening, education, and health initiatives across the Philippines.",
      status: "active", // Active so you can log in immediately
    };

    const organization = await Organization.findOneAndUpdate(
      { email: orgData.email },
      { $set: orgData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(` Organization ready: ${organization.orgName} (${organization.email})`);

    // 2. SEED / UPSERT VOLUNTEER
    console.log("\n🙋 Seeding Volunteer account...");
    const volData = {
      firstName: "Juan",
      middleName: "Protacio",
      lastName: "Dela Cruz",
      fullName: "Juan Protacio Dela Cruz",
      email: "volunteer@servespot.com",
      password: hashedPassword,
      birthdate: new Date("1998-06-12"),
      gender: "Male",
      contactNumber: "09181234567",
      region: "National Capital Region (NCR)",
      city: "Quezon City",
      province: "Metro Manila",
      barangay: "Batasan Hills",
      address: "Block 4 Lot 12 Commonwealth Ave",
      skills: ["Environment", "Teaching", "First Aid", "Animal Care", "Logistics"],
      interests: ["Community Outreach", "Youth Mentoring", "Wildlife", "Tree Planting"],
      availability: ["Weekends", "Mornings"],
      bio: "Passionate community volunteer enthusiastic about environmental protection, disaster preparedness, and youth education.",
      points: 75,
      completedTasks: 3,
      status: "active",
    };

    const volunteer = await Volunteer.findOneAndUpdate(
      { email: volData.email },
      { $set: volData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(` Volunteer ready: ${volunteer.fullName} (${volunteer.email})`);

    // 3. SEED OPPORTUNITIES (Using images in public/images/opportunities/)
    console.log("\n📋 Seeding Opportunities with public/images/opportunities...");

    const opportunities = [
      {
        title: "Metro Green: Urban Tree Planting & Watershed Rehabilitation",
        description:
          "Join our team in planting 200 native tree saplings to restore green spaces, reduce urban heat, and combat carbon emissions in the city. Saplings, gloves, and tools will be provided.",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        duration: "4 hours (8:00 AM - 12:00 PM)",
        location: "Arroceros Forest Park, Manila",
        skills: ["Environment", "Tree Planting", "Physical Labor"],
        volunteersNeeded: 20,
        points: 25,
        status: "Open",
        fileUrl: "/images/opportunities/tree-planting.jpg",
        organization: organization._id,
      },
      {
        title: "Barangay Health Outreach & Community Medical Mission",
        description:
          "Provide free medical checkups, vital signs monitoring, medicine distribution, and basic health consultations for underserved families and elderly residents.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        duration: "5 hours (7:30 AM - 12:30 PM)",
        location: "Barangay Covered Court, Baseco, Manila",
        skills: ["Healthcare", "First Aid", "Patient Intake"],
        volunteersNeeded: 15,
        points: 30,
        status: "Open",
        fileUrl: "/images/opportunities/medical-mission.jpg",
        organization: organization._id,
      },
      {
        title: "Bright Futures: Weekend Reading & Math Tutoring Outreach",
        description:
          "Mentor and tutor elementary school children in reading comprehension, basic mathematics, and creative storytelling through interactive learning games.",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: "3 hours (9:00 AM - 12:00 PM)",
        location: "Tondo Community Learning Center, Manila",
        skills: ["Teaching", "Mentoring", "Childcare"],
        volunteersNeeded: 10,
        points: 20,
        status: "Open",
        fileUrl: "/images/opportunities/tutoring-children.jpg",
        organization: organization._id,
      },
      {
        title: "Paws & Hope: Animal Shelter Rescue Care & Grooming Day",
        description:
          "Help our rescue dogs and cats feel loved! Volunteers will assist with shelter sanitation, feeding routines, bath time, and walking rescue dogs in need of homes.",
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        duration: "4 hours (9:00 AM - 1:00 PM)",
        location: "Animal Rescue & Adoption Center, Quezon City",
        skills: ["Animal Care", "Feeding", "Shelter Cleaning"],
        volunteersNeeded: 8,
        points: 20,
        status: "Open",
        fileUrl: "/images/opportunities/animal-shelter.jpg",
        organization: organization._id,
      },
      {
        title: "Emergency Monsoon Relief Pack Assembly & Distribution",
        description:
          "Mobilizing volunteers to pack relief boxes with canned goods, rice, hygiene items, and potable water for communities affected by seasonal heavy rains.",
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        duration: "6 hours (8:00 AM - 2:00 PM)",
        location: "ServeSpot Disaster Operations Center, Pasig City",
        skills: ["Logistics", "Packing", "Community Outreach"],
        volunteersNeeded: 25,
        points: 35,
        status: "Open",
        fileUrl: "/images/opportunities/disaster-relief.jpg",
        organization: organization._id,
      },
    ];

    for (const opp of opportunities) {
      const created = await Opportunity.findOneAndUpdate(
        { title: opp.title, organization: organization._id },
        { $set: opp },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(` Opportunity ready: ${created.title}`);
      console.log(`   Image URL: ${created.fileUrl}`);
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log("=========================================");
    console.log("ORGANIZATION CREDENTIALS:");
    console.log(`  Email:    ${orgData.email}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log("-----------------------------------------");
    console.log("VOLUNTEER CREDENTIALS:");
    console.log(`  Email:    ${volData.email}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log("=========================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedDatabase();
