const transporter = require("../config/emailConfig");

const sendDevRequestReceivedEmail = async (email, firstName) => {
  const emailHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Developer Request Received</title>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;">
    <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden;">
      <tr>
        <td style="background-color:#007BFF; padding:20px; text-align:center; color:white; font-size:24px; font-weight:bold;">
          Request Received
        </td>
      </tr>
      <tr>
        <td style="padding:30px; color:#333; font-size:16px; line-height:1.6;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Thank you for your interest in becoming a developer on our platform. We have successfully received your request.</p>
          <p>Your request is now pending review by our admin team. You will receive another email with a unique registration link once your request has been approved.</p>
          <p>Thank you for your patience.</p>
        </td>
      </tr>
      <tr>
        <td style="background-color:#f4f4f4; padding:15px; text-align:center; font-size:12px; color:#888;">
          &copy; ${new Date().getFullYear()} ${process.env.APP_NAME || "LaggedOut"}. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: `"LaggedOut" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Developer Access Request Received - " + (process.env.APP_NAME || "LaggedOut"),
      html: emailHTML,
    });
  } catch (err) {
    console.error("Developer request email sending failed:", err);
    // It's good practice to throw the error so the controller knows something went wrong
    throw new Error("Failed to send developer request confirmation email.");
  }
};

module.exports = { sendDevRequestReceivedEmail };