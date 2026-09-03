const mongoose = require("mongoose");
const schema = new mongoose.Schema({ name: String, status: { type: Boolean, default: true } }, { timestamps: true });
module.exports = mongoose.model("LMSCourseLevel", schema);