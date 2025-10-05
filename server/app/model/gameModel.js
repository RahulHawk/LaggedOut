const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const editionSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    coverImage: String,
    bonusContent: {
        avatars: [{
            type: Schema.Types.ObjectId,
            ref: "Avatar"
        }]
    },
    includesDLCs: [{
        type: Schema.Types.ObjectId,
        ref: "Game.dlcs"
    }]
}, { timestamps: true });


const dlcSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, default: 0 },
    coverImage: String,
    screenshots: [String],
    trailer: String,
    releaseDate: Date,
    systemRequirements: {
        minimum: String,
        recommended: String
    },
    bonusContent: {
        avatars: [{
            type: Schema.Types.ObjectId,
            ref: "Avatar"
        }]
    },
    developer: { type: Schema.Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: false }
}, { timestamps: true });   


const gameSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    basePrice: { type: Number, required: true, default: 0 },
    salePrice: { type: Number, default: null },
    onSale: { type: Boolean, default: false },
    coverImage: { type: String, required: true },
    screenshots: [String],
    trailer: String,
    websiteUrl: String,
    releaseDate: Date,

    bonusContent: {
        avatars: [{
            type: Schema.Types.ObjectId,
            ref: "Avatar"
        }]
    },

    genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],

    systemRequirements: {
        minimum: String,
        recommended: String
    },

    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    starBreakdown: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 }
    },

    developer: { type: Schema.Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: false },

    dlcs: [dlcSchema],
    editions: [editionSchema]

}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
module.exports = Game;