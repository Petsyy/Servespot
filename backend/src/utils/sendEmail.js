// src/utils/sendEmail.js
import nodemailer from "nodemailer";

console.log("📧 ENV CHECK:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? "✔️ Loaded" : "❌ Missing",
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,            // SSL connection
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  authMethod: "LOGIN",     // 👈 force LOGIN instead of PLAIN
  tls: { rejectUnauthorized: false },
});

/**
 * Sends a styled HTML email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>?/gm, ""), // plain-text fallback
    });
    console.log("📨 Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};
