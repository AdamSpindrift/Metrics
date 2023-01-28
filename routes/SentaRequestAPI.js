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
const { intervalToDuration, getYear, differenceInBusinessDays, endOfQuarter, startOfQuarter } = require("date-fns");
// Encryption
const bcrypt = require("bcrypt");
const saltRounds =  parseInt(process.env.SALT);
// Custom modules
const isCompanyNull = require("../custom_modules/companyNull");
const { title } = require("process");
const { date } = require('assert-plus');



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


function add(accumulator, a) {
    return accumulator + a;
  };

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};



// Get Clients from Senta

router.post("/getsentaclients", (req, res) => {
    const company=req.body.companyDetails;
    cListActive = "";
    let apiKey = "";

    const adminJobID = process.env.ADMIN_JOB_ID;
    const meetingJobID = process.env.MEETING_JOB_ID;
    const quickQuestionJobID = process.env.QUICK_QUESTION_JOB_ID

    const newAdminBudget = {
        _id: adminJobID,
        Title: "Admin",
        Frequency: "Monthly",
        TotalBudget: 0,
        TotalBudgetHours: 0,
        TotalBudgetMinutes: 0,
        BudgetedFeePerJob: 0,
        BudgetedMillisecondsPerJob: 0,
        Visible: true,
        MonthlyBudget: 0,
    };

    const newMeetingBudget = {
        _id: meetingJobID,
        Title: "Meeting",
        Frequency: "Monthly",
        TotalBudget: 0,
        TotalBudgetHours: 0,
        TotalBudgetMinutes: 0,
        BudgetedFeePerJob: 0,
        BudgetedMillisecondsPerJob: 0,
        Visible: true,
        MonthlyBudget: 0,
    };

    const newQuickQuestionBudget = {
        _id: quickQuestionJobID,
        Title: "Quick Question",
        Frequency: "Monthly",
        TotalBudget: 0,
        TotalBudgetHours: 0,
        TotalBudgetMinutes: 0,
        BudgetedFeePerJob: 0,
        BudgetedMillisecondsPerJob: 0,
        Visible: true,
        MonthlyBudget: 0,
    };

    const initialBudgets = [newAdminBudget, newMeetingBudget, newQuickQuestionBudget];

    Client.find({Company: company.name}, function(err, metricsCurrentClients) {
        if(err){
            console.log("No Clients Found " + err);
            res.status(404).send("No Clients Found");
        };
    

    Company.findOne({Name : company.name}, async function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            res.status(404).send("No Company Found");
        };
            console.log("Company found");
            apiKey = foundCompany.SentaAPIKey;
            cListActive = foundCompany.ClientListActive;
        

            await axios.get("https://" + company.name + ".senta.co/api/clients/" + cListActive , { "headers" : {"accept": "application/json", "x-auth": apiKey }})
            .then(response => {
                const response1 = response;
                const responseData = response1.data;

                const sentaCurrentClients = responseData.docs;

                const newClients = sentaCurrentClients.filter(client => !metricsCurrentClients.some(o2 => client._id === o2._id));

                // for(let i=0; i < sentaCurrentClients.length; i++) {

                // console.log(sentaCurrentClients[i]["Client name"] + " " + sentaCurrentClients[i]._id);
                // };

                if (newClients.length === 0) {
                    res.status(200).send("No New Clients to Add");
                    console.log("No New Clients to Add");
                    return;
                };

                
                        for(let i=0; i < newClients.length; i++) {
                            const a = newClients[i];

                            let yearlyFee = parseInt(a["Accounting fees"]);

                            if (a["Payment method"] === "Monthly") {
                                yearlyFee = (parseInt(a["Accounting fees"]) * 12);
                                console.log("Hit Monthly");

                                if (isNaN(yearlyFee)) {
                                    yearlyFee = 0;
                                };
                            };

                            if (a["Payment method"] === "Annually") {
                                yearlyFee = parseInt(a["Accounting fees"]);

                                if (isNaN(yearlyFee)) {
                                    yearlyFee = 0;
                                };
                            };

                            if (yearlyFee === null || yearlyFee === undefined) {
                                yearlyFee = 0;
                                console.log("hit yearly")
                            };

                                if (isNaN(yearlyFee)) {
                                    yearlyFee = 0;
                                };
     
                                
                            Client.create({
                                _id: a._id,
                                ClientName: a["Client name"],
                                ClientState: "Client",
                                ClientType: a.Type,
                                Company: company.name,
                                AccManager: a["Acct manager"],
                                Budgets: initialBudgets,
                                YearlyFee: yearlyFee,
                                ProfitLossMilliseconds: 0,
                                ProfitLossFee: 0,
                                AHR: 0,
                                XeroTenantID: "",
                                TransactionBandLow: 0,
                                TransactionBandHigh: 0,
                                Team: "",
                            });
                            
                                
                            if(i === (newClients.length - 1)) {

                                setTimeout(() => {
                                    Client.find({Company: company.name}, function ( err, foundClients) {
                                        if (err) {
                                            console.log(err);
                                            res.status(404).send("No Company Found Error");
                                            throw(err);
                                          } else {
                                              console.log("Clients Added to " + company.name);
                                            res.status(200).json({
                                                message: "Clients Added",
                                                clients: foundClients,
                                            });
                                            return;
                                          };
                                    })
                                }, 200);
                            };                            
                            
                        };              
            }); 
        });
    });
});


