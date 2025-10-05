const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Game = require("./gameModel");

const genreSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });


genreSchema.pre('findOneAndDelete', async function (next) {
  try {
    const genreId = this.getQuery()['_id'];

    await Game.updateMany(
      { genre: genreId },
      { $pull: { genre: genreId } }
    );

    next(); 
  } catch (error) {
    next(error); 
  }
});


const Genre = mongoose.model("Genre", genreSchema);
module.exports = Genre;