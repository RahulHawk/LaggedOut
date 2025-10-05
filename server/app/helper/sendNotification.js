const Notification = require("../model/notificationModel");

/**
 * Send a notification to a user or multiple users
 * @param {Object} options
 * @param {String|Array} options.user - User ID or array of user IDs
 * @param {String} options.type - Notification type (friend_request, comment, like, sale, etc.)
 * @param {String} options.content - Notification message
 * @param {String} [options.relatedUser] - User ID who triggered this notification
 * @param {String} [options.link] - Optional link to redirect frontend
 * @param {Object} [options.meta] - Optional extra data
 */
const sendNotification = async ({ user, type, content, relatedUser = null, link = null, meta = {} }) => {
    try {
        const notifications = [];

        if (Array.isArray(user)) {
            user.forEach(u => {
                notifications.push({
                    user: u,
                    type,
                    content,
                    relatedUser,
                    link,
                    meta
                });
            });
            await Notification.insertMany(notifications);
        } else {
            await Notification.create({
                user,
                type,
                content,
                relatedUser,
                link,
                meta
            });
        }
    } catch (err) {
        console.error("Error sending notification:", err.message);
    }
};

module.exports = sendNotification;
