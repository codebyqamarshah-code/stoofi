const mongoose = require("mongoose");
const schema = new mongoose.Schema({ course: String, student: String, paidAmount: Number, instructor: String, paymentMethod: String, purchaseDate: Date }, { timestamps: true });
module.exports = mongoose.model("LMSEnrollHistory", schema);