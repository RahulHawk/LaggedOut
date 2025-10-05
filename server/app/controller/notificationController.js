const Notification = require("../model/notificationModel");

class NotificationController {

    // --- Create a new notification ---
    async createNotification(req, res) {
        try {
            const { user, type, content, link, relatedUser, meta } = req.body;

            const notification = new Notification({
                user,
                type,
                content,
                link,
                relatedUser,
                meta
            });

            await notification.save();
            res.status(201).json({ message: "Notification created", notification });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // --- Get all notifications for logged-in user ---
    async getUserNotifications(req, res) {
        try {
            const userId = req.user._id;
            const notifications = await Notification.find({ user: userId })
                .sort({ createdAt: -1 })
                .populate("relatedUser", "firstName profile.profilePic");

            if (!notifications || notifications.length === 0) {
                return res.status(200).json({ message: "No notifications found", notifications: [] });
            }

            res.status(200).json({ notifications });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // --- Mark a single notification as read ---
    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user._id;

            const notification = await Notification.findOne({ _id: notificationId, user: userId });
            if (!notification) return res.status(404).json({ message: "Notification not found" });

            notification.read = true;
            await notification.save();

            res.json({ message: "Notification marked as read", notification });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // --- Mark all notifications as read ---
    async markAllAsRead(req, res) {
        try {
            const userId = req.user._id;

            await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });

            res.json({ message: "All notifications marked as read" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // --- Delete a notification ---
    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user._id;

            const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
            if (!notification) return res.status(404).json({ message: "Notification not found" });

            res.json({ message: "Notification deleted" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // --- Delete all notifications ---
    async deleteAllNotifications(req, res) {
        try {
            const userId = req.user._id;

            await Notification.deleteMany({ user: userId });

            res.json({ message: "All notifications deleted" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new NotificationController();
