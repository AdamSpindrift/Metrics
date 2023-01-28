require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Job = require("./models/job");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));



function add(accumulator, a) {
    return accumulator + a;
  };



const calcAHR = () => {

    Company.findOne({Name : "djca"}, function(err, foundCompany){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        const jobs = foundCompany.Jobs;
        const timestamps = foundCompany.TimeStamps;

        for(let i = 0; i < jobs.length; i++) {

            const jobStamps = timestamps.filter(t => t.JobId === jobs[i]._id);

            const budgetFee = jobs[i].BudgetFee;

            const timeArray = jobStamps.map(t => t.Duration);

            const totalDuration = timeArray.reduce(add, 0);

            const totalHours = (totalDuration / 3600000);

            let newAHR = (budgetFee / totalHours);

            if(Number.isNaN(newAHR)){
                newAHR = 0;
            };

            if(newAHR === Infinity) {
                newAHR = 0;
            };

            
        

            Company.findOneAndUpdate({Name: "djca", "Jobs._id": jobs[i]._id}, {
                $set: {"Jobs.$.AHR": newAHR, "Jobs.$.Duration": totalDuration}},  function (err) {
                    if(err) {
                        console.log("Time Stamp Job Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    };
                    console.log("Job " + [i] + " AHR is - " + newAHR);
            });

            if(i === jobs.length) {
                setTimeout(() => {
                    console.log("Closing Mongoose Connection");
                    mongoose.disconnect();
                }, 1000);
            };
        };
    });
};



calcAHR();

