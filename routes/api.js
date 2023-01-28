const Company = require("../models/company");
const SentaEmployee = require("../models/sentaemployee");
const User = require("../models/user");
const Budget = require("../models/budget");
const Client = require("../models/client");
const Job = require("../models/job");
const TimeStamp = require("../models/timestamp");
const TransactionCount = require("../models/transactionCount");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require("mongoose");
const request = require("request");
const path = require("path");
const {set, addMinutes, getYear, differenceInBusinessDays, format, startOfYear, endOfYear} = require("date-fns");
const formatRFC7231 = require("date-fns/formatRFC7231");
const {utcToZonedTime} = require("date-fns-tz");
// Environment Variables
require('dotenv').config();
// For Encryption
const bcrypt = require("bcrypt");
const saltRounds =  parseInt(process.env.SALT);
// Image Upload
const AWS = require("aws-sdk");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});
// Custom modules
const isCompanyNull = require("../custom_modules/companyNull");
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

function add(accumulator, a) {
    return accumulator + a;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};


//AWS S3
const s3Version = (process.env.AWS_API_VERSION);
// Create AWS S3 service object
s3 = new AWS.S3({apiVersion: s3Version});


// Route for adding a new Company
router.post("/newcompany",(req, res) => {

    const contact=req.body.contact;

    // loops over properties in Employee object
    // for(var property in Employees){
    //     console.log(property + " = " + Employees[property]);
    // }

    //comment to restart
             
    Company.create({
        Name: contact.company,
        Logo: "",
        Application: contact.applicationSelection,
        AHR: 0,
        SentaAPIKey: null,
        ClientListActive: null,
        ClientListFormer: null,
        Employees: [],
        Clients: [],
        XeroAccessToken: "",
        XeroRefreshToken: "",
        CodeVerifier: "",
        Teams: [],
    }, (err, name) => {
        if(err) {
            console.log("Add Company Error: " + err);
            res.status(500).send("Error");
            return;
        } else {

            bcrypt.hash(contact.password, saltRounds, function(err, hash){
                console.log("Hashing");
    
                if(err) {
                    console.log("Add User Error: " + err);
                    res.status(500).send("Add User Error");
                    return;
                };
    
                User.create({
                    FirstName: contact.fName,
                    LastName: contact.lName,
                    Company: contact.company,
                    Email: contact.email,
                    Password: hash,
                    Access: "Admin",
                    ActiveTime: null,
                    ActiveUser: true,
                    TodaysStamps: [],
                    CostPerHour: 0,
                    JobTitle: "Team Member",
                    DayComplete: false,
                    EmailVerified: false,
                }, (err, ) => {
                    if(err) {
                        console.log("Add User Error: " + err);
                        res.status(500).send("Add User Error");
                        throw(err);
                        return;
                    } else {
                        res.status(200).json(name);
                        console.log("New User Added");
                        return;
                    }
                });
            });
        }
    });  
});

// Route for adding company logo
router.post("/addlogo", upload.single("file"), async(req, res) => {

    const image = req.file;
    const data = req.body;

    const params = {
        Bucket: "metricsuploads/clientlogos",
        Key: data.name,
        ACL: 'public-read',
        Body: image.buffer,
        ContentType: image.mimetype
      };

    s3.putObject(params, function(err, data){
        if (err) console .log("Error Occured in putObject - " + err );
        else console.log("Successfully Uploaded " + data.name + " to metricsuploads");
    });

    Company.findOneAndUpdate({"Name": data.company}, {
        Logo: "https://metricsuploads.s3.eu-west-2.amazonaws.com/clientlogos/" + data.name,
        }, function(err) {
            if(err){
                console.log("Update Company Error" + err);
                res.status(500).send("Error Updating Company Details");
                return;
            } else {
                console.log("Company Update Successful");
                res.json({
                    message: "Logo Updated",
                    logo: "https://metricsuploads.s3.eu-west-2.amazonaws.com/clientlogos/" + data.name,
                });
            }
    });

});

