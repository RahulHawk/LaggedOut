const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: { type: String, unique: true, required: true }, 
  description: { type: String } 
}, { timestamps: true });

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
