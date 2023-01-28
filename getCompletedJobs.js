const express = require("express");
const { format } = require("date-fns");
require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Job = require("./models/job");
const Client = require("./models/client");
const axios = require("axios");
const request = require("request");
const path = require("path");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));


const getCompletedJobs = async () => {

    console.log("Getting Completed Jobs");

    const foundCompanies = await Company.find({});

    const allCompanies = await foundCompanies.filter(c => c.Name !== "metrics");


    for (let i = 0; i < allCompanies.length; i++) {

        let currentI = i;

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
    
            for(let i=0; i < clients.length; i++) {

                let readyJobs = [];

                Job.find({ClientId: clients[i]._id, Status: "ready"}, function(err, foundJobs){
                    if(err){
                        console.log("No Company Found " + err);
                        throw(err);
                    } else {
                        readyJobs = foundJobs.map(j => j._id);
                    }
                });
    
                await axios.get("https://" + foundCompany.Name + ".senta.co/api/jobs?cid=" + clients[i]._id + "&status=completed" , { "headers" : {"accept": "application/json", "x-auth": apiKey }})
                .catch(function (error) {
                    if (error.response) {
                        console.log("Response Error - " + error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                        throw(error);
                    } else if (error.request) {
                        console.log("Request Error - " + error.request);
                        throw(error);
                    } else {
                        console.log("Error - " + error.message);
                        throw(error);
                    };
                })
                .then(response => {
                    try {
                        const response1 = response;
    
                        if (response1 === null || undefined){
                            return;
                        };
    
                        const responseData = response1.data;
    
                        if (responseData === null || undefined){
                            return;
                        };
    
                        const foundJobs = responseData.docs;
    
                        if (foundJobs === null || undefined){
                            return;
                        };



                        for (let i = 0; i < foundJobs.length; i++) {

                            const completedDate = new Date();

                            if(readyJobs.includes(foundJobs[i]._id)) {

                                Job.findOneAndUpdate({_id: foundJobs[i]._id}, {
                                    $set: {Status: "completed" , CompletedDate: completedDate}}, function (err) {
                                    if(err) {             
                                        console.log("Update Job Error: " + err);
                                        throw (err);
                                    };
                                });
                            };

                            
                        
                        };
                    
                    } catch(err) {
                        console.log("Error with Senta Response - " + err);
                        throw(err);
                    };
                })
                .catch(err => {throw(err)});
            };
        }).lean();
        }).lean();

    
    };

    setTimeout(() => {
        console.log("Closing Mongoose Connection");
        mongoose.disconnect();
    }, 2700000);
};


getCompletedJobs();