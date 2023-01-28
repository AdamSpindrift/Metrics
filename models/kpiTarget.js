const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const KPITarget = new Schema({
    User: String,
    KPIName: String,
    Target: Number,
    Week1: Number,
    Week2: Number,
    Week3: Number,
    Week4: Number,
});

module.exports = mongoose.model("KPITarget", KPITarget);