const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const KPI = new Schema({
    Name: String,
    KPIEmployee: String,
    Date: Date,
    Notes: String,
    MonthlyActual: Number,
    MonthlyTarget: Number,
    Week1Actual: Number,
    Week2Actual: Number,
    Week3Actual: Number,
    Week4Actual: Number,
    Week1Target: Number,
    Week2Target: Number,
    Week3Target: Number,
    Week4Target: Number,
})

module.exports = mongoose.model("KPI", KPI);