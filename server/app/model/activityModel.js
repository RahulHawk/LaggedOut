const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: "Game"
    },
    type: {
        type: String,
        enum: ["purchase", "review", "achievement"],
        required: true
    },
    details: {
        type: Schema.Types.Mixed
    },
}, { timestamps: true });

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;