// Route for updating a company
router.post("/updatecompany", (req, res) => {

    const newDetails=req.body.companyDetails;
    let logoPath="";

    isCompanyNull(newDetails.name);

    Company.findOneAndUpdate({"Name": newDetails.name}, {
        Name: newDetails.name,
        Logo: logoPath,
        Application: "Senta",
        AHR: newDetails.AHR,
        SentaAPIKey: newDetails.SentaAPIKey,
    }, function(err) {
        if(err){
            console.log("Update Company Error" + err);
            res.status(500).send("Error Updating Company Details");
            return;
        } else {
            console.log("Company Update Successful");
            res.status(200).send("Company Updated");
        }
    });
});


// Route for updating a target AHR
router.post("/updateahr", (req, res) => {

    const newDetails=req.body.companyDetails;

    isCompanyNull(newDetails.name);

    Company.findOneAndUpdate({"Name": newDetails.name}, {
        AHR: newDetails.AHR,
    }, function(err) {
        if(err){
            console.log("Update Company Error" + err);
            res.status(500).send("Error Updating Company Details");
            return;
        } else {
            console.log("Company Update Successful");
            res.status(200).send("Company Updated");
        }
    });
});


// Route for updating a Senta API key
router.post("/usenta189", (req, res) => {

    const newDetails=req.body.companyDetails;

    isCompanyNull(newDetails.name);

    Company.findOneAndUpdate({"Name": newDetails.name}, {
        SentaAPIKey: newDetails.SentaAPIKey,
    }, function(err) {
        if(err){
            console.log("Update Company Error" + err);
            res.status(500).send("Error Updating Company Details");
            return;
        } else {
            console.log("Company Update Successful");
            res.status(200).send("Company Updated");
        }
    });
});


// Route for updating client list ref
router.post("/clientlist", (req, res) => {

    const newDetails=req.body.companyDetails;

    isCompanyNull(newDetails.name);

    Company.findOneAndUpdate({"Name": newDetails.name}, {
        ClientListActive: newDetails.ClientListActive,
    },  { new: true }, function(err, foundCompany) {
        if(err){
            console.log("Update Company Error" + err);
            res.status(500).send("Error Updating Company Details");
            return;
        } else {
            console.log("Company Update Successful");
            res.json({
                message: "Company Updated",
                activeList: foundCompany.ClientListActive,
                formerList: foundCompany.ClientListFormer,
            });
        }
    });
});


// Route for updating former client list ref
router.post("/formerclientlist", (req, res) => {

    const newDetails=req.body.companyDetails;

    isCompanyNull(newDetails.name);

    Company.findOneAndUpdate({"Name": newDetails.name}, {
        ClientListFormer: newDetails.ClientListFormer,
    }, {new: true}, function(err, foundCompany) {
        if(err){
            console.log("Update Company Error" + err);
            res.status(500).send("Error Updating Company Details");
            return;
        } else {
            console.log("Company Update Successful");
            res.json({
                message: "Company Updated",
                activeList: foundCompany.ClientListActive,
                formerList: foundCompany.ClientListFormer,
            });
        }
    });
});



// Route for getting company details
router.post("/getcompany", (req, res) => {

    const data = req.body.companyDetails;

    isCompanyNull(data.name);


    Company.findOne({Name: data.name}, function(err, foundCompany) {
        if(err){
            console.log("Company Not Found" + err);
            res.status(401).send("Company Not Found");
            return;
        } else {
            res.json({
                message: "Company Updated",
                company: foundCompany,
            });
        }
    }).lean();
});


    // Route for adding a new User

    router.post("/newuser", (req, res) => {

        const item=req.body.contact;
        
        bcrypt.hash(item.password, saltRounds, function(err, hash){
            console.log("Hashing");

            if(err) {
                console.log("Add User Error: " + err);
                res.status(500).send("Add User Error");
                return;
            };

            const name= item.fName;
            
            User.create({
                FirstName: item.fName,
                LastName: item.lName,
                Company: item.company,
                Email: item.email,
                Password: hash,
                Access: item.access,
                ActiveTime: null,
                ActiveUser: true,
                TodaysStamps: [],
                CostPerHour: item.costPerHour,
                JobTitle: "Team Member",
                DayComplete: false,
                EmailVerified: false,
                WorkingDaysWeek: item.daysWeek,
                WorkingHoursDay: item.hoursDay,
            }, (err, ) => {
                if(err) {
                    console.log("Add User Error: " + err);
                    res.status(500).send("Add User Error");
                    return;
                } else {
                    res.status(200).json(name);
                    console.log("New User Added");
                    return;
                }
            });
        });
    });


