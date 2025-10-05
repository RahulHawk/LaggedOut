const Review = require("../model/reviewModel");
const Game = require("../model/gameModel");

const updateGameRating = async (gameId) => {
    const reviews = await Review.find({ game: gameId });
    const totalReviews = reviews.length;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await Game.findByIdAndUpdate(gameId, {
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews,
        starBreakdown: breakdown
    });
};


module.exports = updateGameRating;