// Update Client from Senta
router.post("/getclientupdate", (req, res) => {
    const data = req.body.clientDetails;

    let apiKey = "";


    Company.findOne({Name : data.company}, async function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            res.status(404).send("No Company Found");
            throw(err);
        };
            apiKey = foundCompany.SentaAPIKey;

            await axios.get("https://" + data.company + ".senta.co/api/clients/" + data.clientID , { "headers" : {"accept": "application/json", "x-auth": apiKey }})
            .then(response => {
                const response1 = response;
                const responseData = response1.data;

                const a = responseData.doc;

                let yearlyFee = parseInt(a.fees);

                if (a.paymentmethod === "Monthly") {
                    yearlyFee = (parseInt(a.fees) * 12);
                };

                if (yearlyFee === null || yearlyFee === undefined) {
                    yearlyFee = 0;
                };

                if (isNaN(yearlyFee)) {
                    yearlyFee = 0;
                };

                Client.findByIdAndUpdate(data.clientID, {
                    $set: {ClientName: a.title,
                            AccManager: a.accountmanager,
                            YearlyFee: yearlyFee,
                        }}, function (err) {
                            if(err) {
                                console.log("Update Client Error: " + err);
                                res.status(500).send("Update Client Error");
                                throw (err);
                            };

                        Client.find({Company: data.company}, function(err, foundClients) {
                            if(err) {
                                console.log("Update Client Error: " + err);
                                res.status(500).send("Update Client Error");
                                throw (err);
                            } else {
                                console.log("Client Updated");
                                res.status(200).json({
                                    message: "Client Updated",
                                    clients: foundClients,
                                });
                                return;
                            };
                        }).lean();
                });
            });
    }).lean();
});





// Get Jobs from Senta

