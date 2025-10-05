const Refund = require("../model/refundModel");
const Purchase = require("../model/purchaseModel");
const User = require("../model/userModel");
const Game = require("../model/gameModel");
const Inventory = require("../model/inventoryModel");
const { sendRefundEmail } = require("../helper/refundMail");
const mongoose = require("mongoose");

class RefundController {
    // Request a refund
    async requestRefund(req, res) {
        try {
            const { purchaseId, reason } = req.body;

            const purchase = await Purchase.findById(purchaseId);
            if (!purchase) return res.status(404).json({ message: "Purchase not found" });

            if (purchase.user.toString() !== req.user.id)
                return res.status(403).json({ message: "Not authorized" });

            const existing = await Refund.findOne({ purchase: purchaseId });
            if (existing) return res.status(400).json({ message: "Refund already requested" });

            const refund = await Refund.create({
                user: req.user.id,
                purchase: purchaseId,
                reason
            });

            res.status(201).json({ message: "Refund requested", refund });
        } catch (err) {
            console.error("Request Refund Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // Review a refund (approve/reject)
    async reviewRefund(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { refundId } = req.params;
            const { status } = req.body;

            // Populate role from separate schema
            const user = await User.findById(req.user.id).populate("role").session(session);
            if (!user.role || user.role.name.toLowerCase() !== "admin") {
                await session.abortTransaction();
                session.endSession();
                return res.status(403).json({ message: "Not authorized" });
            }

            const refund = await Refund.findById(refundId).populate("purchase").session(session);
            if (!refund) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Refund not found" });
            }

            if (!["approved", "rejected"].includes(status)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "Invalid status" });
            }

            refund.status = status;
            refund.reviewedBy = user._id;
            refund.reviewedAt = new Date();
            await refund.save({ session });

            if (status === "approved") {
                const refundUser = await User.findById(refund.user).session(session);
                const game = await Game.findById(refund.purchase.game).session(session); // keep as Mongoose doc

                // Remove game from user's library
                refundUser.library = refundUser.library.filter(
                    g => g.toString() !== refund.purchase.game.toString()
                );
                await refundUser.save({ session });

                // Update inventory avatars
                const inventory = await Inventory.findOne({ user: refund.user }).session(session);
                if (inventory) {
                    // Edition avatars
                    const edition = game.editions.find(e => e.name === refund.purchase.edition);
                    if (edition?.bonusContent?.avatars?.length) {
                        const editionAvatars = edition.bonusContent.avatars.map(a => a.toString());
                        inventory.avatars = inventory.avatars.filter(id => !editionAvatars.includes(id.toString()));
                    }

                    // DLC avatars
                    if (refund.purchase.dlc) {
                        const dlc = game.dlcs.find(d => d._id.toString() === refund.purchase.dlc.toString());
                        if (dlc?.bonusContent?.avatars?.length) {
                            const dlcAvatars = dlc.bonusContent.avatars.map(a => a.toString());
                            inventory.avatars = inventory.avatars.filter(id => !dlcAvatars.includes(id.toString()));
                        }
                    }

                    await inventory.save({ session });
                }

                // TODO: Implement actual payment refund via Razorpay if needed
            }

            await session.commitTransaction();
            session.endSession();

            sendRefundEmail(refund._id);

            res.status(200).json({ message: `Refund ${status}`, refund });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            console.error("Review Refund Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // List refunds (user sees own, admin sees all)
    async listRefunds(req, res) {
        try {
            const user = await User.findById(req.user.id).populate("role");
            const roleName = user.role?.name?.toLowerCase();

            let refunds;
            if (roleName === "admin") {
                refunds = await Refund.find().populate("user purchase");
            } else {
                refunds = await Refund.find({ user: req.user.id }).populate("purchase");
            }

            res.status(200).json({ refunds });
        } catch (err) {
            console.error("List Refunds Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

}

module.exports = new RefundController();