// Route User Password reset
router.post("/resetpassword", (req, res) => {

    const newRequest=req.body.contact;
    
    bcrypt.hash(newRequest.password, saltRounds, function(err, hash){
        console.log("Hashing");
        if(err) {
            console.log("Password Reset Error: " + err);
            res.status(500).send("Password Reset Error");
            return;
        };

        User.findOneAndUpdate({Company: newRequest.company, FirstName: newRequest.fName, LastName: newRequest.lName}, 
            {$set: {Password: hash}}, function(err, results){
                if(err) {
                    
                console.log("Employee Targets Error: " + err);
                res.status(500).send("Employee Targets Error");
                 throw (err);
                } else {
                    console.log("Password Updated");
                    res.status(200).send("Password Updated");
                };
            });

    });
});


// Route for editing a user
router.post("/updateuser", (req, res) => {

    const newRequest = req.body.contact;

    User.findOneAndUpdate({Company: newRequest.company, _id: newRequest.id},
        {$set: {FirstName: newRequest.fName, LastName: newRequest.lName, Access: newRequest.access, CostPerHour: newRequest.costPerHour, JobTitle: newRequest.jobTitle}}, 
        function (err, results) {
            if(err){
                console.error("Update User Error - " + err);
                res.status(500).send("Update User Error");
                throw(err);
            } else {
                console.log("User " + newRequest.fName + " " + newRequest.lName + " Updated");
                res.status(200).send("User " + newRequest.fName + " " + newRequest.lName + " Updated");
            };
        })
});



    // Get All Users
    router.post("/getusers", (req, res) => {
        const newRequest = req.body.companyDetails;

        User.find({Company: newRequest.company}, function (err, foundUsers){
            if(err) {             
                console.log("All Users Error: " + err);
                res.status(500).send("All Users Error");
                throw (err);
            } else {
        
                console.log("Sending Users");
                res.status(200).json({
                    message: "Users Recieved",
                    users: foundUsers,
                });
                return;
            };
        }).lean();

    });




    // Route for Login

    router.post("/login", async (req, res) => {

        let responseUser = {
            fName: "",
            lName: "",
            company: "",
            email: "",
            activeTime: null,
            auth: false,
        };

        const post=req.body.user;
        console.log("login post recieved - " + post.email);

        let authFail = {
            auth: false,
        };

        if(post.email === null || post.email === "undefined") {
            console.log("Email is Null or Undefined");
            res.json({
                message: "Email is Null or Underfined",
                user: authFail
            });
            return;
        };

        User.findOne({Email : post.email}, function(err, foundUser){

            if(foundUser === null || foundUser === "undefined") {
                console.log("User is Null or Undefined");
                res.json({
                    message: "User is Null or Underfined",
                    user: authFail
                });
                return;
            };

            if (err) {
                console.log("Find User Error" + err);
                res.status(500).send("Find User Error");
                res.json({
                    message: "Error",
                    user: authFail
                });
                throw (err);
            };

            responseUser = {
                fName: foundUser.FirstName,
                lName: foundUser.LastName,
                access: foundUser.Access,
                company: foundUser.Company,
                email: foundUser.Email,
                activeTime: foundUser.ActiveTime,
                auth: true,
                dayComplete: foundUser.DayComplete,
                workingHoursDay: foundUser.WorkingHoursDay,
                workingDaysWeek: foundUser.WorkingDaysWeek,
            };

            let todayStamps = [];
            let settingsComplete = true;
            let jobs = [];
            let activeStamp = {};

            Job.find({Company: foundUser.Company}, function(err, foundJobs) {
                if(err) {
                    console.log("Get Timestamps Error: " + err);
                    res.status(500).send("Get Timestamps Error");
                    throw (err);
                } else {
                    jobs = foundJobs;
                };
            }).lean();

            TimeStamp.find({Company: foundUser.Company}, function(err, foundStamps) {
                if(err) {
                    console.log("Get Timestamps Error: " + err);
                    res.status(500).send("Get Timestamps Error");
                    throw (err);
                } else {

                    activeStamp = foundStamps.find(s => s._id === responseUser.activeTime);

                    Company.findOne({Name: foundUser.Company}, function (err, foundCompany){

                        if(err) {
                            console.log("Employees not found error: " + err);
                            res.status(404).send("Employees not found")
                            throw (err);
                        } else {

                            

                            if(foundCompany.SentaAPIKey === null) {
                                settingsComplete = false;
                            };

                            if(foundCompany.ClientListActive === null) {
                                settingsComplete = false;
                            };

                            if(foundCompany.ClientListFormer === null) {
                                settingsComplete = false;
                            };


                            for (let i = 0; i < foundUser.TodaysStamps.length; i++) {
                                    
                                const foundTime = foundStamps.find(stamp => stamp._id === foundUser.TodaysStamps[i]);


                                    if (foundTime !== undefined) {
                                        todayStamps.push(foundTime);  
                                    };    
                                

                            };
                        };
                    }).lean();

            let logo = "";
            let teams = [];
            let transactions = [];
            let users = [];
            let startTime = "";

            if(activeStamp !== undefined) {
                activeStamp = new Date(activeStamp.StartTime);
            };

            Company.findOne({Name: foundUser.Company}, function(err, foundCompany){
                if(err) {
                    console.log("Employees not found error: " + err);
                    res.status(404).send("Employees not found")
                    throw (err);
                } else {
                    logo = foundCompany.Logo;
                    teams = foundCompany.Teams;
                }
            }).lean();

            TransactionCount.find({Company: foundUser.Company}, function(err, foundTransactions){
                if(err) {
                    console.log("Employees not found error: " + err);
                    res.status(404).send("Employees not found")
                    throw (err);
                } else {
                    transactions = foundTransactions;
                }
            }).lean();

            User.find({Company: foundUser.Company}, function(err, foundUsers){
                if(err) {
                    console.log("Employees not found error: " + err);
                    res.status(404).send("Employees not found")
                    throw (err);
                } else {
                    users = foundUsers;
                };
            }).lean();



            // Find Clients
            Client.find({Company: foundUser.Company}, function(err, foundClients){
                if(err) {
                    console.log("Employees not found error: " + err);
                    res.status(404).send("Employees not found")
                    throw (err);
                } else {
                    

                    const employees = [];
              
                   bcrypt.compare(post.password, foundUser.Password, function(err, result){
                        if (result === true) {
                            console.log("Authorization Success - " + foundUser.FirstName + " " + foundUser.LastName);

                            
                            res.json({
                                message: "Logged In",
                                user: responseUser,
                                employees: employees,
                                stamps: todayStamps,
                                allStamps: foundStamps,
                                jobs: jobs,
                                clients: foundClients,
                                settingsComplete: settingsComplete,
                                logo: logo,
                                transactions: transactions,
                                users: users,
                                teams: teams,
                                startTime: startTime,
                            });
                            return;
                            
                            
                            
                        } else {
                            console.log("Authorization Fail");
                            console.log("Passwords Don't Match");
                            res.json({
                                message: "Authorisation Failed Passwords Don't Match",
                                user: authFail
                            });
                            return;
                        };
                    });

                };
                }).lean();
                }
            }).lean();
        }).lean();
    });



