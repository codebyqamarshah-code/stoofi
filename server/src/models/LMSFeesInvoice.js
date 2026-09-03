const mongoose = require("mongoose");
const schema = new mongoose.Schema({ student: String, amount: Number, waiver: Number, fine: Number, paid: Number, balance: Number, status: String, date: Date }, { timestamps: true });
module.exports = mongoose.model("LMSFeesInvoice", schema);