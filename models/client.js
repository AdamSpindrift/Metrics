const { string } = require("assert-plus");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    _id: String,
    ClientName: String,
    ClientState: String,
    ClientType: String,
    Company: String,
    AccManager: String,
    Budgets: Array,
    YearlyFee: Number,
    ProfitLossMilliseconds: Number,
    ProfitLossFee: Number,
    AHR: Number,
    XeroTenantID: String,
    TransactionBandLow: Number,
    TransactionBandHigh: Number,
    Team: String,
});

module.exports = mongoose.model("Client", clientSchema);