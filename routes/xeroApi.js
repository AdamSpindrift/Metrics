// Environment Variables
require('dotenv').config();
//Express
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("../models/company");
const SentaEmployee = require("../models/sentaemployee");
const User = require("../models/user");
const Budget = require("../models/budget");
const Client = require("../models/client");
const Job = require("../models/job");
const TimeStamp = require("../models/timestamp");
const TransactionCount = require("../models/transactionCount");
// KPI Mongoose Models
const CompanyKPI = require("../models/companykpi");
const JobRole = require("../models/jobrole");
const KPIEmployee = require("../models/kpiEmployee");
const KPI = require("../models/kpi");
const KPITarget = require("../models/kpiTarget");
const KPITemplate = require("../models/kpiTemplate");
// Other Imports
const axios = require("axios");
const qs = require('query-string');
const request = require("request");
const path = require("path");
const uniqid = require("uniqid");
const { subMonths, startOfMonth } = require("date-fns");
// Custom modules
const isCompanyNull = require("../custom_modules/companyNull");
const { title } = require("process");
// Exporter
const { parse } = require("json2csv");
const { addDays } = require("date-fns");
// Xero
const {
    Account,
    Accounts,
    AccountType,
    Allocation,
    Allocations,
    BankTransaction,
    BankTransactions,
    BankTransfer,
    BankTransfers,
    BatchPayment,
    BatchPayments,
    Contact,
    ContactGroup,
    ContactGroups,
    ContactPerson,
    Contacts,
    Currency,
    CurrencyCode,
    Employees,
    HistoryRecords,
    Invoice,
    Invoices,
    Item,
    Items,
    LineAmountTypes,
    LineItem,
    LinkedTransaction,
    LinkedTransactions,
    ManualJournal,
    ManualJournals,
    Payment,
    Payments,
    PaymentServices,
    Prepayment,
    PurchaseOrder,
    PurchaseOrders,
    Quote,
    Quotes,
    Receipt,
    Receipts,
    TaxRate,
    TaxRates,
    TaxType,
    TrackingCategories,
    TrackingCategory,
    TrackingOption,
    XeroAccessToken,
    XeroClient,
    XeroIdToken,
    CreditNotes,
    CreditNote,
    Employee,} = require("xero-node");
const jwtDecode = require("jwt-decode");
const { TokenSet } = require('openid-client');
const transactionCount = require('../models/transactionCount');


// Setup Express
const app = express();

app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.use(express.static("client/build"));

// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

// Close Mongo on app exit
process.on("exit", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});

process.on("SIGINT", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});

process.on("SIGUSR1", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});

process.on("SIGUSR2", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});


// Xero Setup
const clientId = process.env.XERO_CLIENT_ID;
const clientSecret = process.env.XERO_CLIENT_SECRET1;
const redirectUrl = process.env.XERO_REDIRECT_URI;
const state = process.env.XERO_STATE;
const referralId = process.env.XERO_REFERRAL_ID;
const xeroAuthHeader = process.env.XERO_AUTH_HEADER;
const scopes = "offline_access openid profile email accounting.transactions accounting.budgets.read accounting.reports.read accounting.journals.read accounting.settings accounting.settings.read accounting.contacts accounting.contacts.read accounting.attachments accounting.attachments.read files files.read assets assets.read projects projects.read payroll.employees payroll.payruns payroll.payslip payroll.timesheets payroll.settings";

const xeroClient = new XeroClient({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUris: redirectUrl,
    scopes: scopes.split(" "),
    state: state,
    httpTimeout: 3000,
});

xeroClient.initialize();






router.post("/sendweeklyreport2", async (req, res) => {

    newRequest = req.body.reportDetails;

    User.findOne({Company: newRequest.company, FirstName: newRequest.fName, LastName: newRequest.lName},
        async function(err, user){
            if(err) {
                
            console.log("Find User Error: " + err);
            res.status(500).send("Find User Error");
             throw (err);
            } else {

                await sendReport2(user.Email, newRequest.fName, newRequest.company, newRequest.reportName, newRequest.startDate, newRequest.endDate);

                console.log(newRequest.reportName + " for " + newRequest.company + " sent.");
                res.status(200).send("Report Sent");
            };
        }).lean();

    

});

