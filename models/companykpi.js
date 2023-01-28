const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companykpiSchema = new Schema({
    Name: String,
    JobRoles: Array,
    KPITemplates: Array,
    KPIs: Array,
})

module.exports = mongoose.model("CompanyKPI", companykpiSchema);