// src/utils/sendEmail.js
import nodemailer from "nodemailer";

// Configure Gmail SMTP using App Password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a styled HTML email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content of the email
 * @param {string} [options.text] - Optional plain text fallback
 * @param {Array}  [options.attachments] - Optional array of attachments
 */
export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    // Build HTML wrapper for consistent branding
    const wrappedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            background: #f8fafc;
            color: #1e293b;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 24px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            padding: 20px 24px;
          }
          h1 {
            font-size: 18px;
            color: #0f172a;
            margin-bottom: 8px;
          }
          p {
            margin-bottom: 12px;
            line-height: 1.6;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
          }
          .btn {
            display: inline-block;
            background: #2563eb;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${subject}</h1>
          ${html}
          <div class="footer">
            <p>— ServeSpot Support Team</p>
            <p>Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: wrappedHtml,
      text:
        text ||
        html
          .replace(/<[^>]*>?/gm, " ")
          .replace(/\s+/g, " ")
          .trim(), // plain text fallback
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📨 Email sent successfully to ${to}:`, info.response);

    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    return null; // Prevents breaking other logic (e.g. sendNotification)
  }
};

/**
 * Send a common notification-style email (shortcut)
 * Adds a call-to-action button that links to ServeSpot.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.title - Title displayed inside the email
 * @param {string} options.message - Main body content
 * @param {string} [options.link] - Optional link for CTA
 * @param {string} [options.linkLabel] - Text for the CTA button
 */
export const sendTemplatedEmail = async ({
  to,
  title,
  message,
  link,
  linkLabel = "Open in ServeSpot",
}) => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

  const html = `
    <p>${message}</p>
    ${
      link
        ? `<p><a href="${CLIENT_URL}${link}" class="btn">${linkLabel}</a></p>`
        : ""
    }
  `;

  return await sendEmail({
    to,
    subject: title,
    html,
  });
};
