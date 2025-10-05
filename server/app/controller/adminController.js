const User = require("../model/userModel");
const Role = require("../model/roleModel");
const Game = require("../model/gameModel");
const Activity = require("../model/activityModel");
const BanHistory = require("../model/banHistoryModel");
const Purchase = require("../model/purchaseModel");
const DevRequestLink = require("../model/devRequestLinkModel");
const { sendBanUnbanMail } = require("../helper/banUnbanMail");
const { sendDevRegisterEmail } = require("../helper/devRegisterMail");

class AdminController {
    async getAdminProfile(req, res) {
        try {
            const user = await User.findById(req.user.id).populate("role", "name");
            if (!user || user.role?.name !== "admin") {
                return res.status(403).json({ status: false, message: "Access denied" });
            }

            const developerRole = await Role.findOne({ name: "developer" });
            const playerRole = await Role.findOne({ name: "player" });

            if (!developerRole || !playerRole) {
                return res.status(500).json({ status: false, message: "Essential roles not found in database" });
            }

            // --- Stats ---
            const totalUsers = await User.countDocuments();
            const totalPlayers = await User.countDocuments({ "role.name": "player" });
            const totalDevelopers = await User.countDocuments({ "role.name": "developer" });
            const totalGames = await Game.countDocuments();

            // --- Sales and revenue from purchases ---
            const purchaseAggregation = await Purchase.aggregate([
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: "$pricePaid" }
                    }
                }
            ]);
            const totalSales = purchaseAggregation[0]?.totalSales || 0;
            const totalRevenue = purchaseAggregation[0]?.totalRevenue || 0;

            // --- Sales by genre ---
            const salesByGenre = await Purchase.aggregate([
                {
                    $lookup: {
                        from: "games",
                        localField: "game",
                        foreignField: "_id",
                        as: "gameData"
                    }
                },
                { $unwind: { path: "$gameData", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$gameData.genre", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$gameData.genre",
                        count: { $sum: 1 },
                        revenue: { $sum: "$pricePaid" }
                    }
                },
                {
                    $lookup: {
                        from: "genres",
                        localField: "_id",
                        foreignField: "_id",
                        as: "genreInfo"
                    }
                },
                { $unwind: { path: "$genreInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: "$genreInfo.name",
                        revenue: 1,
                        count: 1
                    }
                }
            ]);

            // --- Sales by developer ---
            const salesByDeveloper = await Purchase.aggregate([
                {
                    $lookup: {
                        from: "games",
                        localField: "game",
                        foreignField: "_id",
                        as: "gameData"
                    }
                },
                { $unwind: { path: "$gameData", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "gameData.developer",
                        foreignField: "_id",
                        as: "developerData"
                    }
                },
                { $unwind: { path: "$developerData", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$developerData.name",
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: "$pricePaid" }
                    }
                }
            ]);

            // --- Recent system activity ---
            const recentActivities = await Activity.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("user", "name profile.avatarUrl")
                .populate("game", "title coverImage");

            // --- Developers list ---
            const developers = await User.find({ role: developerRole._id })
                .select("firstName lastName email profile.profilePic isDeveloperApproved isBanned createdAt");

            const developerList = developers.map(dev => ({
                id: dev._id,
                name: `${dev.firstName} ${dev.lastName}`,
                email: dev.email,
                avatar: dev.profile?.profilePic || null,
                status: dev.isBanned ? "Banned" : (dev.isDeveloperApproved ? "Active" : "Pending")
            }));

            // --- Players list ---
            const players = await User.find({ role: playerRole._id })
                .select("firstName lastName email profile.profilePic isBanned createdAt");

            const playerList = players.map(p => ({
                id: p._id,
                name: `${p.firstName} ${p.lastName}`,
                email: p.email,
                avatar: p.profile?.profilePic || null,
                status: p.isBanned ? "Banned" : "Active"
            }));

            // --- Ban/Unban history ---
            const banHistory = await BanHistory.find()
                .sort({ createdAt: -1 })
                .limit(20)
                .populate("user", "name email profile.avatarUrl")
                .populate("admin", "name email");

            const banHistoryList = banHistory
                .filter(entry => entry.user && entry.admin)
                .map(entry => ({
                    id: entry._id,
                    user: {
                        id: entry.user._id,
                        name: entry.user.name,
                        email: entry.user.email,
                        avatar: entry.user.profile?.avatarUrl || null
                    },
                    action: entry.action,
                    reason: entry.reason,
                    admin: {
                        id: entry.admin._id,
                        name: entry.admin.name,
                        email: entry.admin.email
                    },
                    date: entry.createdAt
                }));

            res.status(200).json({
                status: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role?.name,
                    stats: {
                        totalUsers,
                        totalPlayers,
                        totalDevelopers,
                        totalGames,
                        totalSales,
                        totalRevenue
                    },
                    salesByGenre,
                    salesByDeveloper,
                    recentActivities,
                    developers: developerList,
                    players: playerList,
                    banHistory: banHistoryList
                }
            });
        } catch (error) {
            console.error("Get Admin Profile Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async getDevLinkRequests(req, res) {
        try {
            const requests = await User.find({
                'developerRequest.requestedAt': { $exists: true },
                'developerRequest.isRequestApproved': false
            }).sort({ 'developerRequest.requestedAt': 1 });

            const formattedRequests = requests.map(user => ({
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                requestedAt: user.developerRequest.requestedAt,
            }));

            res.status(200).json({ status: true, data: formattedRequests });
        } catch (error) {
            console.error("Get Dev Link Requests Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async approveDevLinkRequest(req, res) {
        try {
            const { userId } = req.params;
            const adminId = req.user._id;

            const user = await User.findById(userId);

            if (!user || !user.developerRequest || !user.developerRequest.requestToken) {
                return res.status(404).json({ status: false, message: "Request not found" });
            }

            if (user.developerRequest.isRequestApproved) {
                return res.status(400).json({ status: false, message: "This request has already been approved." });
            }

            user.developerRequest.isRequestApproved = true;
            user.developerRequest.approvedAt = new Date();
            user.developerRequest.approvedBy = adminId;
            await user.save();

            const devRegisterLink = `${process.env.APP_URL}/auth/dev-register/${user.developerRequest.requestToken}`;
            await sendDevRegisterEmail(user.email, user.firstName, devRegisterLink);

            res.status(200).json({
                status: true,
                message: "Developer request approved and email sent successfully.",
            });
        } catch (error) {
            console.error("Approve Dev Link Request Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async approveDeveloper(req, res) {
        try {
            const { developerId } = req.params;
            const developer = await User.findById(developerId).populate("role", "name");

            if (!developer || developer.role?.name !== "developer") {
                return res.status(404).json({ status: false, message: "Developer not found" });
            }

            developer.isDeveloperApproved = true;
            await developer.save();

            res.status(200).json({ status: true, message: "Developer approved successfully" });
        } catch (error) {
            console.error("Approve Developer Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    // --- Ban user ---
    async banUser(req, res) {
        try {
            const { userId } = req.params;
            const { reason } = req.body;
            const user = await User.findById(userId).populate("role", "name");

            if (!user) return res.status(404).json({ status: false, message: "User not found" });
            if (!reason) return res.status(400).json({ status: false, message: "Reason is required" });

            // Check if user is already banned
            if (user.isBanned) {
                return res.status(400).json({ status: false, message: `${user.role.name} is already banned` });
            }

            user.isBanned = true;
            await user.save();

            await BanHistory.create({ user: user._id, action: "ban", reason, admin: req.user.id });
            await sendBanUnbanMail(user, "ban", reason);

            const io = req.app.get('io');
            const onlineUsers = req.app.get('onlineUsers');
            const socketId = onlineUsers.get(userId.toString());
            if (socketId) {
                io.to(socketId).emit("banned", { message: "Your account has been banned by admin." });
            }

            res.status(200).json({ status: true, message: `${user.role.name} has been banned successfully` });
        } catch (error) {
            console.error("Ban User Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    // --- Unban user ---
    async unbanUser(req, res) {
        try {
            const { userId } = req.params;
            const { reason } = req.body;
            const user = await User.findById(userId).populate("role", "name");

            if (!user) return res.status(404).json({ status: false, message: "User not found" });
            if (!reason) return res.status(400).json({ status: false, message: "Reason is required" });

            // Check if user is not banned
            if (!user.isBanned) {
                return res.status(400).json({ status: false, message: `${user.role.name} has not been banned` });
            }

            user.isBanned = false;
            await user.save();

            await BanHistory.create({ user: user._id, action: "unban", reason, admin: req.user.id });
            await sendBanUnbanMail(user, "unban", reason);

            const io = req.app.get('io');
            const onlineUsers = req.app.get('onlineUsers');
            const socketId = onlineUsers.get(userId.toString());
            if (socketId) {
                io.to(socketId).emit("unbanned", { message: "Your account has been unbanned by admin." });
            }

            res.status(200).json({ status: true, message: `${user.role.name} has been unbanned successfully` });
        } catch (error) {
            console.error("Unban User Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async promoteToDeveloper(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId).populate("role");
            if (!user) return res.status(404).json({ status: false, message: "User not found" });
            if (user.role?.name === "developer") {
                return res.status(400).json({ status: false, message: "User is already a developer" });
            }

            const developerRole = await Role.findOne({ name: "developer" });
            if (!developerRole) return res.status(500).json({ status: false, message: "Developer role not found" });

            user.role = developerRole._id;
            await user.save();
            await user.populate("role", "name");

            res.status(200).json({
                status: true,
                message: `${user.firstName} has been promoted to developer`,
                data: user
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }
}

module.exports = new AdminController();
