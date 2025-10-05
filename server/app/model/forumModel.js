const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forumSchema = new Schema({
    game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    type: { type: String, enum: ["discussion", "announcement"], default: "discussion" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            text: { type: String, required: true },
            likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
            dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Forum = mongoose.models.Forum || mongoose.model("Forum", forumSchema);
module.exports = Forum;
