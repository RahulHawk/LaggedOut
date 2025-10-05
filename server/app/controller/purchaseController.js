const razorpay = require("../config/razorpayConfig");
const Purchase = require("../model/purchaseModel");
const Game = require("../model/gameModel");
const User = require("../model/userModel");
const Activity = require("../model/activityModel");
const Inventory = require("../model/inventoryModel");
const { sendPurchaseEmail } = require("../helper/purchaseMail");
const mongoose = require("mongoose");
const checkAllUserAchievements = require("../helper/achievementConditions");

class PurchaseController {
    async createOrder(req, res) {
        try {
            const { gameId, editionId, dlcId } = req.body;
            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            let price = game.basePrice || 0;
            let editionName = "Standard Edition";
            let dlcTitle = null;

            let edition = null;
            if (editionId) {
                edition = game.editions.id(editionId);
                if (!edition) return res.status(404).json({ status: false, message: "Edition not found" });
                price = edition.price;
                editionName = edition.name;
            }

            if (dlcId) {
                const dlc = game.dlcs.id(dlcId);
                if (!dlc) return res.status(404).json({ status: false, message: "DLC not found" });
                dlcTitle = dlc.title;

                // Only add DLC price if edition does NOT include it
                const editionIncludesDLC = edition?.includesDLCs?.some(id => id.toString() === dlcId);
                if (!editionIncludesDLC) {
                    price += dlc.price;
                }
            }

            const alreadyPurchased = await Purchase.findOne({
                user: req.user.id,
                game: game._id,
                edition: editionName,
                dlc: dlcId || null
            });

            if (alreadyPurchased) {
                return res.status(400).json({
                    status: false,
                    message: `You already own ${game.title} ${editionName}${dlcTitle ? ` - ${dlcTitle}` : ""}`
                });
            }

            const options = {
                amount: price * 100,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                payment_capture: 1
            };

            const order = await razorpay.orders.create(options);

            res.status(200).json({
                status: true,
                orderId: order.id,
                amount: options.amount,
                currency: options.currency,
                edition: editionName,
                dlcTitle
            });
        } catch (error) {
            console.error("Create Order Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async verifyPayment(req, res) {
    const { razorpay_payment_id, gameId, editionId, dlcId } = req.body;

    // STEP 1: Find and validate the game BEFORE the transaction.
    const game = await Game.findById(gameId);
    if (!game) {
        return res.status(404).json({ status: false, message: "Game not found" });
    }

    const userForCheck = await User.findById(req.user.id);
    if (!userForCheck) {
        return res.status(404).json({ status: false, message: "User not found" });
    }

    // STEP 2: Start the transaction for all database WRITES.
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let price = game.basePrice || 0;
        let editionName = "Standard Edition";
        let dlcTitle = null;
        let edition = null;

        if (editionId) {
            edition = game.editions.id(editionId);
            if (!edition) {
                await session.abortTransaction(); session.endSession();
                return res.status(404).json({ status: false, message: "Edition not found" });
            }
            price = edition.price;
            editionName = edition.name;
        }

        if (dlcId) {
            const dlc = game.dlcs.id(dlcId);
            if (!dlc) {
                await session.abortTransaction(); session.endSession();
                return res.status(404).json({ status: false, message: "DLC not found" });
            }
            dlcTitle = dlc.title;
            const editionIncludesDLC = edition?.includesDLCs?.some(id => id.toString() === dlcId);
            if (!editionIncludesDLC) price += dlc.price;
        }

        const ownsBaseGame = userForCheck.library.some(libItem => libItem.game.toString() === gameId);
        if (dlcId && ownsBaseGame) {
            price = Math.max(0, price - game.basePrice);
        }

        const alreadyPurchased = await Purchase.findOne({
            user: req.user.id, game: game._id, edition: editionName, dlc: dlcId || null
        }).session(session);

        if (alreadyPurchased) {
            await session.abortTransaction(); session.endSession();
            return res.status(400).json({ status: false, message: `You already own this item.` });
        }

        const purchase = await Purchase.create([{
            user: req.user.id, game: game._id, edition: editionName, dlc: dlcId || null,
            pricePaid: price, transactionId: razorpay_payment_id
        }], { session });

        await User.findByIdAndUpdate(
            req.user.id,
            {
                $addToSet: { library: { game: game._id, addedAt: new Date() } },
                $pull: { wishlist: { game: game._id } }
            },
            { session }
        );

        await Activity.create([{
            user: req.user.id, type: "purchase", game: game._id, details: { editionId, dlcId }
        }], { session });

        // --- Inventory Update with $addToSet ---
        const dlc = dlcId ? game.dlcs.id(dlcId) : null;
        await Inventory.updateOne(
            { user: req.user.id },
            {
                $addToSet: {
                    avatars: {
                        $each: [
                            ...(game.bonusContent?.avatars || []),
                            ...(edition?.bonusContent?.avatars || []),
                            ...(dlc?.bonusContent?.avatars || [])
                        ]
                    }
                }
            },
            { upsert: true, session }
        );
        // --- END Inventory Update ---

        await session.commitTransaction();
        session.endSession();

        await checkAllUserAchievements(req.user.id);
        sendPurchaseEmail(purchase[0]._id);

        res.status(200).json({
            status: true,
            message: `${game.title} has been added to your library`,
            purchase: purchase[0]
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Verify Payment Error:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
}


    async getPurchaseHistoryForGame(req, res) {
        try {
            const { gameId } = req.params;
            const purchases = await Purchase.find({
                user: req.user.id,
                game: gameId
            });
            res.status(200).json({ status: true, purchases });
        } catch (error) {
            console.error("Get Purchase History Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async getMyPurchaseHistory(req, res) {
        try {
            const purchases = await Purchase.find({ user: req.user.id })
                .populate('game', 'title coverImage developer')
                .sort({ purchasedAt: -1 });

            res.status(200).json({ purchases });
        } catch (err) {
            console.error("Get My Purchase History Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = new PurchaseController();