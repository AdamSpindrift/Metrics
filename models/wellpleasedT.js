const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WellpleasedT = new Schema({
    Transactions: Array,
});

module.exports = mongoose.model("WellpleasedT", WellpleasedT);