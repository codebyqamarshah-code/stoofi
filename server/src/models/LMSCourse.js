const mongoose = require("mongoose");
const schema = new mongoose.Schema({ title: String, category: String, chapters: Number, price: Number, class: String, status: String, createdBy: String }, { timestamps: true });
module.exports = mongoose.model("LMSCourse", schema);