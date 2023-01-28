const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    FirstName: String,
    LastName: String,
    Company: String,
    Email: String,
    Password: String,
    Access: String,
    ActiveTime: String,
    ActiveUser: Boolean,
    TodaysStamps: Array,
    CostPerHour: Number,
    DayComplete: Boolean,
    EmailVerified: Boolean,
    JobTitle: String,
    KPITargets: Array,
    WorkingHoursDay: Number,
    WorkingDaysWeek: Number,
})

module.exports = mongoose.model("User", userSchema);