const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: String(process.env.EMAIL_SECURE || "false") === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailer error:", error);
  } else {
    console.log("✅ Mailer SMTP connected");
    console.log("📧 Mailer user:", process.env.EMAIL_USER);
  }
});

module.exports = transporter;