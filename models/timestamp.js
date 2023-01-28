const { string } = require("assert-plus");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeStampSchema = new Schema({
    _id: String,
    Company: String,
    EmployeeName: String,
    EmployeeCostPerHour: Number,
    JobTitle: String,
    JobId: String,
    ClientName: String,
    ClientId: String,
    StartTime: Date,
    EndTime: Date,
    Duration: Number,
    Description: String,
    Cost: Number,
    ManualEdit: Boolean,
});

module.exports = mongoose.model("TimeStamp", timeStampSchema);