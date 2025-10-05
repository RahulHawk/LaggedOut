const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const avatarSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: "Game"  
    },
    developer: {
        type: Schema.Types.ObjectId,
        ref: "User"  
    }
}, { timestamps: true });

const Avatar = mongoose.model("Avatar", avatarSchema);
module.exports = Avatar;
