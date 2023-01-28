require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const Job = require("./models/job");
const Client = require("./models/client");


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

function add(accumulator, a) {
    return accumulator + a;
  };



const resetPL = () => {

    Client.find({Company : "seedaccountingsolutions"}, function(err, foundClients){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        const clients = foundClients;

        for(let i = 0; i < clients.length; i++) {

            Company.findOneAndUpdate({Name: "seedaccountingsolutions", "Clients._id": clients[i]._id}, {
                $set: {"Clients.$.ProfitLossMilliseconds": 0, "Clients.$.ProfitLossFee": 0}},  function (err) {
                    if(err) {
                        console.log("Time Stamp Job Error: " + err);
                        res.status(500).send("Time Stamp Job Error");
                        throw (err);
                    };
                    console.log(clients[i].ClientName + " P&L Reset");
            });

            if(i === clients.length-1) {
                setTimeout(() => {
                    console.log("Closing Mongoose Connection");
                    mongoose.disconnect();
                }, 120000);
            };
        };
    });
};



resetPL();
