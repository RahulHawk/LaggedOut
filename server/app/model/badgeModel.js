const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const badgeSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: String
}, { timestamps: true });

const Badge = mongoose.model("Badge", badgeSchema);
module.exports = Badge;
