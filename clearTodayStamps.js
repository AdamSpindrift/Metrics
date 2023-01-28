const express = require("express");
require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const User = require("./models/user");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));


const clearTodayStamps = async () => {

    console.log("Clearing Today's Stamps Array");
    User.updateMany({}, { TodaysStamps: [], DayComplete: false}, function(err) {
        if (err){
            console.log(err);
            throw(err);
        };
    });

    setTimeout(() => {
        console.log("Closing Mongoose Connection");
        mongoose.disconnect();
    }, 60000);
};


clearTodayStamps();