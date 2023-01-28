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
const TaskCard = require("../models/taskCard");
const FreshdeskCard = require("../models/freshDeskCard");
// Other Imports
const axios = require("axios");
const request = require("request");
const path = require("path");
const uniqid = require("uniqid");
const { addDays, sub} = require("date-fns");
// File Upload
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});
// Encryption
const bcrypt = require("bcrypt");
const saltRounds =  parseInt(process.env.SALT);
// Custom modules
const isCompanyNull = require("../custom_modules/companyNull");
const removeDupes = require("../custom_modules/removeDupes");
const { title } = require("process");
// Email
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
// CSV
const csv = require("csvtojson");




// Unique Object
// uniqueJobIDs = [...new Map(jobs.map(item => [JSON.stringify(item), item])).values()];



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

// Nodemailer
const myOAuth2Client = new OAuth2 (
    process.env.METRICS_OAUTH_CLIENT_ID,
    process.env.METRICS_OAUTH_SECRET,
    "https://developers.google.com/oauthplayground"
);

myOAuth2Client.setCredentials({
    refresh_token:process.env.REFRESH_TOKEN
});

const myAccessToken = myOAuth2Client.getAccessToken();

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "robots@metricsapp.io",
        clientId: process.env.METRICS_OAUTH_CLIENT_ID,
        clientSecret: process.env.METRICS_OAUTH_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: myAccessToken,
    }
});


function add(accumulator, a) {
    return accumulator + a;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};



function sendReport(email, fName, company, reportName, startDate, endDate) {

    TimeStamp.find({Company: "djca"}, async function(err, foundStamps) {
        if(err) {
            console.log("Get Timestamps Error: " + err);
            res.status(500).send("Get Timestamps Error");
            throw (err);
        } else {
            console.log("Sending Timestamps");

        try {

            const greaterStamps = await foundStamps.filter(t => new Date(t.StartTime) >= new Date(startDate));
            const stamps = await greaterStamps.filter(t => new Date(t.EndTime) <= addDays(new Date(endDate), 1));

            const fields1 = ['_id', 'Company', 'EmployeeName', "EmployeeCostPerHour", "JobTitle", "JobId", "ClientName", "ClientId", "StartTime", "EndTime", "Duration", "Description", "Cost", "ManualEdit"];
            const opts1 = { fields1 };
            const p1 = new Parser(opts1);

            const csv1 = await p1.parse(stamps);

            const mailOptions = {
                from: "robots@metricsapp.io",
                to: email,
                subject: "Metrics " + reportName,
                html: "<p>Hello " + fName + "</p><p>Here are your Timestamps.</p><p>Kind Regards<br>Metrics Team</p>",
                attachments: [{
                    filename: company + " " + reportName + ".csv",
                    content: csv1,
                    contentType: "text/csv",
                }]
            };

            transport.sendMail(mailOptions, function(err, result) {
                if(err){
                    console.error(err);
                    throw(err);
                } else {
                    transport.close();
                    console.log("Email Sent");
                };
            });


        } catch(err) {
            console.error(err);
        };

    }}).lean();
};


router.post("/sendweeklyreport", async (req, res) => {

    newRequest = req.body.reportDetails;

    User.findOne({Company: newRequest.company, FirstName: newRequest.fName, LastName: newRequest.lName},
        async function(err, user){
            if(err) {
                
            console.log("Find User Error: " + err);
            res.status(500).send("Find User Error");
             throw (err);
            } else {

                await sendReport(user.Email, newRequest.fName, newRequest.company, newRequest.reportName, newRequest.startDate, newRequest.endDate);

                console.log(newRequest.reportName + " for " + newRequest.company + " sent.");
                res.status(200).send("Report Sent");
            };
        }).lean();

    

});

router.post("/sendtransactiontemplate", async (req, res) => {

    newRequest = req.body.companyDetails;
    let allClients = [];

    // Get Clients
    Client.find({Company: newRequest.name, ClientType: "Limited company"}, async function (err, foundClients) {
        if(err) {             
            console.log("Find Clients Error Transaction Template: " + err);
            res.status(500).send("Find Clients Error Transaction Template");
            throw (err);
        };
    
        allClients = await foundClients.map(c => ({
            clientId: c._id,
            clientName: c.ClientName,
            bankTransactions: 0,
            tellerooTransactions: 0,
            tellerooPaymentRuns: 0,
        }));

        res.status(200).json({
            message: "Client Transaction Template Sent",
            transactionTemplate: allClients,
        });
        return;

    }).lean();

});


