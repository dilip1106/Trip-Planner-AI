import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE
  } from "./emailTemplates.js";

import sendMail from "./email.config.js";
// Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
    const subject = "Verify Your Email";
    const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
  
    return sendMail({ to: email, subject, html });
  };
  
//   Welcome Email
  export const sendWelcomeEmail = async (email, name) => {
    const subject = "Welcome to Our Service!";
    const html = WELCOME_EMAIL_TEMPLATE.replace("{name}", name);
  
    return sendMail({ to: email, subject, html });
  };
  
  // Password Reset Request Email
  export const sendPasswordResetEmail = async (email, resetURL) => {
    const subject = "Password Reset Request";
    const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);
  
    return sendMail({ to: email, subject, html });
  };
  
  // Password Reset Success Email
  export const sendResetSuccessEmail = async (email) => {
    const subject = "Password Reset Successful";
    const html = PASSWORD_RESET_SUCCESS_TEMPLATE;
  
    return sendMail({ to: email, subject, html });
  };
  