const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const achievementSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    condition: { type: String, required: true },
    badge: { type: Schema.Types.ObjectId, ref: "Badge" }
}, { timestamps: true });

const Achievement = mongoose.model("Achievement", achievementSchema);
module.exports = Achievement;