// Route uploading transactions
router.post("/uploadtransactions", upload.single("file"), async(req, res) => {

    const csvFile = req.file;
    const data = req.body;
    const dateArray = data.month.split("/");
    const date = new Date(dateArray[2], dateArray[1]-1, dateArray[0]);

    console.log("CSV Upload Started");

    let transactionArray = []


    try {
        transactionArray = await csv().fromString(req.file.buffer.toString());
  
        if (transactionArray.length != 0) {
          for (let i = 0; i < transactionArray.length; i++) {

            let telPay = transactionArray[i].TellerooPaymentRuns;

            if(isNaN(telPay)) {
                telPay = 0;
            };
  
            const clientID = transactionArray[i].ClientID;
            const clientName = transactionArray[i].ClientName;
            const bankTransactions = transactionArray[i].BankTransactions;
            const tellerooTransactions = transactionArray[i].TellerooTransactions;
            const tellerooPaymentRuns = telPay;
            sleep(20);
            
            await new TransactionCount({
                Company: data.company,
                ClientID: clientID,
                ClientName: clientName,
                Date: date,
                BankTransactions: parseInt(bankTransactions),
                TellerooTransactions: parseInt(tellerooTransactions),
                TellerooPaymentRuns: parseInt(tellerooPaymentRuns),
            }).save();
          }
        }
    } catch (e){
        console.log(e.stack);
    } finally {
        
        console.log("Transactions Uploaded");

        res.status(200).json({
            message: "Transaction Uploaded",
        });
        return;

        
    }; 

});

router.post("/fixtransaction", async (req, res) => {

    // console.log(new Date(2022, 6, 31,25,59,59,999));
    // TransactionCount.find({Date: new Date(2022, 6, 31,25,59,59,999)}, function(err, foundClients) {
    //     if(err) {
    //         console.error(err);
    //         res.status(404).send("Update Stamp Error");
    //         return;
    //     } else {

    //     console.log(foundClients);

    //     res.status(200).json({
    //         message: "Fix Sorted"
    //     });
    //     return;

    // }}).lean();


    // TransactionCount.updateMany({Date: new Date(2022, 6, 31,25,59,59,999)}, {
    //     $set: {Date: new Date(2022, 6, 31,21,59,59,999),
    //             }}, function (err) {
    //     if(err) {             
    //         console.log("Fix Transaction Error: " + err);
    //         res.status(500).send("Fix Transaction Error");
    //         throw (err);
    //     };

    //     res.status(200).json({
    //         message: "Fix Sorted"
    //     });
    //     return;

        
        
    // }).lean();
    

});

router.post("/clientbanding", async (req, res) => {

    newRequest = req.body.clientDetails;
    console.log("Updating banding for " + newRequest.clientName);

    Client.findByIdAndUpdate(newRequest.clientId, {
        $set: {TransactionBandLow: newRequest.lowBand,
            TransactionBandHigh: newRequest.highBand,
                }}, function (err) {
        if(err) {             
            console.log("Update to Client Banding Error: " + err);
            res.status(500).send("Update to Client Banding Error");
            throw (err);
        };

        Client.find({Company: newRequest.company}, function(err, foundClients) {
            if(err) {
                console.error(err);
                res.status(404).send("Update Stamp Error");
                return;
            } else {

            console.log("Banding Updated");

            res.status(200).json({
                message: "Banding Updated",
                clients: foundClients,
            });
            return;

        }}).lean();
        
    }).lean();
    

});


