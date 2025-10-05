const Achievement = require("../model/achievementModel");
const Badge = require("../model/badgeModel");
const Inventory = require("../model/inventoryModel");
const UserAchievement = require("../model/userAchievementModel");
const uploadToCloudinary = require("../helper/cloudnaryHelper");

class AchievementController {
    formatAchievement = (achievement) => {
        return {
            id: achievement._id,
            name: achievement.name,
            description: achievement.description,
            badge: achievement.badge
                ? {
                    id: achievement.badge._id,
                    name: achievement.badge.name,
                    image: achievement.badge.image,
                    description: achievement.badge.description,
                }
                : null,
        };
    };

    async getInventory(req, res) {
        try {
            let inventory = await Inventory.findOne({ user: req.user.id })
                .populate("avatars")
                .populate("badges");

            if (!inventory) {
                inventory = await Inventory.create({ user: req.user.id, avatars: [], badges: [] });
                inventory = await Inventory.findById(inventory._id)
                    .populate("avatars")
                    .populate("badges");
            }

            res.status(200).json({ inventory });
        } catch (err) {
            console.error("Get Inventory Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async createBadge(req, res) {
        try {
            const uploadedImage =
                req.files && req.files.image && req.files.image.length > 0
                    ? req.files.image[0]
                    : null;

            if (!uploadedImage) {
                return res.status(400).json({ message: "Badge image required" });
            }

            const { name, description } = req.body;

            if (!name || name.trim() === "") {
                return res.status(400).json({ message: "Badge name is required" });
            }

            const cloudinaryResult = await uploadToCloudinary(uploadedImage.path);

            console.log('Uploaded image:', uploadedImage);
            console.log('Cloudinary result:', cloudinaryResult);

            const badge = await Badge.create({
                name: name.trim(),
                image: cloudinaryResult,
                description: description,
            });

            res.status(201).json({
                message: "Badge created successfully",
                badge,
            });
        } catch (error) {
            console.error("Create Badge Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async createAchievement(req, res) {
        try {
            const { name, description, condition, badgeId } = req.body;

            let badge = null;
            if (badgeId) {
                badge = await Badge.findById(badgeId);
                if (!badge) return res.status(404).json({ message: "Badge not found" });
            }

            const achievement = await Achievement.create({
                name,
                description,
                condition,
                badge: badge ? badge._id : null,
            });

            res.status(201).json({ achievement });
        } catch (err) {
            console.error("Create Achievement Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async listAchievements(req, res) {
        try {
            const achievements = await Achievement.find().populate("badge");

            const formatted = achievements.map(a => ({
                id: a._id,
                name: a.name,
                description: a.description,
                badge: a.badge
                    ? {
                        id: a.badge._id,
                        name: a.badge.name,
                        description: a.badge.description,
                        image: a.badge.image || null
                    }
                    : null
            }));

            res.status(200).json({ achievements: formatted });
        } catch (err) {
            console.error("List Achievements Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getAllAndMyAchievements(req, res) {
        try {
            const [allAchievements, userAchievements] = await Promise.all([
                Achievement.find().populate("badge"),
                UserAchievement.find({ user: req.user.id }).populate({
                    path: "achievement",
                    populate: { path: "badge" }
                })
            ]);

            const earnedIds = new Set(userAchievements.map(ua => ua.achievement._id.toString()));

            const formattedAll = allAchievements.map(a => ({
                id: a._id,
                name: a.name,
                description: a.description,
                badge: a.badge
                    ? {
                        id: a.badge._id,
                        name: a.badge.name,
                        description: a.badge.description,
                        image: a.badge.image || null
                    }
                    : null,
                earned: earnedIds.has(a._id.toString())
            }));

            const formattedMine = formattedAll.filter(a => a.earned);

            res.status(200).json({
                allAchievements: formattedAll,
                myAchievements: formattedMine
            });
        } catch (err) {
            console.error("Get All & My Achievements Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

}

module.exports = new AchievementController();
