const express = require("express");
require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Job = require("./models/job");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

const migrateJobs = async () => {

    let migrateCompany = "";
    const companyToMigrate = "seedaccountingsolutions";

    await Company.findOne({Name : companyToMigrate}, async function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        migrateCompany = foundCompany

        console.log("Company found - " + migrateCompany.Name);
    });

    const jobs = migrateCompany.Jobs;

    for (let i = 0; i < jobs.length; i++) {

        console.log("Creating job - " + i);

        let AHR = 0;
        let pl = 0;

        if(jobs[i].AHR !== NaN) {
            AHR = jobs[i].AHR;
        };

        if(jobs[i].ProfitLossMilliseconds !== NaN) {
            pl = jobs[i].ProfitLossMilliseconds;
        };

        Job.create({
            _id: jobs[i]._id,
            ClientId: jobs[i].ClientId,
            ClientName: jobs[i].ClientName,
            Company: companyToMigrate,
            Wid: jobs[i].Wid,
            Title: jobs[i].Title,
            Date: jobs[i].Date,
            BudgetFee: jobs[i].BudgetFee,
            BudgetMilliseconds: jobs[i].BudgetMilliseconds,
            Timestamps: jobs[i].Timestamps,
            Status: jobs[i].Status,
            ProfitLossMilliseconds: pl,
            ProfitLossFee: jobs[i].ProfitLossFee,
            AHR: AHR,
            Duration: jobs[i].Duration,
        }, (err) => {
            if(err) {
                console.log("Add Job Error: " + err);
            };
        });

        
                
       
        if(i === jobs.length-1) {
            setTimeout(() => {
                console.log("Closing Mongoose Connection");
                mongoose.disconnect();
            }, 150000);        
        };

    };
    
};


migrateJobs();


