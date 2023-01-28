const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const KPITemplate = new Schema({
    Name: String,
    Description: String,
})

module.exports = mongoose.model("KPITemplate", KPITemplate);