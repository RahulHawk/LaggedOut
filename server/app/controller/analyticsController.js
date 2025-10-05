const User = require("../model/userModel");
const Game = require("../model/gameModel");
const Review = require("../model/reviewModel");
const Sale = require("../model/saleModel");
const Purchase = require("../model/purchaseModel");
const Refund = require("../model/refundModel");

class AdminAnalyticsController {
    async getOverallAnalytics(req, res) {
        try {
            // --- Users ---
            const totalUsers = await User.countDocuments();
            const totalDevelopers = await User.countDocuments({ "role.name": "developer" });
            const totalBanned = await User.countDocuments({ isBanned: true });
            const totalVerified = await User.countDocuments({ isEmailVerified: true });

            // --- Games ---
            const totalGames = await Game.countDocuments();
            const gamesOnSale = await Game.countDocuments({ onSale: true });

            const genreAggregation = await Game.aggregate([
                { $unwind: "$genre" }, // unwind array genres
                {
                    $lookup: {
                        from: "genres",
                        localField: "genre",
                        foreignField: "_id",
                        as: "genreInfo"
                    }
                },
                { $unwind: "$genreInfo" },
                { $group: { _id: "$genreInfo.name", count: { $sum: 1 } } },
                { $project: { genre: "$_id", count: 1, _id: 0 } }
            ]);

            // --- Reviews ---
            const reviewStats = await Review.aggregate([
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        averageRating: { $avg: "$rating" },
                        stars5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                        stars4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                        stars3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                        stars2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                        stars1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                    }
                }
            ]);

            // --- Sales ---
            const now = new Date();
            const totalActiveSales = await Sale.countDocuments({ isActive: true });
            const upcomingSales = await Sale.countDocuments({ startDate: { $gt: now } });

            // --- Purchases & Revenue (minus approved refunds) ---
            const purchases = await Purchase.find().lean();
            const approvedRefunds = await Refund.find({ status: "approved" }).populate("purchase").lean();

            let totalRevenue = 0;

            purchases.forEach(purchase => {
                const refundedForThisPurchase = approvedRefunds
                    .filter(r => r.purchase && r.purchase._id.toString() === purchase._id.toString())
                    .reduce((sum, r) => sum + purchase.pricePaid, 0); // full refund
                totalRevenue += purchase.pricePaid - refundedForThisPurchase;
            });

            const analytics = {
                users: { totalUsers, totalDevelopers, totalBanned, totalVerified },
                games: { totalGames, gamesOnSale, gamesPerGenre: genreAggregation },
                reviews: reviewStats[0] || {},
                sales: { totalActiveSales, upcomingSales },
                purchases: { totalPurchases: purchases.length, totalRevenue }
            };

            res.json(analytics);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error fetching analytics", error: err.message });
        }
    }
}

module.exports = new AdminAnalyticsController();
