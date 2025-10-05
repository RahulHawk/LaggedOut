const transporter = require("../config/emailConfig");
const Purchase = require("../model/purchaseModel");
const Game = require("../model/gameModel");

/**
 * Send refund confirmation email
 * @param {string} purchaseId - ID of the Purchase document
 */
const sendRefundEmail = async (purchaseId) => {
    try {
        const purchase = await Purchase.findById(purchaseId)
            .populate("user")
            .populate("game")
            .exec();

        if (!purchase) return console.error("Purchase not found");

        const { user, game, edition: purchasedEditionName, dlc: purchasedDlcId, pricePaid, transactionId } = purchase;

        // Edition
        let editionObj = game.editions.find(e => e.name === purchasedEditionName);
        if (!editionObj && purchasedEditionName === "Standard Edition") {
            editionObj = { name: "Standard Edition", coverImage: game.coverImage };
        }

        // DLC
        let dlcObj = null;
        if (purchasedDlcId) {
            dlcObj = game.dlcs.find(d => d._id.toString() === purchasedDlcId.toString());
        }

        const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px; overflow:hidden;">
            <div style="background:#d9534f; padding:20px; color:#fff; text-align:center;">
                <h2>Your refund has been processed</h2>
            </div>
            <div style="padding:20px;">
                <p>Hi ${user.firstName},</p>
                <p>We have successfully processed a refund for the following purchase:</p>
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${editionObj.coverImage || game.coverImage}" alt="${game.title}" style="width:120px; height:auto; border-radius:5px;"/>
                    <div>
                        <h3 style="margin:0;">${game.title}</h3>
                        <span style="background:#f0f0f0; padding:3px 8px; border-radius:4px; font-size:12px;">${editionObj.name}</span>
                        ${dlcObj ? `<p style="margin:5px 0; font-size:13px;">DLC: <b>${dlcObj.title}</b></p>` : ""}
                        <p style="margin:5px 0;">Refunded Amount: <b>₹${pricePaid}</b></p>
                        <p style="margin:0;">Original Transaction ID: <b>${transactionId}</b></p>
                    </div>
                </div>
                <a href="http://localhost:3000/store" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#d9534f; color:#fff; text-decoration:none; border-radius:5px;">Browse Store</a>
            </div>
            <div style="background:#f9f9f9; padding:10px; text-align:center; font-size:12px; color:#777;">
                LaggedOut Team
            </div>
        </div>
        `;

        console.log("Sending refund email to:", user.email);
        console.log("Email HTML preview:\n", html);

        await transporter.sendMail({
            from: `"LaggedOut" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Refund Processed - ${game.title}`,
            html
        });

        console.log("Refund email sent successfully to:", user.email);

    } catch (err) {
        console.error("Error sending refund email:", err);
    }
};

module.exports = { sendRefundEmail };
