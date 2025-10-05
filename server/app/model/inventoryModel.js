const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    avatars: [{
        type: Schema.Types.ObjectId,
        ref: "Avatar"
    }],
    badges: [{
        type: Schema.Types.ObjectId,
        ref: "Badge"
    }]
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
