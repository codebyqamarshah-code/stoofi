const mongoose = require("mongoose");
const schema = new mongoose.Schema({ name: String, type: String }, { timestamps: true });
module.exports = mongoose.model("ChartOfAccount", schema);