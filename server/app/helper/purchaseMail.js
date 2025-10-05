const transporter = require("../config/emailConfig");
const Purchase = require("../model/purchaseModel");
const Game = require("../model/gameModel");

/**
 * Send purchase confirmation email
 * @param {string} purchaseId - ID of the Purchase document
 */
const sendPurchaseEmail = async (purchaseId) => {
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

        // HTML template
        const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px; overflow:hidden;">
            <div style="background:#0b79d0; padding:20px; color:#fff; text-align:center;">
                <h2>Thank you for your purchase!</h2>
            </div>
            <div style="padding:20px;">
                <p>Hi ${user.firstName},</p>
                <p>You have successfully purchased:</p>
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${editionObj.coverImage || game.coverImage}" alt="${game.title}" style="width:120px; height:auto; border-radius:5px;"/>
                    <div>
                        <h3 style="margin:0;">${game.title}</h3>
                        <span style="background:#f0f0f0; padding:3px 8px; border-radius:4px; font-size:12px;">${editionObj.name}</span>
                        ${dlcObj ? `<p style="margin:5px 0; font-size:13px;">DLC: <b>${dlcObj.title}</b></p>` : ""}
                        <p style="margin:5px 0;">Amount Paid: <b>₹${pricePaid}</b></p>
                        <p style="margin:0;">Transaction ID: <b>${transactionId}</b></p>
                    </div>
                </div>
                <a href="http://localhost:3000/" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#0b79d0; color:#fff; text-decoration:none; border-radius:5px;">View in Store</a>
            </div>
            <div style="background:#f9f9f9; padding:10px; text-align:center; font-size:12px; color:#777;">
                LaggedOut Team
            </div>
        </div>
        `;

        console.log("Sending purchase email to:", user.email);
        console.log("Email HTML preview:\n", html);

        await transporter.sendMail({
            from: `"LaggedOut" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Purchase Confirmation - ${game.title}`,
            html
        });

        console.log("Purchase email sent successfully to:", user.email);

    } catch (err) {
        console.error("Error sending purchase email:", err);
    }
};

module.exports = { sendPurchaseEmail };
