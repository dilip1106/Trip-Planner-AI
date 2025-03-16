import nodemailer from "nodemailer";

// Reusable email sending function
const sendMail = async ({ to, subject, html }) => {
  try {
    // Create a transporter with proper SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Use hostname instead of "service"
      port: process.env.EMAIL_PORT || 587, // Common SMTP ports: 587 (TLS) or 465 (SSL)
      secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `Wedge Shape <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      headers: {
        'Reply-To': 'no-reply@example.com',
      },
    });
    
    console.log("Email sent successfully:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

export default sendMail;