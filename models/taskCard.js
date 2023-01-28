const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskCard = new Schema({
    UserName: String,
    CompanyName: String,
    CompanyId: Schema.Types.ObjectId,
    StartDate: Date,
    EndDate: Date,
    TotalJobs: Number,
    CompletedJobs: Number,
    OverdueTasks: Number,
    CancelledTasks: Number,
    Team: String,
});

module.exports = mongoose.model("TaskCard", TaskCard);