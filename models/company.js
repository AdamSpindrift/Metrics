const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema({
    Name: String,
    Logo: String,
    Application: String,
    AHR: Number,
    SentaAPIKey: String,
    ClientListActive: String,
    ClientListFormer: String,
    Employees: Array,
    Jobs: Array,
    Clients: Array,
    TimeStamps: Array,
    JobsArchive: Array,
    TimeStampsArchive: Array,
    XeroTokenSet: Object,
    CodeVerifier: String,
    Services: Array,
    AuthorisedTenants: Array,
    Teams: Array,
});

module.exports = mongoose.model("Company", companySchema);