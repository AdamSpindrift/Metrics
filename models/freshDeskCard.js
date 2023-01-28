const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FreshdeskCard = new Schema({
    UserName: String,
    CompanyName: String,
    CompanyId: Schema.Types.ObjectId,
    StartDate: Date,
    EndDate: Date,
    FirstResponseViolations: Number,
    Team: String,
});

module.exports = mongoose.model("FreshdeskCard", FreshdeskCard);