import React, { useState, useEffect } from "react";
import { navigate } from "hookrouter";
import { format } from "date-fns";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import { setTimerGo } from "../actions/setTimerGo";
import { setActiveTime } from "../actions/setActiveTime";
import { setActiveJob } from "../actions/setActiveJob";
import { setTimeDescription } from "../actions/setTimeDescription";
import { setReduxStartTime } from "../actions/setTimerStartTime";
import { setTimerActive } from "../actions/setTimerActive";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import Filter from "../Generic/Filter";
import FilteredList from "../Generic/FilteredJobList";
import TimeUnit from "../Generic/TimeUnit";
import TodaysStamps from "../Generic/TodaysStamps";
import Loading from "../Generic/Loading";
require("dotenv").config()

function Timer () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalJobs = useSelector(state => state.jobs);
    let activeJob = useSelector(state => state.activeJob);
    const todayStamps = useSelector(state => state.todayStamps);
    const activeTime = useSelector(state => state.activeTime);
    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    const readyJobs = globalJobs.filter(job => job.Status === "ready");
    const noMeeting = readyJobs.filter(j => j.Title.toLowerCase().search("meeting") === -1);
    const noAdmin = noMeeting.filter(j => j.Title.toLowerCase().search("admin") === -1);
    const noQQ = noAdmin.filter(j => j.Title.toLowerCase().search("quick question") === -1);
    

    // Jobs Filter
    const [word, setWord] =useState("");
    const [jobs, setJobs] = useState([]);
    const [filterDisplay, setFilterDisplay] = useState([]);
    const [duration, setDuration] = useState(0);
    const [job, setJob] = useState({
        clientName: "",
        clientId: "",
        jobName: "",
        jobDate: "",
        activeJob: "",
    });

    const setNewJob = (jId) => {

        const currentJob = globalJobs.find(j => j._id === jId)

        setJob({
            clientName: currentJob.ClientName,
            clientId: currentJob.ClientId,
            jobName: currentJob.Title,
            jobDate: format(new Date(currentJob.Date), "dd/MMM/yyy"),
            activeJob: currentJob._id,
        })
    };


    useEffect(() => {

        if(access !== "User NoMeeting NoAdmin NoQQ") {
            setJobs(readyJobs);
        } else {
            setJobs(noQQ);
        };
        
    },[]);


    useEffect(() => {

        // Restoring Timer if user did not stop timer before log out
        if (activeTime !== null) {

            const timeID = {timeStampID: activeTime,
                            company: company,};

            axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/gettimestamp", {timeID})
                .then(res => {
                    console.log(res.data.message);
                    const timeStamp = res.data.timeStamp;

                    const activeJobUpdate = globalJobs.find(job => job._id === timeStamp.JobId);

                    setJob({
                        clientName: activeJobUpdate.ClientName,
                        clientId: activeJobUpdate.clientId,
                        jobName: activeJobUpdate.Title,
                        jobDate: format(new Date(activeJobUpdate.Date), "dd/MMM/yyy"),
                        activeJob: activeJobUpdate._id,
                    });

                    store.dispatch(setActiveJob(activeJobUpdate._id));
                    store.dispatch(setTimeDescription(timeStamp.Description));
                    store.dispatch(setReduxStartTime(new Date(timeStamp.StartTime)));
                    store.dispatch(setActiveTime(timeStamp._id));
                    store.dispatch(setTimerActive());
                    store.dispatch(setTimerGo());

                });
        };

    },[]);

    


  
    const handleChange = e => {
        setWord(e);
        let oldList = jobs.map(c => {
            return { ClientName: c.ClientName.toLowerCase(), Title: c.Title, Date: c.Date, _id: c._id};
        });

        if (word !== "") {
            let newList = [];

            newList = oldList.filter(job => 
                job.ClientName.includes(word.toLowerCase())
            );

            setFilterDisplay(newList);
        };

        if (word === "") {
            setFilterDisplay(jobs);
        };
    };


    const durationFunction = (data) => {
        setDuration(data);
    };

    
    
    


    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Timer" hello="true" />

                <div className="container-2 row">
                    <div className="col-1-of-2">
                        <Filter value={word} handleChange={e => handleChange(e.target.value)} />
                        
                        <FilteredList list={word.length < 1 ? jobs : filterDisplay}
                        setNewJob = {setNewJob} />
                    </div>
                    <div className="col-1-of-2">
                        
                        {activeJob !== null ? 
                        <TimeUnit 
                            cName= {job.clientName}
                            cId= {job.clientId}
                            jName= {job.jobName}
                            jDate= {job.jobDate}
                            jId= {job.activeJob}
                            func= {durationFunction}
                        /> : <h2></h2>}
                        <TodaysStamps
                            duration= {duration}
                        />
                    </div>
                </div>

            </div>
        );
    };

    if (isLoggedIn !== true) {
        return (
        <PleaseLogin />
        )
    };
};


export default Timer;