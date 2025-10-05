const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const refundSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    purchase: { type: Schema.Types.ObjectId, ref: "Purchase", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" }, 
    reviewedAt: Date
}, { timestamps: true });

const Refund = mongoose.model("Refund", refundSchema);
module.exports = Refund;