router.post("/gettoken", async (req, res) => {

    const newRequest = req.body.authDetails;

    const removeCompany = "_" + newRequest.name;

    const url = newRequest.url.replace(removeCompany, "");

    let data = qs.stringify({
      'grant_type': 'authorization_code',
      'code': newRequest.code,
      'redirect_uri': redirectUrl 
    });
    let config = {
      method: 'post',
      url: 'https://identity.xero.com/connect/token',
      headers: { 
        'Authorization': "Basic " + xeroAuthHeader.toString(), 
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
      data : data
    };

    axios(config)
    .then(function (response) {
        // console.log(JSON.stringify(response.data));

        const responseData = response.data;
        console.log("//////////////// Xero Auth Success //////////////////////// Xero Auth Success /////////////////////");

        // const decodedToken = jwtDecode(responseData.access_token);

        Company.findOneAndUpdate({Name: newRequest.name},{$set: {XeroTokenSet: responseData}},{new: true}, function(err) {
            if(err){
                console.log("Company Not Found" + err);
                res.status(401).send("Company Not Found");
                return;
            } else {
                
                console.log("Tokens Updated")
            }
        }).lean()

        // Get Tenants
        let configTenants = {
            method: 'get',
            url: 'https://api.xero.com/connections',
            headers: { 
              'Authorization': 'Bearer ' + responseData.access_token, 
              'Content-Type': 'application/json', 
            }
          };

          axios(configTenants)
            .then(function (response) {

                Company.findOneAndUpdate({Name: newRequest.name},{$set: {AuthorisedTenants: response.data}},{new: true}, function(err, foundCompany) {
                    if(err){
                        console.log("Company Not Found" + err);
                        res.status(401).send("Company Not Found");
                        return;
                    } else {
                        res.json({
                            message: "Company and Token Updated",
                            company: foundCompany,
                        });
                        console.log("Tenants Updated");
                        return;
                    }
                }).lean()
            })
            .catch(function (error) {
                if (error.response) {
                    console.log("Response Error Message Config Tenants" - error.message);
                    console.log("Metrics Xero Response Error Config Tenants Data - " + error.response.data);
                    console.log("Metrics Xero Response Error Config Tenants Status - " + error.response.status);
                    console.log("Metrics Xero Response Error Config Tenants Headers - " + error.response.headers);
                    throw(error);
                } else if (error.request) {
                    console.log("Request Error Message Config Tenants" - error.message);
                    console.log("Metrics Xero Request Error Config Tenants Data - " + error.request.data);
                    console.log("Metrics Xero Request Error Config Tenants Status - " + error.request.status);
                    console.log("Metrics Xero Request Error Config Tenants Headers - " + error.request.headers);
                    throw(error);
                } else {
                    console.log("//////////////////////Metrics Xero Error - Other - Config Tenants////////////////////// - " + error.message);
                    throw(error);
                };
        
            });




    }) //Catch for code exchange
    .catch(function (error) {
        if (error.response) {
            console.log("Response Error Message" - error.message);
            console.log("Metrics Xero Response Error Data - " + error.response.data);
            console.log("Metrics Xero Response Error Status - " + error.response.status);
            console.log("Metrics Xero Response Error Headers - " + error.response.headers);
            
            res.status(400).json({
                message: "Xero Error",
            });
            throw(error);
        } else if (error.request) {
            console.log("Request Error Message" - error.message);
            console.log("Metrics Xero Request Error Data - " + error.request.data);
            console.log("Metrics Xero Request Error Status - " + error.request.status);
            console.log("Metrics Xero Request Error Headers - " + error.request.headers);
            res.status(400).json({
                message: "Xero Error",
            });
            throw(error);
        } else {
            console.log("//////////////////////Metrics Xero Error - Other////////////////////// - " + error.message);
            res.status(400).json({
                message: "Xero Error",
            });
            throw(error);
        };

    });                  

});

router.post("/updatexeroauth", (req, res) => {

    newRequest = req.body.authObject;

    Company.findOneAndUpdate({Name: newRequest.name},{$set: {CodeVerifier: newRequest.codeVerifier}},{new: true}, function(err) {
        if(err){
            console.log("Company Not Found" + err);
            res.status(401).send("Company Not Found");
            return;
        } else {
            
            console.log("Auth Object Updated");
            return;
        }
    }).lean();

});


const refreshXero = (company) => {

    console.log("Refreshing Xero");

    Company.findOne({Name: company},
        async function(err, foundCompany){
            if(err) {
                
            console.log("Find Company Error: " + err);
            res.status(500).send("Find Company Error");
             throw (err);
            } else {

                const oldToken = foundCompany.XeroTokenSet;

                let data = qs.stringify({
                    'grant_type': 'refresh_token',
                    'refresh_token': oldToken.refresh_token
                  });
                  let config = {
                    method: 'post',
                    url: 'https://identity.xero.com/connect/token',
                    headers: { 
                      'Authorization': "Basic " + xeroAuthHeader.toString(), 
                      'Content-Type': 'application/x-www-form-urlencoded', 
                    },
                    data : data
                  };

                  console.log("Posting for Refresh Token");
              
                  axios(config)
                  .then(function (response) {
                     

                    const responseData = response.data;
                    console.log("//////////////// Xero Auth Success //////////////////////// Xero Auth Success /////////////////////");

                    xeroClient.setTokenSet(responseData);

                    Company.findOneAndUpdate({Name: company},{$set: {XeroTokenSet: responseData}},{new: true}, function(err) {
                        if(err){
                            console.log("Company Not Found" + err);
                            res.status(401).send("Company Not Found");
                            return;
                        } else {
                
                            console.log("Tokens Updated")
                         };
                    }).lean();
                })

                .catch(function (error) {
                    if (error.response) {
                        console.log("Response Error Message Config Tenants" - error.message);
                        console.log("Metrics Xero Response Error Config Tenants Data - " + error.response.data);
                        console.log("Metrics Xero Response Error Config Tenants Status - " + error.response.status);
                        console.log("Metrics Xero Response Error Config Tenants Headers - " + error.response.headers);
                        throw(error);
                    } else if (error.request) {
                        console.log("Request Error Message Config Tenants" - error.message);
                        console.log("Metrics Xero Request Error Config Tenants Data - " + error.request.data);
                        console.log("Metrics Xero Request Error Config Tenants Status - " + error.request.status);
                        console.log("Metrics Xero Request Error Config Tenants Headers - " + error.request.headers);
                        throw(error);
                    } else {
                        console.log("//////////////////////Metrics Xero Error - Other - Config Tenants////////////////////// - " + error.message);
                        throw(error);
                    };
            
                });
            }

    }).lean();
};




router.post("/gettenants", async (req, res) => {

    const newRequest = req.body.tenantDetails;
    
    Company.findOne({Name: newRequest.company},
        async function(err, foundCompany){
            if(err) {
                
            console.log("Find Company Error: " + err);
            res.status(500).send("Find Company Error");
             throw (err);
            } else {

                res.status(200).json({
                    message: "Xero Tenants found",
                    tenants: foundCompany.AuthorisedTenants,
                });
            };
    }).lean();
    
});


router.post("/settenanttoclient", async (req, res) => {

    const newRequest = req.body.tenantDetails2;

    console.log("Updating Xero Tenant ID");
    
    Client.findByIdAndUpdate(newRequest.clientId, {
        $set: {XeroTenantID: newRequest.tenantId}},
        function(err){
            if(err) {
                
            console.log("Find Company Error: " + err);
            res.status(500).send("Find Company Error");
             throw (err);
            } else {

                Client.find({Company: newRequest.company}, function (err, foundClients) {
                    if(err) {             
                        console.log("Timestamp Job Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    };

                    res.status(200).json({
                        message: "Xero Tenant ID Updated",
                        clients: foundClients, 
                    });
                }).lean();

                
            };
    }).lean();
    
});


router.post("/gettenants", (req, res) => {

    const newRequest = req.body.tenantDetails;

    Company.findOne({Name: newRequaest.company}, function(err, foundCompany){
        if(err) {
            console.log("Employees not found error: " + err);
            res.status(404).send("Employees not found")
            throw (err);

        } else {
            res.status(200).json({
                message: "Xero Tenants found",
                tenants: foundComapany.AuthorisedTenants,
            });
        };
        
    }).lean();
    

});

router.post("/settenant", (req, res) => {

    const newRequest = req.body.tenantDetails;

    
    Client.findOneAndUpdate({Name: newRequest.company}, {
        $set: {AuthorisedTenants: newRequest.tenantName,
                }}, function (err) {
        if(err) {             
            console.log("Timestamp Client Error: " + err);
            res.status(500).send("Time Stamp Client Error");
            throw (err);
        } else {

            res.status(200).json({
                message: "Tenant Updated",
            }); 
        }  ;  

    }).lean();

});


// Routes for Front End data fetch

router.post("/getxerodata", async (req, res) => {

    const newRequest = req.body.clientDetails;

    TransactionCount.find({ ClientID : newRequest.clientId }, function(err, foundTransactions){
        if(err) {
            console.log("Transactions not found error: " + err);
            res.status(404).send("Transactions not found")
            throw (err);

        } else {
            res.status(200).json({
                message: "Xero Transactions found",
                transactions: foundTransactions,
            });
        };
        
    }).lean();

});

module.exports = router;