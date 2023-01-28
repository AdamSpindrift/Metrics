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
// Other Imports
const axios = require("axios");
const request = require("request");
const path = require("path");
const uniqid = require("uniqid");
const { addDays, endOfMonth, format } = require("date-fns");
// Encryption
const bcrypt = require("bcrypt");
const saltRounds =  parseInt(process.env.SALT);
// Custom modules
const isCompanyNull = require("../custom_modules/companyNull");
const removeDupes = require("../custom_modules/removeDupes");
const { title } = require("process");
// // Email
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
// CSV
const { Parser }= require("json2csv");


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

router.post("/monthlyreport", async (req, res) => {

    const newRequest = req.body.reportDetails;
    let allUsers = [];
    let timeStamps = [];
    let uniqueJobIDs = [];
    let completedJobs = [];
    let consolidatedJobs = [];
    let staffDuration = [];
    let allCompletedJobs = [];
    console.log("Compiling Monthly Report");

    User.find({Company: newRequest.company},
        function(err, users){
            if(err) {
                
                console.log("Find User Error: " + err);
                res.status(500).send("Find User Error");
                 throw (err);
            };
            allUsers = users;
    });

    await Job.find({Company: newRequest.company, Status: "completed"},
        async function(err, foundJobs){
            if(err) {
                console.log("Find User Error: " + err);
                res.status(500).send("Find User Error");
                 throw (err);
            };

            allCompletedJobs = foundJobs;

    }).lean();

    await TimeStamp.find({Company: newRequest.company},
        async function(err, foundStamps){
            if(err) {
                
                console.log("Find User Error: " + err);
                res.status(500).send("Find User Error");
                 throw (err);
            };
            const greaterStamps = await foundStamps.filter(t => new Date(t.StartTime) >= new Date(newRequest.startDate));
            const stamps = await greaterStamps.filter(t => new Date(t.EndTime) <= endOfMonth(new Date(newRequest.startDate), 1));

            const jobIDs = stamps.map(s => s.JobId);
            
            timeStamps = stamps;
            uniqueJobIDs = await removeDupes(jobIDs);

            for(let i = 0; i< uniqueJobIDs.length; i++) {
                const match = allCompletedJobs.find(j => j._id === uniqueJobIDs[i]);

                if(match !== undefined || match !== null) {
                    completedJobs.push(match);
                };
            };
            console.log("found timestamps");

            async function buildJobStamps(timeStamps, i, completedJobs) {

                const thisJob = completedJobs[i];
        
                if(thisJob !== undefined) {
        
                
                const jobStamps = await timeStamps.filter(s => s.JobId === thisJob._id);
                const durationArray = await jobStamps.map(s => s.Duration);
                const duration = durationArray.reduce(add, 0);
                const costArray = await jobStamps.map(s => s.Cost);
                const cost = costArray.reduce(add, 0);
                const staffArray = await jobStamps.map(s => s.EmployeeName);
                const uniqueStaff = await removeDupes(staffArray);
                
                
                for(let i=0; i<uniqueStaff.length; i++) {
                    const staffStamps = jobStamps.filter(s => s.EmployeeName === uniqueStaff[i]);
                    const sDArray = staffStamps.map(s => s.Duration);
                    const sDuration = sDArray.reduce(add, 0);
                    const percentage = ((100 / duration)*sDuration)
        
                    const object = {
                        client: thisJob.ClientName,
                        jobName: thisJob.Title,
                        jobID: thisJob._id,
                        name: uniqueStaff[i],
                        durationHours: (sDuration / 3600000),
                        percentage: percentage,
                        feeAllocation: ((percentage/100)*thisJob.BudgetFee),
                    };
        
                    staffDuration.push(object);
                };
        
                const jobObject = {
                    client: thisJob.ClientName,
                    jobName: thisJob.Title,
                    jobID: thisJob._id,
                    date: thisJob.Date,
                    cost: cost.toFixed(2),
                    staff: uniqueStaff,
                    budgetFee: thisJob.BudgetFee.toFixed(0),
                    plFee: thisJob.ProfitLossFee.toFixed(0),
                    budgetHours : (thisJob.BudgetMilliseconds / 3600000).toFixed(2),
                    durationHours: (thisJob.Duration / 3600000).toFixed(2),
                    plHours: (thisJob.ProfitLossMilliseconds / 3600000).toFixed(2),
                    AHR: thisJob.AHR.toFixed(2),
                    Recovery: ((thisJob.BudgetMilliseconds / 3600000) / (thisJob.Duration / 3600000)).toFixed(2),
                };
                
                consolidatedJobs.push(jobObject);
                };
        
            };
        
            sleep(180000);
        
            for(let i = 0; i<completedJobs.length; i++) {
        
                buildJobStamps(timeStamps, i, completedJobs);
        
        
                if( i === completedJobs.length - 1) {
        
                    setTimeout(() => {
        
                        User.findOne({Company: newRequest.company, FirstName: newRequest.fName, LastName: newRequest.lName},
                            async function(err, user){
                                if(err) {
                                    
                                console.log("Find User Error: " + err);
                                res.status(500).send("Find User Error");
                                 throw (err);
                                } else {
                    
                                    try {
        
                                        const fields1 = ['client', 'jobName', 'jobID', "name", "durationHours", "percentage", "feeAllocation"];
                                        const opts1 = { fields1 };
                                        const parser1 = new Parser(opts1);
        
                                        const fields2 = ['client', 'jobName', 'jobID',"date", "cost", "staff", "budgetFee", "plFee","budgetHours","durationHours", "plHours", "AHR", "Recovery"];
                                        const opts2 = { fields2 };
                                        const parser2 = new Parser(opts2);
                                        
                                        console.log("parsing to csv");
                                        const csv1 = await parser1.parse(staffDuration);
                                        const csv2 = await parser2.parse(consolidatedJobs);
                            
                                        const mailOptions = {
                                            from: "robots@metricsapp.io",
                                            to: user.Email,
                                            subject: "Metrics Monthly Report",
                                            html: "<p>Hello " + user.FirstName + "</p><p>Here is your monthly report.</p><p>Kind Regards<br>Metrics Team</p>",
                                            attachments: [{
                                                filename: "Staff_Duration.csv",
                                                content: csv1,
                                                contentType: "text/csv",
                                            },
                                            {
                                                filename: "Completed_Jobs.csv",
                                                content: csv2,
                                                contentType: "text/csv",
                                            }]
                                        };
        
                                        console.log("sending email");
                            
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
                                };
                            }).lean();
                        
                    }, 5000);
                }
                
            };
            
            

    }).lean();

});

router.post("/jobtypereport", async (req, res) => {
    
    const newRequest = req.body.typeReportDetails;
    let allSelectedJobs = [];
    let allSelectedTimestamps = [];
    let staffAll = [];
    let staffThisMonth = [];
    let jobAnalysis = [];

    await Job.find({Company: newRequest.company, Title: newRequest.jobType},
        async function(err, foundJobs){
            if(err) {
                console.log("Find User Error: " + err);
                res.status(500).send("Find User Error");
                 throw (err);
            };

            allSelectedJobs = foundJobs;

    }).lean();

    await TimeStamp.find({Company: newRequest.company, JobTitle: newRequest.jobType},
        async function(err, foundStamps){
            if(err) {
                
                console.log("Find User Error: " + err);
                res.status(500).send("Find User Error");
                 throw (err);
            };
            allSelectedTimestamps = foundStamps;

            const greaterStamps = await foundStamps.filter(t => new Date(t.StartTime) >= new Date(newRequest.startDate));
            const stamps = await greaterStamps.filter(t => new Date(t.EndTime) <= endOfMonth(new Date(newRequest.startDate), 1));
            thisMonthStamps = stamps;
    }).lean();

    async function buildJobStampsAll(timeStamps, i, completedJobs) {

        const thisJob = completedJobs[i];

        if(thisJob !== undefined) {

        
        const jobStamps = await timeStamps.filter(s => s.JobId === thisJob._id);
        const durationArray = await jobStamps.map(s => s.Duration);
        const duration = durationArray.reduce(add, 0);
        const costArray = await jobStamps.map(s => s.Cost);
        const cost = costArray.reduce(add, 0);
        const staffArray = await jobStamps.map(s => s.EmployeeName);
        const uniqueStaff = await removeDupes(staffArray);
        
        
        for(let i=0; i<uniqueStaff.length; i++) {
            const staffStamps = jobStamps.filter(s => s.EmployeeName === uniqueStaff[i]);
            const sDArray = staffStamps.map(s => s.Duration);
            const sDuration = sDArray.reduce(add, 0);
            const percentage = ((100 / duration)*sDuration).toFixed(0);

            const object = {
                client: thisJob.ClientName,
                jobName: thisJob.Title,
                jobID: thisJob._id,
                name: uniqueStaff[i],
                durationHours: (sDuration / 3600000).toFixed(2),
                percentage: percentage,
                feeAllocation: ((percentage/100)*thisJob.BudgetFee).toFixed(2),
            };

            staffAll.push(object);
        };

        let ahr = 0;

        if(thisJob.AHR !== undefined) {
            ahr = thisJob.AHR;
        };

        const jobObject = {
            client: thisJob.ClientName,
            jobName: thisJob.Title,
            jobID: thisJob._id,
            date: thisJob.Date,
            cost: cost.toFixed(2),
            staff: uniqueStaff,
            status: thisJob.Status,
            budgetFee: thisJob.BudgetFee.toFixed(0),
            plFee: thisJob.ProfitLossFee.toFixed(0),
            budgetHours : (thisJob.BudgetMilliseconds / 3600000).toFixed(2),
            durationHours: (thisJob.Duration / 3600000).toFixed(2),
            plHours: (thisJob.ProfitLossMilliseconds / 3600000).toFixed(2),
            AHR: ahr.toFixed(2),
            Recovery: ((thisJob.BudgetMilliseconds / 3600000) / (thisJob.Duration / 3600000)).toFixed(2),
        };
        
        jobAnalysis.push(jobObject);
        };
    };

    async function buildStaffMonth(timeStamps, i, completedJobs) {

            const thisJob = completedJobs[i];
    
            if(thisJob !== undefined) {
    
            
            const jobStamps = await timeStamps.filter(s => s.JobId === thisJob._id);
            const durationArray = await jobStamps.map(s => s.Duration);
            const duration = durationArray.reduce(add, 0);
            const costArray = await jobStamps.map(s => s.Cost);
            const cost = costArray.reduce(add, 0);
            const staffArray = await jobStamps.map(s => s.EmployeeName);
            const uniqueStaff = await removeDupes(staffArray);
            
            
            for(let i=0; i<uniqueStaff.length; i++) {
                const staffStamps = jobStamps.filter(s => s.EmployeeName === uniqueStaff[i]);
                const sDArray = staffStamps.map(s => s.Duration);
                const sDuration = sDArray.reduce(add, 0);
                const percentage = ((100 / duration)*sDuration)
    
                const object = {
                    client: thisJob.ClientName,
                    jobName: thisJob.Title,
                    jobID: thisJob._id,
                    name: uniqueStaff[i],
                    durationHours: (sDuration / 3600000).toFixed(2),
                    percentage: percentage.toFixed(0),
                    feeAllocation: ((percentage/100)*thisJob.BudgetFee).toFixed(2),
                };
    
                staffThisMonth.push(object);
            };
    
            
            };
    };


    sleep(180000);
        
            for(let i = 0; i<allSelectedJobs.length; i++) {
        
                buildJobStampsAll(allSelectedTimestamps, i, allSelectedJobs);

                buildStaffMonth(allSelectedTimestamps, i, allSelectedJobs);
        
        
                if( i === allSelectedJobs.length - 1) {
        
                    setTimeout(() => {
        
                        User.findOne({Company: newRequest.company, FirstName: newRequest.fName, LastName: newRequest.lName},
                            async function(err, user){
                                if(err) {
                                    
                                console.log("Find User Error: " + err);
                                res.status(500).send("Find User Error");
                                 throw (err);
                                } else {
                    
                                    try {
        
                                        const fields1 = ['client', 'jobName', 'jobID', "name", "durationHours", "percentage", "feeAllocation"];
                                        const opts1 = { fields1 };
                                        const parser1 = new Parser(opts1);
        
                                        const fields2 = ['client', 'jobName', 'jobID',"date", "cost", "staff", "status", "budgetFee", "plFee","budgetHours","durationHours", "plHours", "AHR", "Recovery"];
                                        const opts2 = { fields2 };
                                        const parser2 = new Parser(opts2);

                                        const fields3 = ['client', 'jobName', 'jobID', "name", "durationHours", "percentage", "feeAllocation"];
                                        const opts3 = { fields3 };
                                        const parser3 = new Parser(opts3);
                                        
                                        console.log("parsing to csv");
                                        const csv1 = await parser1.parse(staffAll);
                                        const csv2 = await parser2.parse(jobAnalysis);
                                        const csv3 = await parser3.parse(staffThisMonth);
                            
                                        const mailOptions = {
                                            from: "robots@metricsapp.io",
                                            to: user.Email,
                                            subject: "Metrics Monthly " + newRequest.jobType + " Report",
                                            html: "<p>Hello " + user.FirstName + "</p><p>Here is your monthly " + newRequest.jobType + " report.</p><p>Kind Regards<br>Metrics Team</p>",
                                            attachments: [{
                                                filename: newRequest.jobType + "_Staff_Report_"+format(new Date(newRequest.startDate), 'dd/MM/yyyy')+".csv",
                                                content: csv1,
                                                contentType: "text/csv",
                                            },
                                            {
                                                filename: newRequest.jobType + "_Job_Report_"+format(new Date(newRequest.startDate), 'dd/MM/yyyy')+".csv",
                                                content: csv2,
                                                contentType: "text/csv",
                                            },
                                            {
                                                filename: newRequest.jobType + "_Monthly_Staff_Report_"+format(new Date(newRequest.startDate), 'dd/MM/yyyy')+".csv",
                                                content: csv3,
                                                contentType: "text/csv",
                                            }]
                                        };
        
                                        console.log("sending email");
                            
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
                                };
                            }).lean();
                        
                    }, 5000);
                }
                
            };



});


router.post("/exportbudgets", async (req, res) => {

    const newRequest = req.body.reportDetails;
    let exportBudgets = [];

    Client.find({Company: newRequest.company}, function(err, foundClients) {
        if(err) {
                                    
            console.log("Find Company Error: " + err);
            res.status(500).send("Find Company Error");
         throw (err);
        } else {

            console.log("Exporting Budgets");

            for(let i = 0; i < foundClients.length; i++) {

                const thisClient = foundClients[i];
                const budgets = foundClients[i].Budgets;
                const clientsi = i;

                for(let i = 0; i < budgets.length; i++) {

                    const budgetForCSV = {
                        ClientName: thisClient.ClientName,
                        _id: budgets[i]._id,
                        Title: budgets[i].Title,
                        Frequency: budgets[i].Frequency,
                        YearlyBudget: budgets[i].TotalBudget,
                        YearlyBudgetHours: budgets[i].TotalBudgetHours,
                        YearlyBudgetMinutes: budgets[i].TotalBudgetMinutes,
                        BudgetedFeePerJob: budgets[i].BudgetedFeePerJob,
                        BudgetedHoursPerJob: (budgets[i].BudgetedMillisecondsPerJob / 3600000).toFixed(2),
                        Visible: budgets[i].Visible,
                    };

                    exportBudgets.push(budgetForCSV);

                    if(clientsi === foundClients.length -1 && i === budgets.length - 1) {
                        console.log("Last Client");

                        setTimeout(() => {

                            User.findOne({Company: newRequest.company, FirstName: newRequest.fName, LastName: newRequest.lName},
                                async function(err, user){
                                    if(err) {
                                        
                                    console.log("Find User Error: " + err);
                                    res.status(500).send("Find User Error");
                                     throw (err);
                                    } else {

                            try {
        
                                const fields1 = ['ClientName', '_id', 'Title', "Frequency", "YearlyBudget", "YearlyBudgetHours", "YearlyBudgetMinutes", "BudgetedFeePerJob", "BudgetMillisecondsPerJob", "Visible"];
                                const opts1 = { fields1 };
                                const parser1 = new Parser(opts1);

                                const csv1 = await parser1.parse(exportBudgets);

                                const mailOptions = {
                                    from: "robots@metricsapp.io",
                                    to: user.Email,
                                    subject: newRequest.company + " Metrics Budgets",
                                    html: "<p>Hello " + user.FirstName + "</p><p>Here are your budgets.</p><p>Kind Regards<br>Metrics Team</p>",
                                    attachments: [{
                                        filename: newRequest.company + "_Budgets_"+format(new Date(), 'dd/MM/yyyy')+".csv",
                                        content: csv1,
                                        contentType: "text/csv",
                                    }]
                                };

                                console.log("sending email");
                    
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

                        };
                        });
                            
                        }, 10000);
                    }
                };
            };

        };
    });

});


module.exports = router;