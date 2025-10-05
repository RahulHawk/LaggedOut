const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const banHistorySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    action: {
        type: String,
        enum: ["ban", "unban"],
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const BanHistory = mongoose.model("BanHistory", banHistorySchema);
module.exports = BanHistory;
