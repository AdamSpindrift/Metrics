require('dotenv').config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Client = require("./models/client");
// Exporter
const { parse } = require("json2csv");
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

    Company.findOne({Name : "djca"}, async function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        try {

            const thisWeeksStamps = await foundCompany.TimeStamps.filter(t => new Date(t.StartTime) > startOfWeek(new Date()));
            const csv = await parse(thisWeeksStamps);

            const mailOptions = {
                from: "robots@metricsapp.io",
                to: "rob@djca.co.uk, daniele@djca.co.uk, adam@djca.co.uk",
                subject: "Metrics Timestamps " + format(startOfWeek(new Date()), "dd/MM/yyyy") + " to " + format(endOfWeek(new Date()), "dd/MM/yyyy"),
                html: "<p>Hello</p><p>Here are this weeks Timestamps.</p><p>Kind Regards<br>Metrics Team</p>",
                attachments: [{
                    filename: "djca_Timestamps " + format(startOfWeek(new Date()), "dd/MM/yyyy") + " to " + format(endOfWeek(new Date()), "dd/MM/yyyy") + ".csv",
                    content: csv,
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

    });
};


//Only Send On A Friday

if(isFriday(new Date()) === true) {
    sendReport();
} else {
    mongoose.disconnect();
};