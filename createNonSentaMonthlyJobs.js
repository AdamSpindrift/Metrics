const express = require("express");
const { format, getDate } = require("date-fns");
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


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));


const createNonSentaMonthlyJobs = async () => {

    console.log("Creating Non Senta Monthly Jobs");

    const foundCompanies = await Company.find({});

    const allCompanies = await foundCompanies.filter(c => c.Name !== "metrics");

    const thisMonth = format(new Date(),"MMM yyyy");

    const adminJobID = process.env.ADMIN_JOB_ID;
    const meetingJobID = process.env.MEETING_JOB_ID;
    const quickQuestionJobID = process.env.QUICK_QUESTION_JOB_ID;

    for (let i = 0; i < allCompanies.length; i++) {

        let currentI = i;

        Client.find({Company : allCompanies[i].Name}, async function(err, foundClients){
            if(err){
                console.log("No Company Found " + err);
                throw(err);
            };

            const clients = foundClients;
            const companyName = allCompanies[i].Name;
    
            for(let i=0; i < clients.length; i++) {

                const adminBudget = clients[i].Budgets.find(b => b._id === adminJobID);
                const meetingBudget = clients[i].Budgets.find(b => b._id === meetingJobID);
                const quickQuestionBudget = clients[i].Budgets.find(b => b._id === quickQuestionJobID);

                let adminBudgetTime = 0;
                let adminBudgetFee = 0;

                let meetingBudgetTime = 0;
                let meetingBudgetFee = 0;

                let quickQuestionBudgetTime = 0;
                let quickQuestionBudgetFee = 0;

                if(adminBudget !== undefined) {
                    adminBudgetTime = adminBudget.BudgetedMillisecondsPerJob;
                    adminBudgetFee = adminBudget.BudgetedFeePerJob;
                };

                if(meetingBudget !== undefined) {
                    meetingBudgetTime = meetingBudget.BudgetedMillisecondsPerJob;
                    meetingBudgetFee = meetingBudget.BudgetedFeePerJob;
                };

                if(quickQuestionBudget !== undefined) {
                    quickQuestionBudgetTime = quickQuestionBudget.BudgetedMillisecondsPerJob;
                    quickQuestionBudgetFee = quickQuestionBudget.BudgetedFeePerJob;
                };
    
                const clientName = clients[i].ClientName;
                const adminID = clientName + uniqid() + "1";
                const meetingID = clientName + uniqid() + "2";
                const quickQuestionID = clientName + uniqid() + "3";
                
                Job.find({ClientId: clients[i]._id, Title:"Admin " + thisMonth}, function(err, foundJob) {
                    if(err) {

                    } else {
                       
                        if(foundJob.length === 0) {
                            Job.create({
                                _id: adminID,
                                ClientId: clients[i]._id,
                                ClientName: clientName,
                                Company: companyName,
                                Wid: adminJobID,
                                Title: "Admin " + thisMonth,
                                Date: new Date(),
                                BudgetFee: adminBudgetFee,
                                BudgetMilliseconds: adminBudgetTime,
                                Timestamps: [],
                                Status: "ready",
                                ProfitLossMilliseconds: adminBudgetTime,
                                ProfitLossFee: adminBudgetFee,
                                CompletedDate: new Date(1970,0,1),
                                AccProdRevenue: 0,
                                Duration: 0,
                            });
                        };
                    };
                }).lean();

                Job.find({ClientId: clients[i]._id, Title:"Meeting " + thisMonth}, function(err, foundJob) {
                    if(err) {

                    } else {
                       
                        if(foundJob.length === 0) {
                            Job.create({
                                _id: meetingID,
                                ClientId: clients[i]._id,
                                ClientName: clientName,
                                Company: companyName,
                                Wid: meetingJobID,
                                Title: "Meeting " + thisMonth,
                                Date: new Date(),
                                BudgetFee: meetingBudgetFee,
                                BudgetMilliseconds: meetingBudgetTime,
                                Timestamps: [],
                                Status: "ready",
                                ProfitLossMilliseconds: meetingBudgetTime,
                                ProfitLossFee: meetingBudgetFee,
                                CompletedDate: null,
                                AccProdRevenue: 0,
                                Duration: 0,
                            });
                        };
                    };
                }).lean();

                Job.find({ClientId: clients[i]._id, Title:"Quick Question " + thisMonth}, function(err, foundJob) {
                    if(err) {

                    } else {

                       
                        if(foundJob.length === 0) {
                            Job.create({
                                _id: quickQuestionID,
                                ClientId: clients[i]._id,
                                ClientName: clientName,
                                Company: companyName,
                                Wid: quickQuestionJobID,
                                Title: "Quick Question " + thisMonth,
                                Date: new Date(),
                                BudgetFee: quickQuestionBudgetFee,
                                BudgetMilliseconds: quickQuestionBudgetTime,
                                Timestamps: [],
                                Status: "ready",
                                ProfitLossMilliseconds: quickQuestionBudgetTime,
                                ProfitLossFee: quickQuestionBudgetFee,
                                CompletedDate: null,
                                AccProdRevenue: 0,
                                Duration: 0,
                            });
                        };
                    };
                }).lean();
               
                
                

                
            }
            }).lean();

            if(currentI === allCompanies.length-1) {
                setTimeout(() => {
                    console.log("Closing Mongoose Connection");
                    mongoose.disconnect();
                }, 600000);        
            };
        };
};

// createNonSentaMonthlyJobs();

if(getDate(new Date()) === 1) {
    createNonSentaMonthlyJobs();
} else {
    mongoose.disconnect();
};

