const express = require("express");
require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Client = require("./models/client");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

const migrateClients = async () => {

    let migrateCompany = "";
    const companyToMigrate = "rowdenslimited";

    await Company.findOne({Name : companyToMigrate}, async function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        migrateCompany = foundCompany

        console.log("Company found - " + migrateCompany.Name);
    });

    const clients = migrateCompany.Clients;

    for (let i = 0; i < clients.length; i++) {

        console.log("Creating client - " + i);

        Client.create({
            _id: clients[i]._id,
            ClientName: clients[i].ClientName,
            ClientState: clients[i].ClientState,
            ClientType: clients[i].ClientType,
            Company: companyToMigrate,
            AccManager: clients[i].AccManager,
            Budgets: clients[i].Budgets,
            YearlyFee: clients[i].YearlyFee,
            ProfitLossMilliseconds: clients[i].ProfitLossMilliseconds,
            ProfitLossFee: clients[i].ProfitLossFee,
            AHR: clients[i].AHR,
            XeroTenantID: "",
        }, (err) => {
            if(err) {
                console.log("Add Client Error: " + err);
            };
        });

        
                
       
        if(i === clients.length-1) {
            setTimeout(() => {
                console.log("Closing Mongoose Connection");
                mongoose.disconnect();
            }, 30000);        
        };

    };
    
};


migrateClients();


