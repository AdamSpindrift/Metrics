const express = require("express");
require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Job = require("./models/job");
// Exporter
const { parse } = require("json2csv");
//AWS
const AWS = require("aws-sdk");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});
// CSV
const { Parser }= require("json2csv");
// Email
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

// Keys
const s3Version = (process.env.AWS_API_VERSION);
const serverPost = (process.env.SERVER_POST);


// Create AWS S3 service object
s3 = new AWS.S3({apiVersion: s3Version});

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



const JobsToCSV = () => {

    Job.find({Company : "djca", Title : "Accounts production"}, async function(err, foundJobs){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        try {

            const fields1 = ['_id', 'ClientId', "ClientName", "Company", "Wid", "Title", "Date", "BudgetFee", "BudgetMilliseconds", "Timestamps", "Status", "ProfitLossMilliseconds", "ProfitLossFee", "AHR", "Duration", "CompletedDate"];
            const opts1 = { fields1 };
            const p1 = new Parser(opts1);

            const csv1 = await p1.parse(foundJobs);

            const testParser = new Parser();

            const testcsv = testParser.parse(foundJobs)

            const mailOptions = {
                from: "robots@metricsapp.io",
                to: "adam@djca.co.uk",
                subject: "Metrics Jobs Report",
                html: "<p>Hello</p><p>Here are your jobs.</p><p>Kind Regards<br>Metrics Team</p>",
                attachments: [{
                    filename: "Jobs.csv",
                    content: testcsv,
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

        setTimeout(() => {
            console.log("Closing Mongoose Connection");
            mongoose.disconnect();
        }, 5000);
    }).lean();
};

JobsToCSV();