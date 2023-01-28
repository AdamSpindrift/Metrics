require('dotenv').config();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
// Exporter
const { parse } = require("json2csv");
//AWS
const AWS = require("aws-sdk");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});


// Connect to MongoDB
mongoose.connect((process.env.MONGOPERFORMANCEMONITOR), {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error"));

// Keys
const s3Version = (process.env.AWS_API_VERSION);
const serverPost = (process.env.SERVER_POST);


// Create AWS S3 service object
s3 = new AWS.S3({apiVersion: s3Version});



const timestampsToCSV = () => {

    Timestamps.find({Company : "djca"}, async function(err, foundStamps){
        if(err){
            console.log("No Company Found " + err);
            throw(err);
        };

        try {
            const csv = await parse(foundStamps);

            const params = {
                Bucket: "metricsuploads",
                Key: "djca_timestamps_" + new Date(),
                ACL: 'public-read',
                Body: csv,
                ContentType: "text/csv",
              };
            
              s3.putObject(params, function(err, data){
                if (err) console .log("Error Occured in putObject - " + err );
                else console.log("Successfully Uploaded djca_timestamps_" + new Date() + " to metricsuploads");
              });
        } catch(err) {
            console.error(err);
        };

        setTimeout(() => {
            console.log("Closing Mongoose Connection");
            mongoose.disconnect();
        }, 5000);
    });
};

timestampsToCSV();