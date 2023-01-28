const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const KPIEmployeeSchema = new Schema({
    Name: String,
    JobRole: String,
    KPITargets: Array,
})

module.exports = mongoose.model("KPIEmployee", KPIEmployeeSchema);