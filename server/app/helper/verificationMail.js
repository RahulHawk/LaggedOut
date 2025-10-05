const crypto = require("crypto");
const transporter = require("../config/emailConfig");

const EmailVerificationLink = async (req, user) => {
  if (user.isEmailVerified) {
    return null; 
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.emailVerificationToken = token;
  user.lastVerificationEmailSentAt = new Date();
  user.emailVerificationExpires = Date.now() + 15 * 60 * 1000; 
  await user.save();

  const verifyUrl = `${process.env.APP_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;

  const emailHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;">
    <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden;">
      <tr>
        <td style="background-color:#4CAF50; padding:20px; text-align:center; color:white; font-size:24px; font-weight:bold;">
          Verify Your Email
        </td>
      </tr>
      <tr>
        <td style="padding:30px; color:#333; font-size:16px; line-height:1.6;">
          <p>Hi <strong>${user.firstName}</strong>,</p>
          <p>Thank you for signing up! Please confirm your email address by clicking the button below.</p>
          <p style="text-align:center; margin:30px 0;">
            <a href="${verifyUrl}" style="background-color:#4CAF50; color:#fff; padding:12px 25px; text-decoration:none; font-size:16px; border-radius:5px; display:inline-block;">
              Verify Email
            </a>
          </p>
          <p>This link is valid for <strong>15 minutes</strong>. If you did not request this verification, please ignore this email.</p>
        </td>
      </tr>
      <tr>
        <td style="background-color:#f4f4f4; padding:15px; text-align:center; font-size:12px; color:#888;">
          &copy; ${new Date().getFullYear()} ${process.env.APP_NAME || "Our App"}. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: `"LaggedOut" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Account - " + (process.env.APP_NAME || "Our App"),
      html: emailHTML,
    });
  } catch (err) {
    console.error("Email sending failed:", err);
  }

  return token;
};

module.exports = EmailVerificationLink;
