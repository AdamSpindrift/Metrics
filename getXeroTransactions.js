// Environment Variables
require('dotenv').config();
//Express
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const User = require("./models/user");
const Budget = require("./models/budget");
const Client = require("./models/client");
const Job = require("./models/job");
const TimeStamp = require("./models/timestamp");
const TransactionCount = require("./models/transactionCount");
const WellpleasedT = require("./models/wellpleasedT");
// KPI Mongoose Models
const CompanyKPI = require("./models/companykpi");
const JobRole = require("./models/jobrole");
const KPIEmployee = require("./models/kpiEmployee");
const KPI = require("./models/kpi");
const KPITarget = require("./models/kpiTarget");
const KPITemplate = require("./models/kpiTemplate");
// Other Imports
const axios = require("axios");
const qs = require('query-string');
const request = require("request");
const path = require("path");
const { subMonths, startOfMonth, getMonth, getDay, getYear, lastDayOfMonth, formatISO, format } = require("date-fns");
// Custom modules
const { title } = require("process");
// Exporter
const { parse } = require("json2csv");
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};



const refreshXero = (company) => {

    console.log("Refreshing Xero");

    Company.findOne({Name: company},
        async function(err, foundCompany){
            if(err) {
                
            console.log("Find Company Error: " + err);
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


const getBank = async (company, clientID) => {

    let bankTransactionLength = 0;
    let transferLength = 0;
    let paymentsLength = 0;
    let salesInvoiceLength = 0;
    let purchaseInvoiceLength = 0;
    let unReconciled = [];
    let bankT = [];

    console.log("Getting Bank Transactions");

    await refreshXero(company);

    sleep(30000);

    console.log("Refresh Token recieved");

    Company.findOne({Name: company},  function (err, foundCompany) {
        if(err) {             
            console.log("Find Company Error: " + err);
            throw (err);
        } else {

            const xeroToken = foundCompany.XeroTokenSet;


    Client.findById(clientID, async function(err, foundClient) {
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        const modifiedSince = startOfMonth(subMonths(new Date(), 1));
        const day = getDay(modifiedSince);
        const month = getMonth(modifiedSince);
        const year= getYear(modifiedSince);
        const startDate = new Date(year, month, day);
        const endDate = new Date(year, month+1, day);

        console.log("Trying BankTransactions");
        

        // let configBank = {
        //     method: 'get',
        //     url: 'https://api.xero.com/api.xro/2.0/BankTransactions/',
        //     headers: { 
        //       'Authorization': "Bearer " + xeroToken.access_token,
        //       'xero-tenant-id': foundClient.XeroTenantID,
        //       'Accept': 'application/json',
        //       'Content-Type': 'application/json',
        //     },
        // };

        // let configInvoice = {
        //     method: 'get',
        //     url: 'https://api.xero.com/api.xro/2.0/Invoices/',
        //     headers: { 
        //       'Authorization': "Bearer " + xeroToken.access_token,
        //       'xero-tenant-id': foundClient.XeroTenantID,
        //       'Accept': 'application/json',
        //       'Content-Type': 'application/json',
        //       "summaryOnly": "true",
        //     },
        // };

        let configBank = {
            method: 'get',
            url: 'https://api.xero.com/api.xro/2.0/BankTransactions/',
            headers: { 
              'Authorization': "Bearer " + xeroToken.access_token,
              'xero-tenant-id': foundClient.XeroTenantID,
              'Accept': 'application/json',
              'If-Modified-Since' : format(new Date(year, month, 1, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss"),
              'Content-Type': 'application/json',
            },
        };

        let configTransfers = {
            method: 'get',
            url: 'https://api.xero.com/api.xro/2.0/BankTransfers/',
            headers: { 
              'Authorization': "Bearer " + xeroToken.access_token,
              'xero-tenant-id': foundClient.XeroTenantID,
              'Accept': 'application/json',
              'If-Modified-Since' : format(new Date(year, month, 1, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss"),
              'Content-Type': 'application/json',
            },
        };

        let configPayments = {
            method: 'get',
            url: 'https://api.xero.com/api.xro/2.0/Payments/',
            headers: { 
              'Authorization': "Bearer " + xeroToken.access_token,
              'xero-tenant-id': foundClient.XeroTenantID,
              'Accept': 'application/json',
              'If-Modified-Since' : format(new Date(year, month, 1, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss"),
              'Content-Type': 'application/json',
            },
        };

        let configInvoice = {
            method: 'get',
            url: 'https://api.xero.com/api.xro/2.0/Invoices/',
            headers: { 
              'Authorization': "Bearer " + xeroToken.access_token,
              'xero-tenant-id': foundClient.XeroTenantID,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'If-Modified-Since' : format(new Date(year, month, 1, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss"),
              "summaryOnly": "true",
            },
        };

        console.log("Posting for Refresh Token");

        let filterAfter = [];
          
        axios(configBank)
        .then(async function (response) {

            const responseData = response.data;
            const bankTransactions = responseData.BankTransactions;
            const filterBefore = await bankTransactions.filter(b => new Date(b.DateString) >= startDate);
            filterAfter = await filterBefore.filter(b => new Date(b.DateString) < endDate);
            unReconciled = filterAfter.filter(b => b.IsReconciled === false);

            bankT = filterAfter;

            console.log("//////////////// Recieved Bank Transactions //////////////////////// Recieved Bank Transactions /////////////////////");
            
            bankTransactionLength = filterAfter.length;
        
        })

        .catch(function (error) {
            if (error.response) {
                console.log("Response Error Message Bank Transactions" - error.message);
                console.log("Metrics Xero Response Error Bank Transactions Data - " + error.response.data);
                console.log("Metrics Xero Response Error Bank Transactions Status - " + error.response.status);
                console.log("Metrics Xero Response Error Bank Transactions Headers - " + error.response.headers);
                throw(error);
            } else if (error.request) {
                console.log("Request Error Message Bank Transactions" - error.message);
                console.log("Metrics Xero Request Error Bank Transactions Data - " + error.request.data);
                console.log("Metrics Xero Request Error Bank Transactions Status - " + error.request.status);
                console.log("Metrics Xero Request Error Bank Transactions Headers - " + error.request.headers);
                throw(error);
            } else {
                console.log("//////////////////////Metrics Xero Error - Other - Bank Transactions////////////////////// - " + error.message);
                throw(error);
            };
        
        });

        axios(configTransfers)
        .then(async function (response) {

            const responseData = response.data;
            const bankTransfers = responseData.BankTransfers;
            const filterBefore = await bankTransfers.filter(b => new Date(b.DateString) >= startDate);
            const filterAfter = await filterBefore.filter(b => new Date(b.DateString) < endDate);

            console.log("//////////////// Recieved Bank Transfers //////////////////////// Recieved Bank Transfers ///////////////////// ");
            
            transferLength = filterAfter.length;
        
        })

        .catch(function (error) {
            if (error.response) {
                console.log("Response Error Message Bank Transfer" - error.message);
                console.log("Metrics Xero Response Error Bank Transfer Data - " + error.response.data);
                console.log("Metrics Xero Response Error Bank Transfer Status - " + error.response.status);
                console.log("Metrics Xero Response Error Bank Transfer Headers - " + error.response.headers);
                throw(error);
            } else if (error.request) {
                console.log("Request Error Message Bank Transfer" - error.message);
                console.log("Metrics Xero Request Error Bank Transfer Data - " + error.request.data);
                console.log("Metrics Xero Request Error Bank Transfer Status - " + error.request.status);
                console.log("Metrics Xero Request Error Bank Transfer Headers - " + error.request.headers);
                throw(error);
            } else {
                console.log("//////////////////////Metrics Xero Error - Other - Bank Transfer////////////////////// - " + error.message);
                throw(error);
            };
        
        });

        axios(configPayments)
        .then(async function (response) {

            const responseData = response.data;
            const payments = responseData.Payments;
            const paymentDates = payments.map(p => p.Date.split("(")[1]);
            const paymentDates2 = paymentDates.map(p => p.split("+")[0]);
            const mills = paymentDates2.map(p => parseInt(p));
            const filterBefore = await mills.filter(b => new Date(b) >= startDate);
            const filterAfter = await filterBefore.filter(b => new Date(b) < endDate);

            console.log("//////////////// Recieved Payments //////////////////////// Recieved Payments ///////////////////// ");
            
            paymentsLength = filterAfter.length;
        
        })

        .catch(function (error) {
            if (error.response) {
                console.log("Response Error Message Payments" - error.message);
                console.log("Metrics Xero Response Error Payments Data - " + error.response.data);
                console.log("Metrics Xero Response Error Payments Status - " + error.response.status);
                console.log("Metrics Xero Response Error Payments Headers - " + error.response.headers);
                throw(error);
            } else if (error.request) {
                console.log("Request Error Message Payments" - error.message);
                console.log("Metrics Xero Request Error Payments Data - " + error.request.data);
                console.log("Metrics Xero Request Error Payments Status - " + error.request.status);
                console.log("Metrics Xero Request Error Payments Headers - " + error.request.headers);
                throw(error);
            } else {
                console.log("//////////////////////Metrics Xero Error - Other - Payments////////////////////// - " + error.message);
                throw(error);
            };
        
        });

        axios(configInvoice)
        .then(async function (response) {

            const responseData = response.data;
            const invoices = responseData.Invoices;
            const filterIBefore = await invoices.filter(i => new Date(i.DateString) >= startDate);
            const filterIAfter = filterIBefore.filter(i => new Date(i.DateString) < endDate);
            const salesI = filterIAfter.filter(i => i.Type === "ACCPAY");
            const payI = filterIAfter.filter(i => i.Type === "ACCREC");
            const unRecInvoices = filterIAfter.filter(i => i.AmountDue > 0);

            console.log("//////////////// Recieved Invoices //////////////////////// Recieved Invoices /////////////////////");
        
            salesInvoiceLength = salesI.length;
            purchaseInvoiceLength = payI.length;

            
            // console.log(format(new Date(year, month, 1, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss"));



            setTimeout(() => {
                
                // console.log("Bank Transaction Length is - " + bankTransactionLength);
                // console.log("Sales Invoice Length is - " + salesInvoiceLength);
                // console.log("Purchase Invoice Length is - " + purchaseInvoiceLength);

                TransactionCount.create({
                    Company: company,
                    ClientID: clientID,
                    Date: lastDayOfMonth(startDate),
                    BankTransactions: bankTransactionLength + transferLength + paymentsLength,
                    PurchaseInvoices: salesInvoiceLength,
                    SalesInvoices: purchaseInvoiceLength,
                    UnReconciled: unReconciled.length + unRecInvoices.length,
                }, (err, ) => {
                    if(err) {
                        console.log("Add Transaction Error: " + err);
                        throw (err);
                    };
                });
                    
            }, 5000);
            
        
        })

        

        .catch(function (error) {
            if (error.response) {
                console.log("Response Error Message Invoices" - error.message);
                console.log("Metrics Xero Response Error Invoices Data - " + error.response.data);
                console.log("Metrics Xero Response Error Invoices Status - " + error.response.status);
                console.log("Metrics Xero Response Error Invoices Headers - " + error.response.headers);
                throw(error);
            } else if (error.request) {
                console.log("Request Error Message Invoices" - error.message);
                console.log("Metrics Xero Request Error Invoices Data - " + error.request.data);
                console.log("Metrics Xero Request Error Invoices Status - " + error.request.status);
                console.log("Metrics Xero Request Error Invoices Headers - " + error.request.headers);
                throw(error);
            } else {
                console.log("//////////////////////Metrics Xero Error - Other - Invoices////////////////////// - " + error.message);
                throw(error);
            };
        
        });
        


    }).lean();
    }
    }).lean();
};


const getTransactions = async () => {

    const foundCompanies = await Company.find({});

    const allCompanies = await foundCompanies.filter(c => c.Name !== "metrics");

        for (let i = 0; i < allCompanies.length; i++) {

            const currentCompany = allCompanies[i];

            Client.find({Company : currentCompany.Name}, async function(err, foundClients){
                if(err){
                    console.log("No Company Found " + err);
                    throw(err);
                };

                const authClients = foundClients.filter(c => c.XeroTenantID !== "");

                if(authClients.length !== 0) {

                    for (let i = 0; i<authClients.length; i++) {

                        
                        getBank(currentCompany.Name, authClients[i]._id);
                        
    
                    };
                };
                
                

            });

            setTimeout(() => {
                console.log("Closing Mongoose Connection");
                mongoose.disconnect();
            }, 120000);
    

        };
};



// getBank("djca", "ca9757af2fb51");

getTransactions();

