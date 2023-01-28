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
const { intervalToDuration, format } = require("date-fns");
// Encryption
const bcrypt = require("bcrypt");
const saltRounds =  parseInt(process.env.SALT);
// Custom modules
const isCompanyNull = require("../custom_modules/companyNull");
const { title } = require("process");



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


// Setup New Budgets
router.post("/setupnewbudgets", (req, res) => {
    const company=req.body.companyDetails;

    isCompanyNull(company);

    Client.find({Company: company.name}, function (err, foundClients) {
        if(err) {
            console.log("Set Budgets ClientError: " + err);
            throw (err);
        };
    

    Company.findOne({Name: company.name}, function (err, foundCompany) {
        if(err) {
            console.log("Set Budgets Company Error: " + err);
            throw (err);
        };
        const apiKey = foundCompany.SentaAPIKey;

        for(let i = 0; i < foundClients.length; i++) {
            const currentClient = foundClients[i];

            
            axios.get("https://" + company.name + ".senta.co/api/jobs?cid=" + currentClient._id + "&status=pending%2Cready%2Coverdue%2Ccompleted%2Ccancelled" , { "headers" : {"accept": "application/json", "x-auth": apiKey }})
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

                const uniqueJobTemplates = Array.from(new Set(foundJobs.map(a => a.wid)))
                .map(id => {
                    return foundJobs.find(a => a.wid === id)
                });


                // Setting Initial Budgets
                
                if (currentClient.Budgets.length === 0) {
                    let initialBudgets = [];

                    for(let i = 0; i < uniqueJobTemplates.length; i++) {
    
                        const newBudget = {
                            _id: uniqueJobTemplates[i].wid,
                            Title: uniqueJobTemplates[i].title,
                            Frequency: "none",
                            TotalBudget: 0,
                            TotalBudgetHours: 0,
                            TotalBudgetMinutes: 0,
                            BudgetedFeePerJob: 0,
                            BudgetedMillisecondsPerJob: 0,
                            Visible: true,
                            MonthlyBudget: 0,
                        }

                        initialBudgets.push(newBudget);
                    };

                

                    setTimeout(() => {
                        
                        Client.findByIdAndUpdate(currentClient._id, {
                            $set: {Budgets: initialBudgets}},  function (err) {
                                if(err) {
                                    console.log("Set Budgets Error for " + currentClient.ClientName + err);
                                    throw (err);
                                } else {
                                    console.log("Budgets for " + currentClient.ClientName + " Updated");
                                };
                        });

                    }, 100);
                };
            });
        };
        res.status(200).send("Updating Budgets");
    }).lean();
    }).lean();
});



// Setup Budgets On Specific Client
router.post("/newbudgetfornewjob", (req, res) => {
    const company=req.body.clientDetails;

    Client.findById(company.clientID, function (err, currentClient) {
        if(err) {
            console.log("Set Budgets ClientError: " + err);
            throw (err);
        };

    Company.findOne({Name: company.company}, function (err, foundCompany) {
        if(err) {
            console.log("Set Budgets Company Error: " + err);
            throw (err);
        };
        const apiKey = foundCompany.SentaAPIKey;
            
            axios.get("https://" + company.company + ".senta.co/api/jobs?cid=" + currentClient._id + "&status=pending%2Cready%2Coverdue%2Ccompleted%2Ccancelled" , { "headers" : {"accept": "application/json", "x-auth": apiKey }})
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

                const uniqueJobTemplates = Array.from(new Set(foundJobs.map(a => a.wid)))
                .map(id => {
                    return foundJobs.find(a => a.wid === id)
                });

                for(let i = 0; i< currentClient.Budgets.length; i++) {
                    const match = uniqueJobTemplates.find(j => j.wid === currentClient.Budgets[i]._id);

                    if(match !== undefined) {
                        const jobIndex = uniqueJobTemplates.findIndex( function (job) {
                            return job.wid === match.wid;
                        });

                        uniqueJobTemplates.splice(jobIndex, 1);
                    };
                };

                // Setting Budgets
                
                
                    let initialBudgets = currentClient.Budgets;

                    setTimeout(() => {
                        for(let i = 0; i < uniqueJobTemplates.length; i++) {
    
                            const newBudget = {
                                _id: uniqueJobTemplates[i].wid,
                                Title: uniqueJobTemplates[i].title,
                                Frequency: "none",
                                TotalBudget: 0,
                                TotalBudgetHours: 0,
                                TotalBudgetMinutes: 0,
                                BudgetedFeePerJob: 0,
                                BudgetedMillisecondsPerJob: 0,
                                Visible: true,
                                MonthlyBudget: 0,
                            };
    
                            initialBudgets.push(newBudget);
                        
                        };
                        
                    }, 500);

                    setTimeout(() => {
                        
                        Client.findByIdAndUpdate(currentClient._id, {
                            $set: {Budgets: initialBudgets}}, function (err,) {
                                if(err) {
                            
                                    console.log("Set Budgets Error for " + currentClient.ClientName + err);
                                    throw (err);
                                } else {

                                        Client.find({Company: company.company}, function (err, foundClients) {
                                            if(err) {
                                                console.log("Find clients error")
                                                res.status(500).send("Find clients Error");
                                                throw (err);
                                            };
                    
                                            responseClients = foundClients;

                                            console.log("Budgets for " + currentClient.ClientName + " Updated");
                                            res.status(200).json({
                                                message: "Budgets Added",
                                                clients: foundClients,
                                            });
                                        return;

                                        }).lean();
                                    };     
                        }).lean();
                    }, 1000); 
            }); 
    }).lean();
    }).lean();
});


// Route for adding Teams to a company
router.post("/addteam", (req, res) => {

    const newDetails=req.body.companyDetails;

    isCompanyNull(newDetails.name);

    Company.findOneAndUpdate({"Name": newDetails.name}, {
        $push: {Teams: newDetails.newTeam,}}, {new: true}, function(err, foundCompany) {
        if(err){
            console.log("Error Adding Team" + err);
            res.status(500).send("Error Adding Team");
            return;
        } else {
            console.log("Add Team Successful");
            res.status(200).json({
                message: "Team Added",
                teams: foundCompany.Teams});
        }
    });
});


module.exports = router;