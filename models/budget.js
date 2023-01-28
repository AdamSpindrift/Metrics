const { string } = require("assert-plus");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
    _id: String,
    Title: String,
    Frequency: String,
    TotalBudget: Number,
    TotalBudgetHours: Number,
    TotalBudgetMinutes: Number,
    BudgetedFeePerJob: Number,
    BudgetedMillisecondsPerJob: Number,
    Visible: Boolean,
    MonthlyBudget: Number,
});

module.exports = mongoose.model("Budget", budgetSchema);