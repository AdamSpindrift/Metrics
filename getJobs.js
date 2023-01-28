const express = require("express");
require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Job = require("./models/job");
const Client = require("./models/client");
const request = require("request");
const axios = require("axios");
const path = require("path");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));


const getJobs = async () => {

    console.log("Getting New Jobs");

    const allCompanies = await Company.find({});

    const lastCompany = (allCompanies.length - 1);

    for (let i = 0; i < allCompanies.length; i++) {

        let jobs = "";

        const company = allCompanies[i].Name;

        if(company !== "metrics") {

            Company.findOne({Name : allCompanies[i].Name}, async function(err, foundCompany){
                if(err){
                    console.log("No Company Found " + err);
                    throw(err);
                };

                Client.find({Company : allCompanies[i].Name}, async function(err, foundClients){
                    if(err){
                        console.log("No Company Found " + err);
                        throw(err);
                    };
                
                const apiKey = foundCompany.SentaAPIKey;
                const clients = foundClients;

                Job.find({Company: allCompanies[i].Name}, async function(err, foundJobs2) {
                    if(err) {
                        console.error(err);
                        res.status(404).send("Update Stamp Error");
                        return;
                    } else {

                        jobs = foundJobs2;
        
                for(let i=0; i < clients.length; i++) {
                    
                    const clientName = clients[i].ClientName;
        
                    await axios.get("https://" + foundCompany.Name + ".senta.co/api/jobs?cid=" + clients[i]._id + "&status=ready%2Coverdue%2Cpending" , { "headers" : {"accept": "application/json", "x-auth": apiKey }})
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
        
                        Company.findOne({Name : company}, async function(err, foundCompany){
                            if (err) {
                              console.log(err);
                              throw(err);
                            }
        
                            let budgetFee = 0;
                            let budgetMilliseconds = 0;
        
                            for(let i=0; i < newJobs.length; i++) {

                                const a = newJobs[i];
                                const jobClient = clients.find(c => c._id === a.cid);

                                if(jobClient.Budgets !== undefined) {
                                    const budgets = jobClient.Budgets;
        
                                if(budgets !== null || budgets !== undefined) {
                                    const jobBudget = budgets.find(b => b._id === a.wid);
    
                                    if(jobBudget !== undefined) {
                                        budgetFee = parseFloat(jobBudget.BudgetedFeePerJob);
                                        budgetMilliseconds = parseFloat(jobBudget.BudgetedMillisecondsPerJob);

                                        if(isNaN(budgetMilliseconds)) {
                                            budgetMilliseconds = 0;
                                        };

                                        if(isNaN(budgetFee)) {
                                            budgetFee = 0;
                                        };
                                    };
                                };
                                };
        
                                const dateArray = a.date.split("T");
                                        
                                setTimeout(() => {
                                    Job.create({
                                        _id: a._id,
                                        ClientId: a.cid,
                                        ClientName: clientName,
                                        Company: foundCompany.Name,
                                        Wid: a.wid,
                                        Title: a.title,
                                        Date: dateArray[0],
                                        BudgetFee: budgetFee,
                                        BudgetMilliseconds: budgetMilliseconds,
                                        Timestamps: [],
                                        Status: "ready",
                                        ProfitLossMilliseconds: budgetMilliseconds,
                                        ProfitLossFee: budgetFee,
                                        CompletedDate: new Date(1970,0,1),
                                        AccProdRevenue: 0,
                                        Duration: 0,
                                    }, (err, ) => {
                                        if(err) {
                                            console.log("Add Job Error: " + err);
                                            console.log(foundCompany.Name)
                                            throw (err);
                                        };
                                    });

                                }, 500);
                                
                            };
                            
                        });
                    });
                };
            }}).lean();
            }).lean();
            }).lean();
    
            if( i === lastCompany) {
                setTimeout(() => {
                    console.log("Closing Mongoose Connection");
                    mongoose.disconnect();
                }, 180000);
            };

        }

        
        
    };
};


getJobs();