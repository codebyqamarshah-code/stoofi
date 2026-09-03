const mongoose = require("mongoose");
const schema = new mongoose.Schema({ time: String, status: String }, { timestamps: true });
module.exports = mongoose.model("SmsSendingTime", schema);