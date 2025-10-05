const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Game = require("./gameModel");

const tagSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });


tagSchema.pre('findOneAndDelete', async function (next) {
    try {
        const tagId = this.getQuery()['_id'];

        await Game.updateMany(
            { tags: tagId },
            { $pull: { tags: tagId } }
        );

        next();
    } catch (error) {
        next(error);
    }
});

const Tag = mongoose.model("Tag", tagSchema);
module.exports = Tag;