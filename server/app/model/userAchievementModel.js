const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userAchievementSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    achievement: { type: Schema.Types.ObjectId, ref: "Achievement", required: true },
    earnedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema);
module.exports = UserAchievement;
