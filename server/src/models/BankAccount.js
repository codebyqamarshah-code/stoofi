const mongoose = require("mongoose");
const schema = new mongoose.Schema({ name: String, accountNo: String, bankName: String, balance: Number }, { timestamps: true });
module.exports = mongoose.model("BankAccount", schema);