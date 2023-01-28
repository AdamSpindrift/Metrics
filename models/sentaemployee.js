const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sentaEmployeeSchema = new Schema({
    fName: String,
    lName: String,
    JobTitle: String,
    ActiveTime: String,
    VATReturn: Array,
    PAYE: Array,
    Bookkeeping: Array,
    PersonalTaxReturn: Array,
    AccountsProduction: Array,
    WTargetVATReturn: Number,
    WTargetPAYE: Number,
    WTargetBookkeeping: Number,
    WTargetPersonalTaxReturn: Number,
    WTargetAccountsProduction: Number,
    QTargetVATReturn: Number,
    QTargetPAYE: Number,
    QTargetBookkeeping: Number,
    QTargetPersonalTaxReturn: Number,
    QTargetAccountsProduction: Number,
});

module.exports = mongoose.model("SentaEmployee", sentaEmployeeSchema);