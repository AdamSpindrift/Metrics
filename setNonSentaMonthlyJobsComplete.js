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
const uniqid = require("uniqid");
const { format, subMonths, getDate } = require("date-fns");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));


const setNonSentaMonthlyJobsComplete = async () => {

    console.log("Setting Non Senta Monthly Jobs Complete");


    const adminJobID = process.env.ADMIN_JOB_ID;
    const meetingJobID = process.env.MEETING_JOB_ID;
    const quickQuestionJobID = process.env.QUICK_QUESTION_JOB_ID;

    const jobDate = format(subMonths(new Date(),1),"MMM yyyy");
    const completedDate = new Date();


    Job.updateMany({Title: "Admin " + jobDate}, {
        $set: {Status: "completed", CompletedDate: completedDate ,
            }}, function (err) {
        if(err) {             
            console.log("Set Admin job complete error: " + companyName + " " + err);
            throw (err);
        };
    });

    setTimeout(() => {

        Job.updateMany({Title: "Meeting " + jobDate}, {
            $set: {Status: "completed", CompletedDate: completedDate ,
                }}, function (err) {
            if(err) {             
                console.log("Set Meeting job complete error: " + companyName + " " + err);
                throw (err);
            };
        });    

    }, 100);

    setTimeout(() => {

        Job.updateMany({Title: "Quick Question " + jobDate}, {
            $set: {Status: "completed", CompletedDate: completedDate ,
                }}, function (err) {
            if(err) {             
                console.log("Set Quick Question job complete error: " + companyName + " " + err);
                throw (err);
            };
        });

    }, 200);
                

        
    setTimeout(() => {
        console.log("Closing Mongoose Connection");
        mongoose.disconnect();
    }, 1200000);        
    
    
};

// setNonSentaMonthlyJobsComplete();

if(getDate(new Date()) === 1) {
    setNonSentaMonthlyJobsComplete();
} else {
    mongoose.disconnect();
};

