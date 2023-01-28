const express = require("express");
require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const TimeStamp = require("./models/timestamp");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

const migrateTimestamps = async () => {

    let djca = "";

    await Company.findOne({Name : "seedaccountingsolutions"}, async function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        djca = foundCompany;
        console.log("Company found - " + djca.Name);
    });

    const timeStamps = djca.TimeStamps;

    for (let i = 0; i < timeStamps.length; i++) {

        console.log("Creating new Stamp - " + i);

        const newStamp = {
            
        };

        TimeStamp.create({
            _id: timeStamps[i]._id,
            Company: "seedaccountingsolutions",
            EmployeeName: timeStamps[i].EmployeeName,
            EmployeeCostPerHour: timeStamps[i].EmployeeCostPerHour,
            JobTitle: timeStamps[i].JobTitle,
            JobId: timeStamps[i].JobId,
            ClientName: timeStamps[i].ClientName,
            ClientId: timeStamps[i].ClientId,
            StartTime: timeStamps[i].StartTime,
            EndTime: timeStamps[i].EndTime,
            Duration: timeStamps[i].Duration,
            Description: timeStamps[i].Description,
            Cost: timeStamps[i].Cost,
            ManualEdit: timeStamps[i].ManualEdit,
        }, (err, name) => {
            if(err) {
                console.log("Add Company Error: " + err);
                res.status(500).send("Error");
                return;
            };
        });

        
                
       
        if(i === timeStamps.length-1) {
            setTimeout(() => {
                console.log("Closing Mongoose Connection");
                mongoose.disconnect();
            }, 600000);        
        };

    };
    
};


migrateTimestamps();