// Update Budget
router.post("/updatebudget", (req, res) => {
    console.time("Update Budget");

    const data = req.body.budgetDetails;

    isCompanyNull(data.company);

    let booleanVisibility = true;
    if(data.visibility === "Visible") {
        booleanVisibility = true;
    };
    if(data.visibility === "Hidden") {
        booleanVisibility = false;
    }

    let perJobDivisor = 1;

    if (data.frequency === "Daily") {
        perJobDivisor = 255;
    };

    if (data.frequency === "Weekly") {
        perJobDivisor = 52;
    };

    if (data.frequency === "Fortnightly") {
        perJobDivisor = 26;
    };

    if (data.frequency === "2 per Month") {
        perJobDivisor = 24;
    };

    if (data.frequency === "Monthly") {
        perJobDivisor = 12;
    };

    if (data.frequency === "Quarterly") {
        perJobDivisor = 4;
    };

    const feePerJob = (parseFloat(data.totalBudget) / perJobDivisor);
    const budgetHoursPerJob = (parseFloat(data.totalBudgetHours) / perJobDivisor);
    const budgetMinutesPerJob = (parseFloat(data.totalBudgetMinutes) / perJobDivisor);
    const hoursToMilliseconds = (budgetHoursPerJob * 3600000);
    const minutesToMilliseconds = (budgetMinutesPerJob * 60000);
    const millisecondsPerJob = (hoursToMilliseconds + minutesToMilliseconds);
    
    if (data.globalUpdate === "No") {

        let jobs = []

        Job.find({Company: data.company}, function(err, foundJobs) {
            if(err) {
                console.log("Get Timestamps Error: " + err);
                res.status(500).send("Get Timestamps Error");
                throw (err);
            } else {
                jobs = foundJobs;
        

        Client.findById(data.client, async function(err, foundClient) {
            if(err) {
                console.log("Budget Update Error - " + err);
                res.status(500).json({
                    message: "Budget Update Error"});
                throw(err);
            } else {
        
                const sameBudgets = await foundClient.Budgets.filter(budget => budget._id !== data.budgetID);
                const oldBudget = await foundClient.Budgets.filter(budget => budget._id === data.budgetID);

                const newBudget = {
                    _id: oldBudget[0]._id,
                    Title: oldBudget[0].Title,
                    Frequency: data.frequency,
                    TotalBudget: parseFloat(data.totalBudget),
                    TotalBudgetHours: data.totalBudgetHours,
                    TotalBudgetMinutes: data.totalBudgetMinutes,
                    BudgetedFeePerJob: feePerJob,
                    BudgetedMillisecondsPerJob: millisecondsPerJob,
                    Visible: booleanVisibility,
                    MonthlyBudget: (parseFloat(data.totalBudget) / 12),
                };

                const newBudgets = [...sameBudgets, newBudget];

                const updateJobsAll = await jobs.filter(job => job.Wid === data.budgetID && job.ClientId === data.client);
                const updateJobs = await updateJobsAll.filter(job => job.Status === "ready"); 
                let newJobs = await jobs.filter(job => job.ClientId !== data.client);
                const clientJobs = await jobs.filter(job => job.ClientId === data.client);
                const addClientJobs = await clientJobs.filter(job => job.Wid !== data.budgetID);
                const addClientJobsA = await updateJobsAll.filter(job => job.Status !== "ready");

                if(addClientJobs.length >0) {

                    for (let i = 0; i<addClientJobs.length; i++){
                        newJobs.push(addClientJobs[i]);
                    };
                };

                if(addClientJobsA.length > 0) {

                    for(let i = 0; i<addClientJobsA.length; i++){
                        newJobs.push(addClientJobsA[i]);
                    };
                };

                if (updateJobs.length > 0) {

                    for (let i = 0; i<updateJobs.length; i++) {

                        const currentTimeCost = (updateJobs[i].BudgetMilliseconds - updateJobs[i].ProfitLossMilliseconds);

                        const durationHours = (parseInt(updateJobs[i].Duration) / 3600000);

                        let newAHR = (feePerJob / durationHours);

                        if(isNaN(newAHR)) {
                            newAHR = 0;
                        };

                        setTimeout(() => {

                            Job.findOneAndUpdate({_id: updateJobs[i]._id}, {
                                $set: {_id: updateJobs[i]._id,
                                    ClientId: updateJobs[i].ClientId,
                                    ClientName: updateJobs[i].ClientName,
                                    Company: updateJobs[i].Company,
                                    Wid: updateJobs[i].Wid,
                                    Title: updateJobs[i].Title,
                                    Date: updateJobs[i].Date,
                                    BudgetFee: feePerJob,
                                    BudgetMilliseconds: millisecondsPerJob,
                                    Timestamps: updateJobs[i].Timestamps,
                                    Status: updateJobs[i].Status,
                                    ProfitLossMilliseconds: (millisecondsPerJob - currentTimeCost),
                                    Duration: updateJobs[i].Duration,
                                    AHR: newAHR, }}, function (err) {
                                        if(err) {             
                                            console.log("Update Job Error: " + err);
                                            throw (err);
                                        };
                            });

                        }, 200);
                        
                    };
                };

                setTimeout(() => {


                    Client.findByIdAndUpdate(data.client, {$set: {Budgets: newBudgets}}, function(err) {
                        if(err) {
                            console.log("Budget Update Error - " + err);
                            res.status(500).json({
                                message: "Budget Update Error"});
                            throw(err);
                            };
                    });

                    console.log("Budget Updated");

                    Job.find({Company: data.company}, function(err, foundJobs) {
                        if(err) {
                            console.log("Get Timestamps Error: " + err);
                            res.status(500).send("Get Timestamps Error");
                            throw (err);
                        } else {
                            jobs = foundJobs;
                            console.log("Budget Update - Found Jobs");
                        };
                    }).lean();

                    setTimeout(() => {

                        Client.find({Company: data.company}, function(err, foundClient){
                            if (err) {
                                console.log("Company response error - " + err);
                                res.status(500).json({
                                    message: "Company Response Error"});
                                throw(err);
                            } else {
                                console.timeEnd("Update Budget");
                                console.log("Sending client update");
                                res.status(200).json({
                                    message: "Budget Updated",
                                    clients: foundClient,
                                    jobs: jobs,
                                });
                            };
                        }).lean();

                    },[5500]);

                }, 500);
                    
            };
            
        });  
        };
    }); 
    };

    if (data.globalUpdate === "Yes") {
        console.log("Global Update");

        let jobs = []

        Job.find({Company: data.company}, function(err, foundJobs) {
            if(err) {
                console.log("Get Timestamps Error: " + err);
                res.status(500).send("Get Timestamps Error");
                throw (err);
            } else {
                jobs = foundJobs;
            };
        

        Client.find({Company: data.company}, async function(err, foundClients) {
            if(err) {
                console.log("Budget Update Error - " + err);
                res.status(500).json({
                    message: "Budget Update Error"});
                throw(err);
            } else {
                
                const updateClients = [];
                let newClients = [];

                for(let i=0; i < foundClients.length; i++) {
                    const budget = foundClients[i].Budgets.filter(budget => budget._id === data.budgetID);

                    if(budget.length === 0) {
                        newClients.push(foundClients[i]);
                    };

                    if(budget.length === 1) {
                        updateClients.push(foundClients[i]);
                    };
                };

                setTimeout(() => {
                    for (let i = 0; i < updateClients.length; i++) {

                        let newBudgets = [];
                        let newBudget = {};
    
                        let thisClient = updateClients[i];
    
                        for (let i = 0; i<thisClient.Budgets.length; i++) {
    
                            if (thisClient.Budgets[i]._id !== data.budgetID) {
                                newBudgets.push(thisClient.Budgets[i]);
                            };
    
                            if (thisClient.Budgets[i]._id === data.budgetID) {
                                newBudget = {
                                    _id: thisClient.Budgets[i]._id,
                                    Title: thisClient.Budgets[i].Title,
                                    Frequency: data.frequency,
                                    TotalBudget: data.totalBudget,
                                    TotalBudgetHours: data.totalBudgetHours,
                                    TotalBudgetMinutes: data.totalBudgetMinutes,
                                    BudgetedFeePerJob: feePerJob,
                                    BudgetedMillisecondsPerJob: millisecondsPerJob,
                                    Visible: booleanVisibility,
                                    MonthlyBudget: (parseFloat(data.totalBudget) / 12),
                                };
    
                                newBudgets.push(newBudget);
                            };
                        };
    
                        setTimeout(() => {

                            Client.findByIdAndUpdate(updateClients[i]._id, {$set: {Budgets: newBudgets}}, function(err) {
                                if(err) {
                                    console.log("Budget Update Error - " + err);
                                    res.status(500).json({
                                        message: "Budget Update Error"});
                                    throw(err);
                                };
                            });
                        
                        }, 100);    
     
                    };

                    const updateJobsAll = jobs.filter(job => job.Wid === data.budgetID);
                    const updateJobs = updateJobsAll.filter(job => job.Status === "ready");

                    if (updateJobs.length > 0) {

                        for (let i = 0; i<updateJobs.length; i++) {

                            const currentTimeCost = (updateJobs[i].BudgetMilliseconds - updateJobs[i].ProfitLossMilliseconds);

                            const durationHours = (parseInt(updateJobs[i].Duration) / 3600000);

                            let newAHR = (feePerJob / durationHours);
                            
                            if(isNaN(newAHR)) {
                                newAHR = 0;
                            };

                            setTimeout(() => {
                                Job.findOneAndUpdate({_id: updateJobs[i]._id}, {
                                    $set: {_id: updateJobs[i]._id,
                                        ClientId: updateJobs[i].ClientId,
                                        ClientName: updateJobs[i].ClientName,
                                        Company: updateJobs[i].Company,
                                        Wid: updateJobs[i].Wid,
                                        Title: updateJobs[i].Title,
                                        Date: updateJobs[i].Date,
                                        BudgetFee: feePerJob,
                                        BudgetMilliseconds: millisecondsPerJob,
                                        Timestamps: updateJobs[i].Timestamps,
                                        Status: updateJobs[i].Status,
                                        ProfitLossMilliseconds: (millisecondsPerJob - currentTimeCost),
                                        Duration: updateJobs[i].Duration,
                                        AHR: newAHR, }}, function (err) {
                                            if(err) {             
                                                console.log("Update Job Error: " + err);
                                                throw (err);
                                            };
                                });
                            },200);

                            
                        };
                    };

    
                    setTimeout(() => {  
                    
                        console.log("Budget Updated");

                        Job.find({Company: data.company}, function(err, foundJobs) {
                            if(err) {
                                console.log("Get Timestamps Error: " + err);
                                res.status(500).send("Get Timestamps Error");
                                throw (err);
                            } else {
                                jobs = foundJobs;
                            };
                        }).lean();

    
                        setTimeout(() => {

                            
                            Client.find({Company: data.company}, function(err, foundClients){
                                if (err) {
                                    console.log("Company response error - " + err);
                                    res.status(500).json({
                                        message: "Company Response Error"});
                                    throw(err);
                                } else {
                                    console.log("Sending client update");
                                    res.status(200).json({
                                        message: "Budget Updated",
                                        clients: foundClients,
                                        jobs: jobs,
                                    });
                                };
                            });
                        }, 500); 
                    }, 2000); 
                }, 1000);
            };
        }).lean();
    });
    };
    
});

