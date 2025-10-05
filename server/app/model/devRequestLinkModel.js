const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const devRequestLinkSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("DevRequestLink", devRequestLinkSchema);
