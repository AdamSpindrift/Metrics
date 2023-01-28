// Environment Variables
require('dotenv').config();
const http = require("http");
const express = require("express");
const ws = require("ws");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const bodyParser = require("body-parser");
const router = express.Router();
//Mongo DB - Mongoose
const mongoose = require("mongoose");
const Company = require("./models/company");
const SentaEmployee = require("./models/sentaemployee");
const User = require("./models/user");
const Budget = require("./models/budget");
const Client = require("./models/client");
const Job = require("./models/job");
const TimeStamp = require("./models/timestamp");
const request = require("request");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
// Metrics API's
const api = require("./routes/api");
const sentaAPI = require("./routes/SentaRequestAPI");
const utilityAPI = require("./routes/utilityAPI");
const reportsAPI = require("./routes/reportsAPI");
const kpiAPI = require("./routes/kpiAPI");
const xeroAPI = require("./routes/xeroApi");
const transactionAPI = require("./routes/transactionCountAPI");
// const setupWebSocket = require("./setupWebSocket");
const port = process.env.PORT || 9000;






// Express Setup
const app = express();

app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    
    next();
})

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers.host === 'metricsapp.io')
            return res.redirect(301, 'https://www.metricsapp.io');
        if (req.headers['x-forwarded-proto'] !== 'https')
            return res.redirect('https://' + req.headers.host + req.url);
        else
            return next();
    } else
        return next();
});

app.disable("x-powered-by");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// Helmet
app.use(helmet.hsts());
app.use(helmet.expectCt({
    maxAge: 43200,
    enforce: true,
}));
app.use(helmet.referrerPolicy({
    policy: ["strict-origin-when-cross-origin"],
}));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

// Routes
app.use("/api", api);
app.use("/sentaapi", sentaAPI);
app.use("/uapi", utilityAPI);
app.use("/reportsapi", reportsAPI);
app.use("/kpi", kpiAPI);
app.use("/xero", xeroAPI);
app.use("/transactionapi", transactionAPI);






// Route to launch React index
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
};


// Websocket Server
const server = http.Server(app);
const wss = new ws.Server({server: server, path: "/"});
app.disable("x-powered-by");

wss.on("connection", function (wss) {
    wss.send("Connection Established with senta node server");

    wss.on("message", (e) => {
        console.log("Message recieved - " + e.data);
    });
    
});







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







// Cluster

let workers = [];
const workersAmount = process.env.WEB_CONCURRENCY || 4;


if (cluster.isMaster) {
    console.log("Master " + process.pid + " is running");

    //Fork workers
    for (let i = 0; i < workersAmount; i++) {
        workers.push(cluster.fork());

        // recieve from workers
        workers[i].on("message", (message) => {
            console.log(message);
        });
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log("Worker " + worker.process.pid + " died with code: " + code + " and signal: " + signal);
        console.log("Starting new worker");
        cluster.fork();
        workers.push(cluster.fork());

        workers[workers.length-1].on("message", (message) => {
            console.log(message);
        });
    });

    server.listen(port, () => {
        console.log("Server Running on port " + port);
    });
    
} else {

    console.log("Worker " + process.pid + " started");

};