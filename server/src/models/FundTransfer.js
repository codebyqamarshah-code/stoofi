const mongoose = require("mongoose");
const schema = new mongoose.Schema({ fromAccount: String, toAccount: String, amount: Number, date: Date, reference: String }, { timestamps: true });
module.exports = mongoose.model("FundTransfer", schema);