const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Service = new Schema({
    Company: String,
    Name: String,
    Jobs: Array,
    Frequency: String,
});

module.exports = mongoose.model("Service", Service);