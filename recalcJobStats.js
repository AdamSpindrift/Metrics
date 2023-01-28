require('dotenv').config();
const { addHours } = require('date-fns');
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Job = require("./models/job");
const TimeStamp = require("./models/timestamp");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

function add(accumulator, a) {
    return accumulator + a;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};



const reCalcJobs = () => {

    Job.find({}, function(err, foundJobs){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };


        for(let i = 0; i < foundJobs.length; i++) {

            TimeStamp.find({JobId: foundJobs[i]._id},  async function (err, foundStamps) {
                    if(err) {
                        console.log("Time Stamp Job Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    };
                    let plFee = 0;
                    let plTime = 0;
                    let duration = 0;
                    let ahr = 0;

                    const durationArray = await foundStamps.map(s => s.Duration);
                    const filteredDuration = await durationArray.filter(i => !Number.isNaN(i));
                    const costArray = await foundStamps.map(s => parseFloat(s.Cost));

                    if(filteredDuration.length !== 0 ) {
                        duration = filteredDuration.reduce(add, 0);
                        let hours = (duration / 3600000);

                        if(foundJobs[i].BudgetFee !== undefined || foundJobs[i].BudgetFee !== null || foundJobs[i].BudgetFee !== 0) {
                            ahr = (foundJobs[i].BudgetFee / hours);
                
                        };

                        if(foundJobs[i].BudgetMilliseconds !== null || foundJobs[i].BudgetMilliseconds !== undefined || foundJobs[i].BudgetMilliseconds !== 0) {
                            plTime = (foundJobs[i].BudgetMilliseconds - duration);
                        };
                        
                    };

                    if(costArray.length !== 0) {
                        const cost = costArray.reduce(add, 0);

                        if(foundJobs[i].BudgetFee !== 0) {
                            plFee = (foundJobs[i].BudgetFee - cost);
                        };
                        
                    };

                    sleep(500);

                    if(isNaN(ahr)) {
                        ahr = 0
                    };
                    if(isNaN(plFee)) {
                        plFee = 0
                    };
                    if(isNaN(plTime)) {
                        plTime = 0
                    };
                    console.log(foundJobs[i].Company + " " + foundJobs[i].Title);
                    console.log("duration is - " + duration);
                    console.log("AHR is - " + ahr);
                    console.log("plFee is - " + plFee);
                    console.log("plTime is - " + plTime);

                    // Update Job
                    Job.findOneAndUpdate({_id : foundJobs[i]._id}, {
                        $set: {ProfitLossMilliseconds: plTime,
                            ProfitLossFee: plFee,
                            AHR: ahr,
                            Duration: duration,
                            }}, function (err) {
                        if(err) {             
                            console.log("Timestamp Job Error: " + err);
                            res.status(500).send("Time Stamp Job Error");
                        throw (err);
                        };
                    });

            });

            if(i === foundJobs.length-1) {
                setTimeout(() => {
                    console.log("Closing Mongoose Connection");
                    mongoose.disconnect();
                }, 600000);
            };
        };
    });
};



reCalcJobs();

