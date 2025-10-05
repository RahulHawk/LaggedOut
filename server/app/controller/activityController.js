const Activity = require("../model/activityModel");
const mongoose = require("mongoose");

class ActivityController {
    async getUserActivity(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;

            const activities = await Activity.find({ user: userId })
                .populate('game', 'title coverImage') // Populate game details
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(); // Use .lean() for faster read operations

            const total = await Activity.countDocuments({ user: userId });

            res.status(200).json({
                status: true,
                activities,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error("Get User Activity Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }
}

module.exports = new ActivityController();