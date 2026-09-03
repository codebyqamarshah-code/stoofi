const mongoose = require("mongoose");
const schema = new mongoose.Schema({ studentName: String, date: Date, amount: Number, note: String, status: String }, { timestamps: true });
module.exports = mongoose.model("LMSPurchaseLog", schema);