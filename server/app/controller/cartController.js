const Game = require("../model/gameModel");
const User = require("../model/userModel");
const Purchase = require("../model/purchaseModel");
const Activity = require("../model/activityModel");
const Inventory = require("../model/inventoryModel");
const { sendPurchaseEmail } = require("../helper/purchaseMail");
const mongoose = require("mongoose");
const razorpay = require("../config/razorpayConfig");
const checkAllUserAchievements = require("../helper/achievementConditions");

/**
 * A centralized helper function to ensure price calculation is always consistent.
 * It handles sale prices, DLC discounts for owned games, and edition prices.
 * @param {object} item - A cart item { game, editionId, dlcId }.
 * @param {object} user - The full user object, with library populated.
 * @returns {number} The calculated price for the item.
 */
const calculateItemPrice = (item, user) => {
    const game = item.game;
    if (!game) return 0;

    const edition = item.editionId ? game.editions.id(item.editionId) : null;
    const dlc = item.dlcId ? game.dlcs.id(item.dlcId) : null;

    if (dlc) {
        const ownsBaseGame = user.library.some(libItem => libItem.game.toString() === game._id.toString());
        return ownsBaseGame ? Math.max(0, dlc.price - game.basePrice) : dlc.price;
    }
    if (edition) {
        return edition.price || 0;
    }
    return game.onSale && game.salePrice != null ? game.salePrice : game.basePrice;
};

class CartController {
    // In your backend cartController.js

    async addToCart(req, res) {
        try {
            const { gameId, editionId, dlcId } = req.body;
            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ message: "Game not found" });

            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            // --- NEW LOGIC: Remove base game if an edition is being added ---
            if (editionId) {
                const baseGameIndex = user.cart.findIndex(item =>
                    item.game.toString() === gameId &&
                    !item.editionId &&
                    !item.dlcId
                );

                // If the base game is found in the cart, remove it
                if (baseGameIndex > -1) {
                    user.cart.splice(baseGameIndex, 1);
                }
            }
            // --- END OF NEW LOGIC ---

            const isAlreadyInCart = (gId, eId, dId) => user.cart.some(item =>
                item.game.toString() === gId &&
                String(item.editionId || null) === String(eId || null) &&
                String(item.dlcId || null) === String(dId || null)
            );

            if (isAlreadyInCart(gameId, editionId, dlcId)) {
                return res.status(400).json({ message: "Item is already in your cart" });
            }

            if (dlcId) {
                const dlc = game.dlcs.id(dlcId);
                if (!dlc) return res.status(404).json({ message: "DLC not found" });

                for (const cartItem of user.cart) {
                    if (cartItem.game.toString() === gameId && cartItem.editionId) {
                        const editionInCart = game.editions.id(cartItem.editionId);
                        if (editionInCart?.includesDLCs?.some(id => id.toString() === dlcId)) {
                            return res.status(400).json({ message: `DLC '${dlc.title}' is already included in '${editionInCart.name}' which is in your cart.` });
                        }
                    }
                }

                const ownsBaseGame = user.library.some(libItem => libItem.game.toString() === gameId);
                const isBaseGameInCart = user.cart.some(cartItem => cartItem.game.toString() === gameId && !cartItem.editionId && !cartItem.dlcId);

                if (!ownsBaseGame && !isBaseGameInCart) {
                    user.cart.push({ game: gameId });
                    user.cart.push({ game: gameId, dlcId });
                    await user.save();
                    return res.status(200).json({ message: `Added '${game.title}' and DLC '${dlc.title}' to cart`, cart: user.cart });
                }
            }

            if (editionId) {
                const edition = game.editions.id(editionId);
                if (!edition) return res.status(404).json({ message: "Edition not found" });

                if (dlcId && edition.includesDLCs?.some(id => id.toString() === dlcId)) {
                    return res.status(400).json({ message: "This DLC is already included in the edition you selected." });
                }
            }

            user.cart.push({ game: gameId, editionId, dlcId });
            await user.save();

