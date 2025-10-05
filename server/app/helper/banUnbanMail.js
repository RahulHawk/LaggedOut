const transporter = require("../config/emailConfig");

async function sendBanUnbanMail(user, action, reason) {
    try {
        let subject, html;

        if (action === "ban") {
            subject = "⚠️ Your Account Has Been Banned";
            // prettier-ignore
            html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
</style>
</head>
<body style="background: linear-gradient(to right, #232526, #414345); padding: 20px;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
    <div style="background-color: #1a1a1a; padding: 25px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #f5f5f5; letter-spacing: 1px;">LaggedOut Admin</h1>
    </div>
    <div style="padding: 40px; background-color: #f9f9f9;">
      <h2 style="color: #d9534f; font-size: 22px; margin-top: 0;">Hello ${user.firstName},</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        We regret to inform you that your account has been <strong style="color: #d9534f; font-weight: bold;">banned</strong> by our admin team.
      </p>
      <div style="background-color: #ffebee; border-left: 4px solid #d9534f; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px; color: #333;"><strong>Reason:</strong> ${reason}</p>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        If you believe this is a mistake or wish to appeal this decision, please contact our support team.
      </p>
      <a href="mailto:support@yourgamestore.com" style="display: inline-block; margin-top: 25px; padding: 12px 25px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(217, 83, 79, 0.3);">Contact Support</a>
    </div>
    <div style="background-color: #333; color: #aaaaaa; padding: 20px; text-align: center; font-size: 14px;">
      &copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
        } else if (action === "unban") {
            subject = "✅ Your Account Has Been Reinstated";
            // prettier-ignore
            html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
</style>
</head>
<body style="background: linear-gradient(to right, #e0f2f1, #e8f5e9); padding: 20px;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
    <div style="background-color: #1a1a1a; padding: 25px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #f5f5f5; letter-spacing: 1px;">LaggedOut Admin</h1>
    </div>
    <div style="padding: 40px; background-color: #f9f9f9;">
      <h2 style="color: #5cb85c; font-size: 22px; margin-top: 0;">Hello ${user.firstName},</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        Good news! Your account has been <strong style="color: #5cb85c; font-weight: bold;">unbanned</strong> and fully reinstated.
      </p>
      <div style="background-color: #e8f5e9; border-left: 4px solid #5cb85c; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px; color: #333;"><strong>Reason for Reinstatement:</strong> ${reason}</p>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        You can now log in and get back to the action. Welcome back!
      </p>
      <a href="https://yourgamestore.com/login" style="display: inline-block; margin-top: 25px; padding: 12px 25px; background-color: #5cb85c; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(92, 184, 92, 0.3);">Login Now</a>
    </div>
    <div style="background-color: #333; color: #aaaaaa; padding: 20px; text-align: center; font-size: 14px;">
      &copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
        } else {
            throw new Error("Invalid action for email");
        }

        await transporter.sendMail({
            from: `"LaggedOut Admin" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject,
            html
        });

        console.log(`Ban/Unban email sent to ${user.email} (${action})`);
    } catch (error) {
        console.error("Error sending ban/unban email:", error);
    }
}

module.exports = { sendBanUnbanMail };