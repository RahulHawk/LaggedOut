const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: "Game",
        required: true
    },
    edition: {
        type: String, 
        default: "Standard Edition"
    },
    dlc: {
        type: Schema.Types.ObjectId,
        ref: "Game.dlcs" 
    },
    pricePaid: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String, 
        required: true
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