// Update Single Job Budget

router.post("/updatejobdirectbudget", (req, res) => {

    const data = req.body.budgetDetails;

    isCompanyNull(data.company);

    let currentJob = "";

    Job.findOne({_id: data.jobID}, function(err, foundJob) {
        if(err) {
            console.log("Find Job Error - " + err);
            res.status(500).json({
                message: "Find Job Error"});
            throw(err);
        } else {
            currentJob = foundJob;
        };
    });
    

    Client.findById( data.client, async function(err, currentClient) {
        if(err) {
            console.log("Budget Update Error - " + err);
            res.status(500).json({
                message: "Budget Update Error"});
            throw(err);
        } else {

            const durationHours = parseFloat(currentJob.Duration) / 3600000;

            const budgetHoursToMs = data.totalBudgetHours * 3600000;
            const budgetMinutesToMs = data.totalBudgetMinutes * 60000;
            const budgetMs = budgetHoursToMs + budgetMinutesToMs;

            let spentFee = 0;

            TimeStamp.find({Company: data.company}, function(err, foundStamps) {
                if(err) {
                    console.log("Get Timestamps Error: " + err);
                    res.status(500).send("Get Timestamps Error");
                    throw (err);
                } else {
            
                    if(currentJob.Timestamps.length !== 0) {
                        for( let i = 0; i< currentJob.Timestamps.length; i++) {

                            const timestamp = foundStamps.find(t => t._id === currentJob.Timestamps[i]);
            
                            spentFee = spentFee + timestamp.Cost;
                        };
                    }

            

            let newProfitLossTime = budgetMs - currentJob.Duration;
            let newAHR = (parseFloat(data.totalBudget)/parseFloat(durationHours));


            setTimeout(() => {
                let clientPLTime = currentClient.ProfitLossMilliseconds + newProfitLossTime;
                const newBudget = parseInt(data.totalBudget);
                let responseClients = [];

                if(isNaN(newAHR)) {
                    newAHR = 0;
                };


                if(isNaN(clientPLTime)) {
                    clientPLTime = budgetMs;
                };

                if(isNaN(newProfitLossTime)) {
                    newProfitLossTime = budgetMs;
                };

                // Update Client
                Client.findByIdAndUpdate(data.client, {
                    $set: {ProfitLossMilliseconds: clientPLTime,
                            }}, {new: true}, function (err) {
                    if(err) {             
                        console.log("Timestamp Client Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    };

                    Client.find({Company: data.company}, function (err, foundClients) {
                        if(err) {
                            console.log("Find clients error")
                            res.status(500).send("Find clients Error");
                            throw (err);
                        };

                        responseClients = foundClients;
                    }).lean();
                });

                // Update Job
                Job.findOneAndUpdate({_id: data.jobID}, {
                    $set: {ProfitLossMilliseconds: newProfitLossTime,
                        AHR: newAHR,
                        BudgetMilliseconds: budgetMs,
                        BudgetFee: newBudget,
                        }}, function (err) {
                    if(err) {             
                        console.log("Timestamp Job Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    } else {

                        Job.find({Company: data.company}, function (err, foundJobs) {
                            if(err) {
                                console.log("Find jobs error")
                                res.status(500).send("Find Jobs Error");
                                throw (err);
                            } else {
                                console.log("Job Budget Updated");
                                res.status(200).json({
                                message: "Job Budget Updated",
                                jobs: foundJobs,
                                clients: responseClients,
                                });
                                return;
                            };
                        });
                    };
                });
            }, 200);
            }});
        }
    });
});



// Job Timestamps
router.post("/gettimestamps", (req, res) => {

    const data = req.body.jobPostID;

    TimeStamp.find({JobId: data.jobID}, function(err, foundStamps) {
        if(err) {
            console.log("Get Timestamps Error: " + err);
            res.status(500).send("Get Timestamps Error");
            throw (err);
        } else {
            console.log("Sending Timestamps");

            return (
            res.json({
                message: "Recieving Time Stamps",
                timeStamps: foundStamps,
            })
            );
            
        };
    });
});


// Get Users
router.post("/getusers", (req, res) => {

    const data = req.body.companyDetails;

    User.find({Company: data.company}, function(err, foundUsers) {
        if(err) {
            console.log("Get Users Error: " + err);
            res.status(500).send("Get Users Error");
            throw (err);
        } else {
            console.log("Sending Users");
            return (
                res.json({
                    message: "Recieving Users",
                    users: foundUsers,
                })
            );
        };
    });
});


module.exports = router;