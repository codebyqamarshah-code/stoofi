const mongoose = require("mongoose");
const schema = new mongoose.Schema({ title: String, amount: Number, category: String, date: Date, paymentMethod: String }, { timestamps: true });
module.exports = mongoose.model("Income", schema);