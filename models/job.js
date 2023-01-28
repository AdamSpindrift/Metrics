const { string } = require("assert-plus");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    _id: String,
    ClientId: String,
    ClientName: String,
    Company: String,
    Wid: String,
    Title: String,
    Date: String,
    BudgetFee: Number,
    BudgetMilliseconds: Number,
    Timestamps: Array,
    Status: String,
    ProfitLossMilliseconds: Number,
    ProfitLossFee: Number,
    AHR: Number,
    Duration: Number,
    CompletedDate: Date,
    AccProdRevenue: Number,
});

module.exports = mongoose.model("Job", jobSchema);