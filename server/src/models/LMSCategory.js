const mongoose = require("mongoose");
const schema = new mongoose.Schema({ name: String, description: String, parent: String, position: String, status: String }, { timestamps: true });
module.exports = mongoose.model("LMSCategory", schema);