const Review = require("../model/reviewModel");
const Game = require("../model/gameModel");
const Activity = require("../model/activityModel");
const updateGameRating = require("../helper/updateGameRating");

class ReviewController {
    async addReview(req, res) {
        try {
            const { game, rating, comment } = req.body;
            const userId = req.user._id;

            const existingReview = await Review.findOne({ game, user: userId });
            if (existingReview) {
                return res.status(400).json({ message: "You have already reviewed this game" });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }

            const review = new Review({ game, user: userId, rating, comment });
            await review.save();

            await updateGameRating(game);

            await Activity.create({
                user: userId,
                game: game,
                type: "review",
                details: { reviewId: review._id, rating, comment }
            });

            res.status(201).json({ message: "Review added", review });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }

    async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user._id;

            const review = await Review.findById(reviewId);
            if (!review) return res.status(404).json({ message: "Review not found" });

            if (review.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: "You can only edit your own review" });
            }

            if (rating !== undefined && (rating < 1 || rating > 5)) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }

            if (rating !== undefined) review.rating = rating;
            if (comment !== undefined) review.comment = comment;

            await review.save();
            await updateGameRating(review.game);

            res.json({ message: "Review updated", review });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }

    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user._id;

            const review = await Review.findById(reviewId);
            if (!review) return res.status(404).json({ message: "Review not found" });

            if (review.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: "You can only delete your own review" });
            }

            await review.deleteOne();
            await updateGameRating(review.game);

            res.json({ message: "Review deleted" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }

    async getReviewsByGame(req, res) {
        try {
            const { gameId } = req.params;
            let { page = 1, limit = 10 } = req.query;

            page = Math.max(1, parseInt(page) || 1);
            limit = Math.max(1, parseInt(limit) || 10);

            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ message: "Game not found" });

            const reviews = await Review.find({ game: gameId })
                .populate("user", "name profile.profilePic")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            res.json({
                averageRating: game.averageRating,
                totalReviews: game.totalReviews,
                starBreakdown: game.starBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                currentPage: page,
                totalPages: Math.ceil(game.totalReviews / limit),
                reviews
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }

    async getUserReview(req, res) {
        try {
            const { gameId } = req.params;
            const userId = req.user._id;

            const review = await Review.findOne({ game: gameId, user: userId }).lean();
            res.json({ review: review || null });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Something went wrong" });
        }
    }
}

module.exports = new ReviewController();
