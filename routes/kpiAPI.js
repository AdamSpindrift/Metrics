// Environment Variables
require('dotenv').config();
//Express
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("../models/company");
const SentaEmployee = require("../models/sentaemployee");
const User = require("../models/user");
const Budget = require("../models/budget");
const Client = require("../models/client");
const Job = require("../models/job");
const TimeStamp = require("../models/timestamp");
// KPI Mongoose Models
const CompanyKPI = require("../models/companykpi");
const JobRole = require("../models/jobrole");
const KPIEmployee = require("../models/kpiEmployee");
const KPI = require("../models/kpi");
const KPITarget = require("../models/kpiTarget");
const KPITemplate = require("../models/kpiTemplate");
// Other Imports
const axios = require("axios");
const request = require("request");
const path = require("path");
const uniqid = require("uniqid");
// Encryption
const bcrypt = require("bcrypt");
const saltRounds =  parseInt(process.env.SALT);
// Custom modules
const { title } = require("process");


// Setup Express
const app = express();

app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.use(express.static("client/build"));

// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

// Close Mongo on app exit
process.on("exit", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});

process.on("SIGINT", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});

process.on("SIGUSR1", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});

process.on("SIGUSR2", function() {
    db.close(function () {
        console.log("Mongoose disconnected on app termination");
        process.exit(0);
    });
});


// KPIs

router.post("/getcompanykpi", (req, res) => {
    
    newRequest = req.body.company2;
    let foundUsers = [];
    
    User.find({Company: newRequest.company}, function (err, foundUsers2) {
        if(err) {
            console.log("Company kpi Error " + err);
            res.status(500).send("Company KPI Error");
            throw(err);
        } {
            foundUsers = foundUsers2;
        };
    });

    CompanyKPI.findOne({Name: newRequest.company}, function (err, foundCompanyKPI) {
        if(err) {
            console.log("Company kpi Error " + err);
            res.status(500).send("Company KPI Error");
            throw(err);
        } else {
            console.log("Company KPI found");
            res.status(200).json({
                message: "Company KPI found",
                companykpi: foundCompanyKPI,
                users: foundUsers,
            });
            return;
        }
    });
})

router.post("/createkpi", (req, res) => {

    newRequest = req.body.kpiDetails;

    let dataType = "String";

    if(newRequest.dataType = "Number") {
        dataType = "Number";
    };

    const newKPITemplate = {
        Name: newRequest.name,
        Description: newRequest.description,
    };

    CompanyKPI.findOneAndUpdate({Name: newRequest.company}, {
        $push: {KPITemplates: newKPITemplate}}, { new: true },  function (err, foundCompany) {
        if(err) {             
            console.log("Add KPI Error: " + err);
            res.status(500).send("Add KPI Error");
             throw (err);
            } else {

                console.log("KPI Added");
                res.status(200).json({
                    message: "KPI Added",
                    KPICompany: foundCompany,
                });
                return;

    }});


});

// create kpi company

router.post("/createkpicompany", (req, res) => {

    newRequest = req.body.role;

    CompanyKPI.create({
        Name: newRequest.company,
        JobRoles: [],
        KPITemplates: [],
        KPIs: [],
    }, (err) => {
    if(err) {
        console.log("Add Company Error: " + err);
        res.status(500).send("Error");
        return;
    } else {
        res.status(200);
    };
    });
});

router.post("/createrole", (req, res) => {

    newRequest = req.body.role;

    const newRole = {
        Name: newRequest.name,
        KPIs: [],
    };

    CompanyKPI.findOneAndUpdate({Name: newRequest.company}, {
        $push: {JobRoles: newRole}}, { new: true },  function (err, foundCompany) {
        if(err) {             
            console.log("Add Role Error: " + err);
            res.status(500).send("Add Role Error");
             throw (err);
            } else {

                console.log("Role Added");
                res.status(200).json({
                    message: "Role Added",
                    KPICompany: foundCompany,
                });
                return;

    }});


});

router.post("/kpitorole", (req, res) => {

    newRequest = req.body.kpiJobRole;

    CompanyKPI.findOneAndUpdate({Name: newRequest.company, "JobRoles.Name": newRequest.jobRole}, {
        $push: {"JobRoles.$.KPIs": newRequest.kpiName}}, { new: true },  function (err, foundCompany) {
        if(err) {             
            console.log("Add KPI Error: " + err);
            res.status(500).send("Add KPI Error");
             throw (err);
            } else {

                console.log("KPI Added");
                res.status(200).json({
                    message: "KPI Added",
                    KPICompany: foundCompany,
                });
                return;

    }});


});

router.post("/initialtargets", (req, res) => {

    newRequest = req.body.companyDetails;

    let kpiRoles = "";

    CompanyKPI.findOne({Name: newRequest.company}, function (err, foundcompanyKPI) {
        if(err) {
            console.log("Company KPI Targets Error: " + err);
            res.status(500).send("Company KPI Targets Error");
            throw (err);
        } else {
            kpiRoles = foundcompanyKPI.JobRoles;
        };
    })

    User.find({Company: newRequest.company}, function (err, foundUsers) {
        if(err) {             
            console.log("Users KPI Targets Error: " + err);
            res.status(500).send("Users KPI Targets Error");
             throw (err);
            } else {

                for(let i = 0; i < foundUsers.length; i++) {

                    let thisUser = foundUsers[i];
                    let userRole = thisUser.JobTitle;
                    let kpisForUserRole = kpiRoles.find(role => role.Name === userRole);

                    let newTargets = [];

                    for(let i = 0; i<kpisForUserRole.length; i++) {
                        const kpiTarget = thisUser.KPITargets.find(t => t.Name ===kpisForUserRole[i]);

                        if(kpiTarget !== null || kpiTarget !== undefined) {

                            const newTarget = {
                                Name: kpisForUserRole[i],
                                Target: 0,
                            };

                            newTargets.push(newTarget);
                        };

                        if(i === kpisForUserRole.length-1) {
                            console.log("Updating User");

                            User.findOneAndUpdate({FirstName: thisUser.FirstName, LastName: thisUser.LastName, Company: thisUser.Company}, {
                                $set: {"User.$.KPITargets": newTargets,
                                        }}, function(err) {
                                if(err) {
                                    console.log("Update User Error " + err);
                                    throw(err);
                                } else {
                                    newTargets = [];
                                };
                            });
                        };

                    };

                    if(i === foundUsers.length-1) {

                        setTimeout(() => {
                            User.find({Company: newRequest.company}, function (err, foundUsers2) {
                                if(err) {             
                                    console.log("Users KPI Targets Error: " + err);
                                    res.status(500).send("Users KPI Targets Error");
                                    throw (err);
                                    } else {

                                        console.log("Targets Updated");
                                        res.status(200).json({
                                            message: "Targets Updated",
                                            users: foundUsers2,
                                        });
                                        return;
                                    };
                            });
                            
                        }, 1000);

                    };

                };


                

    }});


});



module.exports = router;