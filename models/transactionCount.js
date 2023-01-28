const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionCount = new Schema({
    Company: String,
    ClientID: String,
    ClientName: String,
    Date: Date,
    BankTransactions: Number,
    TellerooTransactions: Number,
    TellerooPaymentRuns: Number,
});

module.exports = mongoose.model("TransactionCount", TransactionCount);