router.post("/getsentajobs", (req, res) => {
    const company=req.body.companyDetails;
    let foundCompany = "";
    let clients = [];

    Client.find({Company: company.name}, function(err, foundClients) {
        if(err){
            console.log("No Company Found " + err);
            res.status(404).send("No Company Found");
            throw(err);
        };

        clients = foundClients;
    }).lean();

    Company.findOne({Name : company.name}, async function(err, foundBusiness){
        if(err){
            console.log("No Company Found " + err);
            res.status(404).send("No Company Found");
            throw(err);
        } else {
            foundCompany = foundBusiness;
            console.log("Company found");
        };

    }).lean();

    Job.find({Company : company.name}, async function(err, foundJobs){
        if(err){
            console.log("No Jobs Found " + err);
            res.status(404).send("No Jobs Found");
            throw(err);
        };
       
        console.log("Jobs found");
        
        const apiKey = foundCompany.SentaAPIKey;
        const jobs = foundJobs;

        for(let i=0; i < clients.length; i++) {

            const clientName = clients[i].ClientName;

            await axios.get("https://" + company.name + ".senta.co/api/jobs?cid=" + clients[i]._id + "&status=ready%2Coverdue%2Cpending" , { "headers" : {"accept": "application/json", "x-auth": apiKey }})
            .catch(function (error) {
                if (error.response) {
                    console.log("Response Error - " + error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    console.log("Request Error - " + error.request);
                } else {
                    console.log("Error - " + error.message);
                };
            })
            .then(response => {
                const response1 = response;
                const responseData = response1.data;
                const foundJobs = responseData.docs;

                const newJobs = foundJobs.filter(job => !jobs.some(o2 => job._id === o2._id));

                if (newJobs.length === 0) {
                    return;
                };

                    for(let i=0; i < newJobs.length; i++) {
                        let budgetFee = 0;
                        let budgetMilliseconds = 0;
                        

                        const a = newJobs[i];
                        const jobClient = clients.find(c => c._id === a.cid);
                        const budgets = jobClient.Budgets;

                            

                        if(budgets !== null || budgets !== undefined) {
                            const jobBudget = budgets.find(b => b._id === a.wid);

                            if(jobBudget !== undefined) {
                                budgetFee = jobBudget.BudgetedFeePerJob;
                                budgetMilliseconds = jobBudget.BudgetedMillisecondsPerJob;
                            };
                            
                        };

                        const dateArray = a.date.split("T");
                                
                            Job.create({
                                _id: a._id,
                                ClientId: a.cid,
                                ClientName: clientName,
                                Company: company.name,
                                Wid: a.wid,
                                Title: a.title,
                                Date: dateArray[0],
                                BudgetFee: budgetFee,
                                BudgetMilliseconds: budgetMilliseconds,
                                Timestamps: [],
                                Status: "ready",
                                ProfitLossMilliseconds: budgetMilliseconds,
                                ProfitLossFee: budgetFee,
                            }, (err, ) => {
                                if(err) {
                                    console.log("Add Job Error: " + err);
                                    throw (err);
                                };
                            });
                    };

                    setTimeout(() => {
                        console.log("Jobs Added");

                        Job.find({Company: company.name}, function (err, foundJobs) {
                            if(err) {
                                console.log("Jobs Error: " + err);
                                res.status(500).send("Jobs Error");
                                throw (err);
                            } else {
                                res.status(200).json({
                                    message: "Jobs Added",
                                    jobs: foundJobs,
                                });
                                return;
                            };
                        });
                                     
                    }, 1000);
                     
                });
        };
    }).lean();
});



// Delete All Jobs from Metrics Client
router.post("/deletesentajobs", (req, res) => {
    res.status(200).send("Delete jobs route deactivated");
    return;
    // const company=req.body.companyDetails;

    // Company.findOneAndUpdate({Name : company.name}, {$set: {"Jobs" : [] }},
    // function(err, foundCompany){
    //     if(err){
    //         console.log("No Company Found " + err);
    //         res.status(404).send("No Company Found");
    //     };
        
    //     if(!err) {
    //         console.log("Jobs Deleted");
    //         res.status(200).send("Jobs Deleted");
    //     };
    // });
});



// Delete All Jobs from Metrics Client
router.post("/deletesentaclients", (req, res) => {
    res.status(200).send("Delete clients route deactivated");
    return;
    // const company=req.body.companyDetails;

    // Company.findOneAndUpdate({Name : company.name}, {$set: {"Clients" : [] }},
    // function(err, foundCompany){
    //     if(err){
    //         console.log("No Company Found " + err);
    //         res.status(404).send("No Company Found");
    //     };
        
    //     if(!err) {
    //         console.log("Clients Deleted");
    //         res.status(200).send("Clients Deleted");
    //     };
    // });
});





// Get all Jobs from Metrics Client
router.post("/getjobs", (req, res) => {
    const company = req.body.requestData;

    Jobs.find({Company: company.name}, function (err, foundJobs) {
        if(err){
            console.log("No Company Found " + err);
            res.status(404).send("No Company Found");
            res.status(404).json({
                message: "Jobs Error",
                jobs: [],
            });
        } else {
            console.log("Company Found, Sending Jobs");
            res.status(200).json({
                message: "Company Found, Sending Jobs",
                jobs: foundJobs,
            }); 
        };
    });
});



// Create Time Stamp
router.post("/createtimestamp", (req, res) => {
    const newRequest = req.body.stamp2;


    const start = new Date();
    const id = uniqid();

    const userNameArray= newRequest.user.split(" ", 2);

    User.findOne({Company: newRequest.company, FirstName: userNameArray[0], LastName: userNameArray[1]}, function (err, foundUser) {
        if (err) {
            console.log(err);
            res.status(401).send("No User Found");
        }
    
    TimeStamp.create({
        _id: id,
        EmployeeName: newRequest.user,
        EmployeeCostPerHour: foundUser.CostPerHour,
        Company: newRequest.company,
        JobTitle: newRequest.jobName,
        JobId: newRequest.jobId,
        ClientName: newRequest.clientName,
        ClientId: newRequest.cID,
        StartTime: start,
        EndTime: null,
        Duration: null,
        Description: newRequest.description,
        Cost: 0,
        ManualEdit: false,
    }, (err) => {
        if(err) {
            console.log("Create Timestamp Error: " + err);
            res.status(500).send("Error");
        };
    });

                User.findOneAndUpdate({Company: newRequest.company, FirstName: userNameArray[0], LastName: userNameArray[1]}, {
                    $push: {TodaysStamps: id}, $set: {ActiveTime: id}},  function (err) {
                    if(err) {             
                        console.log("Timestamp Error: " + err);
                        res.status(500).send("Time Stamp Error");
                         throw (err);
                        } else {

                            Job.findByIdAndUpdate(newRequest.jobId, {
                                $push: {Timestamps: id}},  function (err) {
                                    if(err) {
                                        console.log("Time Stamp Job Error: " + err);
                                        res.status(500).send("Time Stamp Job Error");
                                        throw (err);
                                    } else {
                                        console.log("Time Stamp Started");
                                        res.status(200).json({
                                            message: "Time Stamp Started",
                                            timeStampID: id,
                                            timeDescription: newRequest.description,
                                            startTime: start,
                                        });
                                        return;
                                    };
                            });
                        };
                });
    });
});



// Stop Time Stamp
router.post("/stoptimestamp", async (req, res) => {
    const newRequest = req.body.timeStop;
    console.log("Time stopped - " + newRequest.user);
    console.time("Stop Overall");

    let profitLossMs = 0;
    let foundUser = {};
    let jobStamps = [];
    let foundJob = "";

    Job.findById(newRequest.jobId, function(err, foundJ2) {
        if(err) {
            console.log("Job Error: " + err);
            res.status(500).send("Job Error");
            throw (err);
        };
            foundJob = foundJ2;

    }).lean();

    const userNameArray= newRequest.user.split(" ", 2);

    const endTime = new Date();
    const duration = intervalToDuration ({
                        start: new Date(newRequest.startTime),
                        end: new Date(endTime)
                    });

    const hoursToMs = (duration.hours * 3600000);
    const minutesToMs = (duration.minutes * 60000);
    const secondsToMs = (duration.seconds * 1000);
    const durationMs = (hoursToMs + minutesToMs + secondsToMs);

    TimeStamp.find({JobId: newRequest.jobId}, async function(err, foundStamps) {
        if(err) {
            console.log("Get Timestamps Error: " + err);
            res.status(500).send("Get Timestamps Error");
            throw (err);
        };
            jobStamps = foundStamps;

            const oldDurationArray = await jobStamps.map(j => j.Duration);
            const oldDuration = await oldDurationArray.reduce(add, 0);
            const newDuration = await (oldDuration + durationMs);
            const durationHours = await (newDuration / 3600000);

            const budgetFee = foundJob.BudgetFee;
            profitLossMs = (foundJob.BudgetMilliseconds - newDuration);

            const newAHR = (budgetFee / durationHours);

            // Update User
            User.findOneAndUpdate({Company: newRequest.company, FirstName: userNameArray[0], LastName: userNameArray[1]}, {
                $set: {ActiveTime: null}}, function(err, foundUser1){
                if(err) {             
                    console.log("Timestamp Error: " + err);
                    res.status(500).send("Time Stamp Error");
                    throw (err);
                };

                foundUser = foundUser1;
            });

            let stamps = [];
            let jobs = [];
            let todayStamps = [];

            // Update Job
            Job.findByIdAndUpdate(newRequest.jobId, {
                $set: {ProfitLossMilliseconds: profitLossMs,
                    AHR: newAHR,
                    Duration: newDuration,
                    }}, function (err) {
                if(err) {             
                    console.log("Timestamp Job Error: " + err);
                    res.status(500).send("Time Stamp Job Error");
                    throw (err);
                };

                // Get new Jobs
                Job.find({Company: newRequest.company}, function (err, foundJobs) {
                    if(err) {             
                        console.log("Timestamp Job Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    };
                
                    jobs = foundJobs;
                    console.log("Found New Jobs");
                }).lean();
            });
    
            // Update Timestamp
            TimeStamp.findByIdAndUpdate(newRequest.timeID, {
                $set: {EndTime: endTime,
                        Duration: durationMs, }}, function (err) {
                if(err) {             
                    console.log("Timestamp Error: " + err);
                    res.status(500).send("Time Stamp Error");
                    throw (err);
                };
            
                    TimeStamp.find({Company: newRequest.company}, function(err, foundStamps) {
                        if(err) {
                            console.log("Get Timestamps Error: " + err);
                            res.status(500).send("Get Timestamps Error");
                            throw (err);
                        } else {
                            stamps = foundStamps;

                            for (let i = 0; i < foundUser.TodaysStamps.length; i++) {
                                    
                                const foundTime = stamps.find(stamp => stamp._id === foundUser.TodaysStamps[i]);
                                        
                                if (foundTime !== undefined) {
                                    todayStamps.push(foundTime);  
                                };
            
                                if (i === (foundUser.TodaysStamps.length -1)) {

                                    setTimeout(() => {
                                        console.log("Time Stamp Stopped sending response");
                                        console.timeEnd("Stop Overall");
                                        res.status(200).json({
                                        message: "Time Stamp stopped repsonse received",
                                        userStamps: todayStamps,
                                        jobs: jobs,
                                        timeStamps: stamps,
                                        duration: durationMs,
                                    });
                                    return;
                                    }, 250);
                                };    
                            };
                        };
                    }).lean();
                });
    }).lean();
});



// Create Job and Time Stamp
router.post("/createjobandstamp", (req, res) => {
    const newRequest = req.body.timeStamp;

    const start = new Date();
    const id = uniqid();
    let jobName = newRequest.jobName;
    const userNameArray= newRequest.user.split(" ", 2);
    let userID = "";

    if (jobName != "Admin" && jobName != "Meeting") {
        jobName = "Admin";
    };

    User.findOne({Company: newRequest.company, FirstName: userNameArray[0], LastName: userNameArray[1]}, function (err, foundUser) {
        if (err) {
            console.log(err);
            res.status(401).send("No User Found");
        };

        userID = foundUser._id;

    Job.create({
        _id: newRequest.jobId,
        ClientId: newRequest.cID,
        ClientName: newRequest.clientName,
        Company: newRequest.company,
        Wid: jobName,
        Title: jobName,
        Date: start,
        BudgetFee: 0,
        BudgetMilliseconds: 0,
        Timestamps: [],
        Status: "completed",
        ProfitLossMilliseconds: 0,
        ProfitLossFee: 0,
    },(err) => {
        if(err) {
            console.log("Add Company Error: " + err);
            res.status(500).send("Error");
            return;
        };
    });
    
    TimeStamp.create({
        _id: id,
        EmployeeName: newRequest.user,
        EmployeeCostPerHour: foundUser.CostPerHour,
        JobTitle: jobName,
        JobId: newRequest.jobId,
        ClientName: newRequest.clientName,
        ClientId: newRequest.cID,
        StartTime: start,
        EndTime: null,
        Duration: null,
        Description: newRequest.description,
        Cost: 0,
        ManualEdit: false,
    }, (err) => {
        if(err) {
            console.log("Add Company Error: " + err);
            res.status(500).send("Error");
            return;
        };
    });

    User.findByIdAndUpdate(userID, {
        $push: {TodaysStamps: id}, $set: {ActiveTime: id}},  function (err) {
        if(err) {             
            console.log("Timestamp Error: " + err);
            res.status(500).send("Time Stamp Error");
             throw (err);
            } else {
                Job.findByIdAndUpdate(newRequest.jobId, {
                    $push: {Timestamps: id}}, function (err, foundCompany) {
                        if(err) {
                            console.log("Time Stamp Job Error: " + err);
                            res.status(500).send("Time Stamp Job Error");
                            throw (err);
                        } else {

                            Job.find({Company: newRequest.company}, function (err) {
                                if(err) {
                                    console.log("Find new Jobs Error: " + err);
                                    res.status(500).send("Find new Jobs Error");
                                    throw (err);
                                } else {
                            
                                    console.log("Time Stamp Started");
                                        res.status(200).json({
                                            message: "Time Stamp Started",
                                            timeStampID: id,
                                            timeDescription: newRequest.description,
                                            startTime: start,
                                            jobs: foundCompany.Jobs,
                                        });
                                        return;
                                };
                            });
                        };
                });
            };
    });
    });
});


// Create Custom Job
router.post("/createjob", (req, res) => {
    const newRequest = req.body.newJob;

    const start = new Date();

    Job.create({
        _id: newRequest.jobId,
        ClientId: newRequest.clientId,
        ClientName: newRequest.clientName,
        Company: newRequest.company,
        Wid: newRequest.jobName,
        Title: newRequest.jobName,
        Date: start,
        BudgetFee: 0,
        BudgetMilliseconds: 0,
        Timestamps: [],
        Status: "ready",
        ProfitLossMilliseconds: 0,
        ProfitLossFee: 0,
    },(err) => {
        if(err) {
            console.log("Add Company Error: " + err);
            res.status(500).send("Error");
            return;
        } else {
            console.log("Job Created");

            Job.find({Company: newRequest.company}, function (err, foundJobs) {
                if(err) {
                    console.log("Find new Jobs Error: " + err);
                    res.status(500).send("Find new Jobs Error");
                    throw (err);
                } else {
                
                    res.status(200).json({
                        message: "Job Created",
                        jobs: foundJobs,
                    });
                    return;
                    };
            });
        };
    }
    );
});



// Edit Timestamp
router.post("/edittimestamp", async (req, res) => {
    console.time("Edit Overall");
    const newRequest = req.body.newStamp;
    const userNameArray= newRequest.user.split(" ", 2);

    const duration = intervalToDuration ({
                        start: new Date(newRequest.startTime),
                        end: new Date(newRequest.endTime)
                    });

    const hoursToMs = (duration.hours * 3600000);
    const minutesToMs = (duration.minutes * 60000);
    const secondsToMs = (duration.seconds * 1000);
    sleep(500);
    const durationMs = (hoursToMs + minutesToMs + secondsToMs);
    let profitLossMs = 0;
    let baseMs = 0;
    let baseFee = 0;
    let jobStamps = [];
    let foundJob = "";
    sleep(500);

    Job.findById(newRequest.jobId, function(err, foundJ2) {
        if(err) {
            console.log("Get Timestamps Error: " + err);
            res.status(500).send("Get Timestamps Error");
            throw (err);
        } else {
            console.log("Found Job");
            foundJob = foundJ2;
   

    Job.find({ClientId: foundJob.ClientId}, async function(err, foundJ) {
        if(err) {             
            console.log("Job Error: " + err);
            res.status(500).send("Job Error");
            throw (err);
        };

        const startDate = await startOfQuarter(new Date());

        const qJobs = await foundJ.filter(j => new Date(j.Date) > new Date(startDate));
        const jobMS = await qJobs.map(j => parseInt(j.ProfitLossMilliseconds));
        baseMs = await jobMS.reduce(add, 0);
        const jobF = await qJobs.map(j => parseFloat(j.ProfitLossFee));
        baseFee = await jobF.reduce(add, 0);

    // Update Timestamp
    TimeStamp.findByIdAndUpdate(newRequest.stampID, {
        $set: {Description: newRequest.description,
                StartTime: new Date(newRequest.startTime),
                EndTime: new Date(newRequest.endTime),
                Duration: durationMs,
                ManualEdit: true}},  function(err) {
            if(err) {
                console.error(err);
                res.status(404).send("Update Stamp Error");
                return;
            } else {
    

            TimeStamp.find({JobId: newRequest.jobId}, async function(err, foundStamps) {
                if(err) {
                    console.log("Get Timestamps Error: " + err);
                    res.status(500).send("Get Timestamps Error");
                    throw (err);
                };
                    jobStamps = foundStamps;
            
                    const durationArray = await jobStamps.map(j => parseInt(j.Duration));
                    const newArray = await durationArray.filter( value => !Number.isNaN(value) );
                    const newDuration = await newArray.reduce(add, 0);
                    const durationHours = await (newDuration / 3600000);
            
                    profitLossMs = await (foundJob.BudgetMilliseconds - newDuration);
            
                    const budgetFee = await foundJob.BudgetFee;
            
                    const newAHR = await (budgetFee / durationHours);
            
                    let newJobs = [];
                    let newStamps = [];
            
                // Update Job
                Job.findByIdAndUpdate(newRequest.jobId, {
                    $set: {ProfitLossMilliseconds: profitLossMs,
                        AHR: newAHR,
                        Duration: newDuration,
                        }}, function (err) {
                    if(err) {             
                        console.log("Timestamp Job Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    } else {

                        
                                    console.log("Updates Done - fetching new data");

                                    TimeStamp.find({Company: newRequest.company}, function(err, foundStamps) {
                                        if(err) {
                                            console.log("Get Timestamps Error: " + err);
                                            res.status(500).send("Get Timestamps Error");
                                            throw (err);
                                        } else {
                                            newStamps = foundStamps;
                                            console.log("Edit Time - Found New Time Stamps");
                                        };
                                    }).lean();
                                    
                                    Job.find({Company: newRequest.company}, function(err, foundJobs2) {
                                        if(err) {
                                            console.error(err);
                                            res.status(404).send("Update Stamp Error");
                                            return;
                                        } else {
                                            newJobs = foundJobs2;
                                            console.log("Edit Time - Found New Jobs");
                                        };}).lean();
                                    
                                    setTimeout(() => {

                                    
                                        
                                    User.findOne({Company: newRequest.company, FirstName: userNameArray[0], LastName: userNameArray[1]}, async function(err, user) {
                                        if(err) {
                                            console.error(err);
                                            res.status(404).send("Update Stamp Error");
                                            return;
                                        } else {
                                            let updateTodayStamps = [];

                                            // async function used in loop below
                                            const updateStamp = async (newStamps, stamp) => {
                                                const newStamp = await newStamps.find(s => stamp === s._id);

                                                updateTodayStamps.push(newStamp);
                                            };


                                            for(let i=0; i<user.TodaysStamps.length ;i++) {

                                                updateStamp(newStamps, user.TodaysStamps[i]);

                                            };

                                                setTimeout(() => {
                                                    console.timeEnd("Edit Overall");
                                                    console.log("Time Stamp Update Successful sending response");
                                                res.status(200).json({
                                                    message: "Time Stamp Update Successful",
                                                    jobs: newJobs,
                                                    timeStamps: newStamps,
                                                    userStamps: updateTodayStamps,
                                                });    
                                                }, 100);
                                            
                                        };
                                    }).lean();

                                },[8000]);
                                    
                                    
                                
                    };
                });
                
                });
            
    }});
    }).lean();
};
}).lean();
});




// Set Job Status
router.post("/setjobstatus", (req, res) => {
    const newRequest=req.body.jobDetails;

    let completedDate = new Date();

    if(newRequest.status === "ready") {
        completedDate = new Date(1970,0,1);
    };

    Job.findOneAndUpdate({_id: newRequest.jobID}, {
        $set: {Status: newRequest.status, CompletedDate: completedDate }}, function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            res.status(404).send("No Company Found");
        } else {

            Job.find({Company: newRequest.company}, function(err, foundJobs2) {
                if(err) {
                    console.error(err);
                    res.status(404).send("Update Stamp Error");
                    return;
                } else {

                    console.log("Job Status Updated");
                    res.status(200).json({
                        message: "Job Status Updated " + newRequest.status,
                        jobs: foundJobs2,
                    });
                }; 
            });
        };
    });
});





// Get TimeStamp
router.post("/gettimestamp", (req, res) => {
    const newRequest = req.body.timeID;

    TimeStamp.findOne({_id: newRequest.timeStampID}, function (err, foundStamp){
        if(err) {             
            console.log("Timestamp Error: " + err);
            res.status(500).send("Time Stamp Error");
            throw (err);
        } else {

        
            console.log("Sending Time Stamp");
                    res.status(200).json({
                        message: "Time Stamp Recieved",
                        timeStamp: foundStamp,
                    });
                    return;
        };
    });

});



// Get All TimeStamps
router.post("/gettimestamps", (req, res) => {
    const newRequest = req.body.companyDetails;

    TimeStamp.find({Company: newRequest.company}, function (err, foundStamps){
        if(err) {             
            console.log("All Time Stamps Error: " + err);
            res.status(500).send("All Time Stamps Error");
            throw (err);
        } else {
        
            console.log("Sending Time Stamps");
                    res.status(200).json({
                        message: "Time Stamps Recieved",
                        timeStamp: foundStamps,
                    });
                    return;
        };
    });

});




// Day Complete
router.post("/daycomplete", (req, res) => {
    const newRequest = req.body.userDetails;
    const user= newRequest.user;

    User.findOneAndUpdate({Company: newRequest.company, FirstName: user.fName, LastName: user.lName},
        {$set: {"DayComplete" : true }}, function(err, foundUser) {

            if(err) {
                console.log("Day Complete Error: " + err);
                res.status(401).send("User Day Complete Error");
                throw (err);
            };

            console.log("User " + newRequest.user + " Day Complete");
            res.status(200).json({
                message: "User " + newRequest.user + " Day Complete",
            });
        });
});


// Set Client State
router.post("/setclientstate", (req, res) => {
    const newRequest = req.body.clientDetails;

    Client.findByIdAndUpdate(newRequest.clientId, {
        $set: {ClientState: newRequest.state,
                }}, function (err) {
        if(err) {             
            console.log("Client State Error: " + err);
            res.status(500).send("Client State Error");
            throw (err);
        } else {

            Client.find({Company: newRequest.company}, function(err, foundClients) {
                if(err) {
                    console.error(err);
                    res.status(404).send("Update Client State Error");
                    return;
                } else {

                    console.log(newRequest.clientName + " state updated to " + newRequest.state);
                    res.status(200).json({
                        message: newRequest.clientName + " state updated to " + newRequest.state,
                        clients: foundClients,
                    });
                };
            }).lean();;
        };
    });
});


// Set Client Team
router.post("/setclientteam", (req, res) => {
    const newRequest = req.body.clientDetails;

    Client.findByIdAndUpdate(newRequest.clientId, {
        $set: {Team: newRequest.team,
                }}, function (err) {
        if(err) {             
            console.log("Client State Error: " + err);
            res.status(500).send("Client State Error");
            throw (err);
        } else {

            Client.find({Company: newRequest.company}, function(err, foundClients) {
                if(err) {
                    console.error(err);
                    res.status(404).send("Update Team Error");
                    return;
                } else {

                    console.log(newRequest.clientName + " team updated to " + newRequest.team);
                    res.status(200).json({
                        message: newRequest.clientName + " team updated to " + newRequest.team,
                        clients: foundClients,
                    });
                };
            }).lean();;
        };
    });
});


module.exports = router;