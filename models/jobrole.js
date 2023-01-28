const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobRoleSchema = new Schema({
    Name: String,
    KPIs: Array,
})

module.exports = mongoose.model("JobRole", jobRoleSchema);