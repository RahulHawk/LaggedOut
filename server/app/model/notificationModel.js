const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["friend_request", "friend_accept", "follow", "comment", "like", "dislike", "sale", "announcement", "new_game", "game_update"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    relatedUser: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    read: {
        type: Boolean,
        default: false
    },
    meta: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
