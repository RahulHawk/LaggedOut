const transporter = require("../config/emailConfig");

async function sendDevRegisterEmail(toEmail, firstName, link) {
    // FIX: Updated HTML template with a professional design
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Developer Registration Link</title>
    </head>
    <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;">
      <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
          <td style="background-color:#4CAF50; padding:20px; text-align:center; color:white; font-size:24px; font-weight:bold;">
            You're Approved!
          </td>
        </tr>
        <tr>
          <td style="padding:30px; color:#333; font-size:16px; line-height:1.6;">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Great news! Your request to become a developer on LaggedOut has been approved.</p>
            <p>Please click the button below to complete your registration. This is a unique link created just for you.</p>
            <p style="text-align:center; margin:30px 0;">
              <a href="${link}" target="_blank" style="background-color:#4CAF50; color:#fff; padding:12px 25px; text-decoration:none; font-size:16px; border-radius:5px; display:inline-block;">
                Complete Developer Registration
              </a>
            </p>
            <p>If you did not request this, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f4f4f4; padding:15px; text-align:center; font-size:12px; color:#888;">
            &copy; ${new Date().getFullYear()} LaggedOut. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"LaggedOut" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your Developer Registration Link is Ready",
        html: emailHTML
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Developer approval email sent to ${toEmail}`);
    } catch (error) {
        console.error("Failed to send developer approval email:", error);
        throw new Error("Failed to send email.");
    }
}

module.exports = { sendDevRegisterEmail };