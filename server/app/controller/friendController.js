const User = require("../model/userModel");
const Notification = require("../model/notificationModel");
const Role = require("../model/roleModel");

class FriendController {
    async sendFriendRequest(req, res) {
        try {
            const senderId = req.user._id;
            const { receiverId } = req.body;

            if (senderId.toString() === receiverId) {
                return res.status(400).json({ message: "You cannot send a request to yourself." });
            }

            const sender = await User.findById(senderId);
            const receiver = await User.findById(receiverId);

            if (!receiver) return res.status(404).json({ message: "User not found." });
            if (receiver.friendRequests.includes(senderId)) {
                return res.status(400).json({ message: "Friend request already sent." });
            }
            if (receiver.friends.includes(senderId)) {
                return res.status(400).json({ message: "You are already friends." });
            }

            receiver.friendRequests.push(senderId);
            sender.sentRequests.push(receiverId);

            await receiver.save();
            await sender.save();

            await Notification.create({
                user: receiverId,
                type: "friend_request",
                content: `${req.user.firstName} ${req.user.lastName} sent you a friend request`,
                relatedUser: req.user._id
            });

            res.json({ message: "Friend request sent." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async cancelFriendRequest(req, res) {
        try {
            const senderId = req.user._id;
            const { receiverId } = req.body;

            if (!receiverId) {
                return res.status(400).json({ message: "receiverId is required." });
            }

            const sender = await User.findById(senderId);
            const receiver = await User.findById(receiverId);

            if (!receiver) {
                return res.status(404).json({ message: "User not found." });
            }

            // Remove from arrays if present
            sender.sentRequests = sender.sentRequests.filter(
                (id) => id.toString() !== receiverId.toString()
            );
            receiver.friendRequests = receiver.friendRequests.filter(
                (id) => id.toString() !== senderId.toString()
            );

            await sender.save();
            await receiver.save();

            return res.json({ message: "Friend request cancelled." });
        } catch (err) {
            console.error("Cancel Friend Request Error:", err);
            res.status(500).json({ message: err.message });
        }
    }


    async acceptFriendRequest(req, res) {
        try {
            const userId = req.user._id;
            const { requesterId } = req.body;

            const user = await User.findById(userId);
            const requester = await User.findById(requesterId);

            if (!user.friendRequests.includes(requesterId)) {
                return res.status(400).json({ message: "No such friend request." });
            }

            user.friends.push(requesterId);
            requester.friends.push(userId);

            user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
            requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

            await user.save();
            await requester.save();

            await Notification.create({
                user: requesterId,
                type: "friend_accept",
                content: `${req.user.firstName} ${req.user.lastName} accepted your friend request`,
                relatedUser: req.user._id
            });

            res.json({ message: "Friend request accepted." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async rejectFriendRequest(req, res) {
        try {
            const userId = req.user._id;
            const { requesterId } = req.body;

            const user = await User.findById(userId);
            const requester = await User.findById(requesterId);

            user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
            requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

            await user.save();
            await requester.save();

            res.json({ message: "Friend request rejected." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async unfriend(req, res) {
        try {
            const userId = req.user._id;
            const { friendId } = req.body;

            const user = await User.findById(userId);
            const friend = await User.findById(friendId);

            user.friends = user.friends.filter(id => id.toString() !== friendId);
            friend.friends = friend.friends.filter(id => id.toString() !== userId);

            await user.save();
            await friend.save();

            res.json({ message: "Unfriended successfully." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async blockUser(req, res) {
        try {
            const userId = req.user._id;
            const { blockUserId } = req.body;

            const user = await User.findById(userId);

            if (!user.blockedUsers) user.blockedUsers = [];
            if (!user.blockedUsers.includes(blockUserId)) {
                user.blockedUsers.push(blockUserId);
            }

            user.friends = user.friends.filter(id => id.toString() !== blockUserId);
            user.friendRequests = user.friendRequests.filter(id => id.toString() !== blockUserId);
            user.sentRequests = user.sentRequests.filter(id => id.toString() !== blockUserId);

            await user.save();
            res.json({ message: "User blocked successfully." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async unblockUser(req, res) {
        try {
            const userId = req.user._id;
            const { unblockUserId } = req.body;

            const user = await User.findById(userId);
            if (!user.blockedUsers) user.blockedUsers = [];

            user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== unblockUserId);

            await user.save();
            res.json({ message: "User unblocked successfully." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getAllRequests(req, res) {
        try {
            const userId = req.user._id;

            const user = await User.findById(userId)
                .populate("friends", "firstName lastName email userId profile.profilePic")
                .populate("friendRequests", "firstName lastName email userId profile.profilePic")
                .populate("sentRequests", "firstName lastName email userId profile.profilePic")
                .populate("blockedUsers", "firstName lastName email userId profile.profilePic");

            res.json({
                friends: user.friends,
                receivedRequests: user.friendRequests,
                sentRequests: user.sentRequests,
                blockedUsers: user.blockedUsers || []
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async searchUsers(req, res) {
        try {
            const { query } = req.query;
            const currentUserId = req.user._id;

            if (!query || query.trim().length < 2) {
                return res.json([]); // Return empty if query is too short
            }

            // 1. Get the ObjectId of the 'developer' role
            const developerRole = await Role.findOne({ name: 'developer' });
            if (!developerRole) {
                console.error("Developer role not found in database.");
                return res.status(500).json({ message: "Server configuration error." });
            }

            const adminRole = await Role.findOne({ name: 'admin' });
            if (!adminRole) {
                console.error("Admin role not found in database.");
                return res.status(500).json({ message: "Server configuration error." });
            }

            // 2. Get the current user's blocked users
            const currentUser = await User.findById(currentUserId).select("blockedUsers");
            const blockedByMe = currentUser?.blockedUsers || [];

            // 3. Find users who blocked the current user
            const blockedMe = await User.find({ blockedUsers: currentUserId }).select("_id");
            const blockedMeIds = blockedMe.map(u => u._id);

            // Combine both block lists
            const excludedIds = [...blockedByMe, ...blockedMeIds, currentUserId];

            let searchFilter = {};
            const isNumericId = /^\d+$/.test(query);

            if (isNumericId) {
                searchFilter = { userId: parseInt(query) };
            } else {
                const regex = new RegExp(query, 'i');
                searchFilter = {
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                        { userName: regex }
                    ]
                };
            }

            // 4. Main query: exclude self, blocked users, developers, admins
            const users = await User.find({
                ...searchFilter,
                _id: { $nin: excludedIds },
                role: { $nin: [developerRole._id, adminRole._id] }
            })
                .select("firstName lastName userName profile.profilePic userId role")
                .limit(10);

            res.json(users);
        } catch (err) {
            console.error("Search Users Error:", err);
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new FriendController();