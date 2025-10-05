const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const saleSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    games: [{
        game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
        discount: { type: Number, required: true } 
    }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

const Sale = mongoose.model("Sale", saleSchema);
module.exports = Sale;
