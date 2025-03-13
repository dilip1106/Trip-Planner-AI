import nodemailer from "nodemailer";

// Reusable email sending function
const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_MAIL, // Replace with your Gmail address
        pass: process.env.SMTP_PASSWORD,       // Replace with your Gmail app password
      },
    });

    const info = await transporter.sendMail({
    from: `Wedge Shape <${process.env.SMTP_MAIL}>`, // Optional: Display a name
      to,
      subject,
      html,
      headers: {
        'Reply-To': 'no-reply@example.com', // Set a different reply-to address
      },
    });

    return { success: true, info };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default sendMail;
