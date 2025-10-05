const crypto = require("crypto");
const transporter = require("../config/emailConfig");

const ForgotPasswordMail = async (req, user) => {
  // Generate password reset token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"LaggedOut" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <div style="background-color: #4CAF50; color: white; text-align: center; padding: 20px;">
            <h1 style="margin: 0; font-size: 22px;">Password Reset</h1>
          </div>
          
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px;">Hello <strong>${user.firstName}</strong>,</p>
            <p style="font-size: 15px;">We received a request to reset your password. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="font-size: 14px; color: #777;">
              This link will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background-color: #333; color: #aaaaaa; padding: 20px; text-align: center; font-size: 14px;">
      &copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
    </div>
        </div>
      </div>
    `
  });

  return token;
};

module.exports = ForgotPasswordMail;