            res.status(200).json({ message: "Added to cart", cart: user.cart });

        } catch (err) {
            console.error("Add to Cart Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async removeFromCart(req, res) {
        try {
            const { itemId } = req.params;
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "User not found." });

            const itemToRemove = user.cart.id(itemId);
            if (!itemToRemove) {
                return res.status(404).json({ message: "Item not found in cart" });
            }

            const isBaseGame = !itemToRemove.editionId && !itemToRemove.dlcId;

            if (isBaseGame) {
                const gameIdToRemove = itemToRemove.game.toString();
                const idsToRemove = user.cart
                    .filter(item =>
                        item.game.toString() === gameIdToRemove && !item.editionId
                    )
                    .map(item => item._id);
                idsToRemove.forEach(id => user.cart.pull(id));
            } else {
                user.cart.pull(itemId);
            }

            await user.save();
            res.status(200).json({ message: "Item(s) removed from cart", cart: user.cart });
        } catch (err) {
            console.error("Remove from Cart Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getCart(req, res) {
        try {
            const user = await User.findById(req.user.id)
                .populate({ path: "cart.game", select: "title basePrice salePrice onSale coverImage editions dlcs" })
                .populate('library.game');

            if (!user) return res.status(404).json({ message: "User not found" });

            const cartItems = user.cart.map(item => {
                const game = item.game;
                if (!game) return null;

                const price = calculateItemPrice(item, user);

                let editionName = "Standard Edition";
                let dlcTitle = null;
                let coverImage = game.coverImage;

                const edition = item.editionId ? game.editions.id(item.editionId) : null;
                if (edition) {
                    editionName = edition.name;
                    coverImage = edition.coverImage || game.coverImage;
                }
                const dlc = item.dlcId ? game.dlcs.id(item.dlcId) : null;
                if (dlc) dlcTitle = dlc.title;

                return {
                    id: item._id, gameId: game._id, editionId: item.editionId || null, dlcId: item.dlcId || null,
                    gameTitle: game.title, editionName, dlcTitle, price, coverImage
                };
            }).filter(Boolean);

            const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
            res.status(200).json({ cart: cartItems, totalPrice });
        } catch (err) {
            console.error("Get Cart Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async createCartOrder(req, res) {
        try {
            const user = await User.findById(req.user.id)
                .populate({ path: "cart.game", select: "title basePrice salePrice onSale coverImage editions dlcs" })
                .populate('library.game');

            if (!user || !user.cart.length) {
                return res.status(400).json({ status: false, message: "Cart is empty" });
            }

            let totalAmount = 0;
            for (const item of user.cart) {
                totalAmount += calculateItemPrice(item, user);
            }

            if (totalAmount <= 0) {
                return res.status(400).json({ status: false, message: "Cannot checkout with a total of ₹0." });
            }

            const options = {
                amount: Math.round(totalAmount * 100), currency: "INR", receipt: `cart_receipt_${Date.now()}`
            };

            const order = await razorpay.orders.create(options);
            res.status(200).json({ status: true, orderId: order.id, amount: options.amount, currency: options.currency });
        } catch (error) {
            console.error("Create Cart Order Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async verifyCartPayment(req, res) {
    const { razorpay_payment_id } = req.body;
    const session = await mongoose.startSession();
    let purchases = [];

    try {
        session.startTransaction();
        const user = await User.findById(req.user.id)
            .populate({ path: "cart.game", select: "title basePrice salePrice onSale coverImage editions dlcs bonusContent" })
            .populate('library.game')
            .session(session);

        if (!user || !user.cart.length) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ status: false, message: "Cart is empty" });
        }

        for (const item of user.cart) {
            const game = item.game;
            if (!game) continue;

            const price = calculateItemPrice(item, user);

            let editionName = "Standard Edition";
            const edition = item.editionId ? game.editions.id(item.editionId) : null;
            if (edition) editionName = edition.name;

            const purchase = await Purchase.create([{
                user: req.user.id,
                game: game._id,
                edition: editionName,
                dlc: item.dlcId || null,
                pricePaid: price,
                transactionId: razorpay_payment_id
            }], { session });

            // --- Activity ---
            await Activity.create([{
                user: req.user.id,
                type: "purchase",
                game: game._id,
                details: { editionId: edition?._id || null, dlcId: item.dlcId || null }
            }], { session });

            // --- Inventory Update with $addToSet ---
            const dlc = item.dlcId ? game.dlcs.id(item.dlcId) : null;
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

            // --- Library + Wishlist ---
            user.library.addToSet({ game: game._id, addedAt: new Date() });
            user.wishlist = user.wishlist.filter(
                (wishlistItem) => wishlistItem.game.toString() !== game._id.toString()
            );

            purchases.push(purchase[0]);
        }

        user.cart = [];
        await user.save({ session });
        await session.commitTransaction();

    } catch (error) {
        await session.abortTransaction();
        console.error("Verify Cart Payment Error (Transaction):", error);
        return res.status(500).json({ status: false, message: "Database transaction failed." });
    } finally {
        session.endSession();
    }

    try {
        await checkAllUserAchievements(req.user.id);
        for (const purchase of purchases) {
            sendPurchaseEmail(purchase._id);
        }
    } catch (postTransactionError) {
        console.error("Error in post-transaction actions (achievements/email):", postTransactionError);
    }

    res.status(200).json({ status: true, message: "Cart checkout successful", purchases });
}

}

module.exports = new CartController();