// Route for uploading tasks
router.post("/uploadtasks", upload.single("file"), async(req, res) => {

    const data = req.body;
    const dateArray1 = data.start.split("/");
    const startDate = new Date(dateArray1[2], dateArray1[1]-1, dateArray1[0]);
    const dateArray2 = data.end.split("/");
    const endDate = new Date(dateArray2[2], dateArray2[1]-1, dateArray2[0]);
    const companyName = data.company;
    const sDate = sub(new Date(startDate), {hours: 6});
    const eDate = sub(new Date(endDate), {hours: 6});

    console.log("Task CSV Upload Started");

    let taskArray = []

    try{
        taskArray = await csv().fromString(req.file.buffer.toString());
    }catch (e){
        console.log(e.stack);
    };

    Company.findOne({Name: companyName}, function (err, foundCompany){

        if(err) {
            console.log("Task upload - Company not found error: " + err);
            res.status(404).send("Task upload - Company not found")
            throw (err);
        } else {

            try {

                if (taskArray.length != 0) {
                  for (let i = 0; i < taskArray.length; i++) {


                    new TaskCard({
                        UserName: taskArray[i].name,
                        CompanyName: companyName,
                        CompanyId: foundCompany._id,
                        StartDate: addDays(sDate,1),
                        EndDate: addDays(eDate,1),
                        TotalJobs: taskArray[i].totalJobs,
                        CompletedJobs: taskArray[i].completedJobs,
                        OverdueTasks: taskArray[i].overdue,
                        CancelledTasks: taskArray[i].cancelled,
                        Team: taskArray[i].team,
                    }).save();
                  }
                }
            } catch (e){
                console.log(e.stack);
            } finally {

                console.log("Tasks Uploaded");

                res.status(200).json({
                    message: "Tasks Uploaded",
                });
                return;  
            };

        };
    });

});


router.post("/gettaskcards", async (req, res) => {

    newRequest = req.body.companyDetails;

    TaskCard.find({CompanyName: newRequest.company}, function (err, foundCards) {
        if(err) {             
            console.log("Find TaskCard Error: " + err);
            res.status(500).send("Find Task Card Error: ");
            throw (err);
        };
    

        res.status(200).json({
            message: "Task Cards Sent",
            taskCards: foundCards,
        });
        return;

    }).lean();

});



// Route uploading freshdesk SLA data
router.post("/uploadfdsla", upload.single("file"), async(req, res) => {

    const data = req.body;
    const dateArray1 = data.start.split("/");
    const startDate = new Date(dateArray1[2], dateArray1[1]-1, dateArray1[0]);
    const dateArray2 = data.end.split("/");
    const endDate = new Date(dateArray2[2], dateArray2[1]-1, dateArray2[0]);
    const companyName = data.company;
    const sDate = sub(new Date(startDate), {hours: 6});
    const eDate = sub(new Date(endDate), {hours: 6});

    console.log("Freshdesk CSV Upload Started");

    let freshdeskArray = []

    try{
        freshdeskArray = await csv().fromString(req.file.buffer.toString());
    }catch (e){
        console.log(e.stack);
    };

    Company.findOne({Name: companyName}, function (err, foundCompany){

        if(err) {
            console.log("Freshdesk SLA data upload - company not found error: " + err);
            res.status(404).send("Freshdesk SLA data upload - company not found")
            throw (err);
        } else {

            try {

                if (freshdeskArray.length != 0) {
                  for (let i = 0; i < freshdeskArray.length; i++) {


                    new FreshdeskCard({
                        UserName: freshdeskArray[i].name,
                        CompanyName: companyName,
                        CompanyId: foundCompany._id,
                        StartDate: addDays(sDate,1),
                        EndDate: addDays(eDate,1),
                        FirstResponseViolations: freshdeskArray[i].firstRepsonseViolations,
                        Team: freshdeskArray[i].team,
                    }).save();
                  }
                }
            } catch (e){
                console.log(e.stack);
            } finally {

                console.log("Freshdesk SLA data Uploaded");

                res.status(200).json({
                    message: "Freshdesk SLA data Uploaded",
                });
                return;  
            };

        };
    });

});


router.post("/getfreshdeskcards", async (req, res) => {

    newRequest = req.body.companyDetails;

    FreshdeskCard.find({CompanyName: newRequest.company}, function (err, foundCards) {
        if(err) {             
            console.log("Find Freshdesk Card Error: " + err);
            res.status(500).send("Find Freshdesk Card Error: ");
            throw (err);
        };
    

        res.status(200).json({
            message: "Freshdesk Cards Sent",
            freshdeskCards: foundCards,
        });
        return;

    }).lean();

});




module.exports = router;