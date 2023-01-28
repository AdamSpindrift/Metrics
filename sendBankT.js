require('dotenv').config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Client = require("./models/client");
const WellpleasedT = require("./models/wellpleasedT");
// Exporter
const { parse }= require("json2csv");
const { startOfWeek, endOfWeek, format, isFriday } = require("date-fns");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));



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



const sendReport = async () => {

    const foundT = await WellpleasedT.find({});

    console.log(foundT[0].Transactions);

        try {

            const t = foundT[0].Transactions;

            const fields = ["BankTransactionID", "BankAccount", "Type", "IsReconciled", "HasAttachments", "DateString", "Date", "Status", "LineAmountTypes", "LineItems", "Total", "UpdatedDateUTC", "CurrencyCode" ];
            const opts1 = { fields };
            // const p1 = new Parser(opts1);

            

            const csv1 = await parse(t, opts1);

            
            

            const mailOptions = {
                from: "robots@metricsapp.io",
                to: "adam@adampower.io",
                subject: "BankT",
                html: "<p>Hello</p>",
                attachments: [{
                    filename: "WellPleased_Bank_T.csv",
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

        setTimeout(() => {
            console.log("Closing Mongoose Connection");
            mongoose.disconnect();
        }, 10000);

    
};





    sendReport();
