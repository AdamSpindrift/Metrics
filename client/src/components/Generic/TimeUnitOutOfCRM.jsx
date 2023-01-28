import React, { useState, useEffect } from "react";
import axios from "axios";
import { intervalToDuration } from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import { setTimerGo } from "../actions/setTimerGo";
import { setTimerOff } from "../actions/setTimerOff";
import { setTimerStop } from "../actions/setTimerStop";
import { setActiveTime } from "../actions/setActiveTime";
import { setActiveJob } from "../actions/setActiveJob";
import { setTimeDescription } from "../actions/setTimeDescription";
import { setReduxStartTime } from "../actions/setTimerStartTime";
import { setTodayStamps } from "../actions/setTodayStamps";
import { setJobs } from "../actions/setjobs";
import { setLoading } from "../actions/setLoading";
import { setLoadingDone } from "../actions/setLoadingDone";
import { setAllTimestamps } from "../actions/setAllTimestamps";
import { setPressedGo } from "../actions/setPressedGo";
import { setPressedStop } from "../actions/setPressedStop";
import { setOutOfCRMClient } from "../actions/setOutOfCRMClient";
import { setOutOfCRMJob } from "../actions/setOutOfCRMJob";
import { setClients } from "../actions/setClients";
import store from "../store";
// Custom Modules
import Loading from "../Generic/Loading";
require("dotenv").config()

function TimeUnit (props) {

    // State
    const user = useSelector(state => state.userName);
    const company = useSelector(state => state.company);
    let timerGo = useSelector(state => state.timerGo);
    let timeStampID = useSelector(state => state.activeTime);
    let timeDescription = useSelector(state => state.timeDescription);
    const timeStartTime = useSelector(state => state.timerStartTime);
    const outOfCRMJob = useSelector(state => state.outOfCRMJob);
    const timerGone = useSelector(state => state.pressedGo);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const [timeStamp, setTimeStamp] = useState({
        company: company,
        clientName: props.cName,
        cID: props.cId,
        jobName: "Admin",
        jobId: props.jId,
        user: user,
        description: "",
    });

    useEffect(() => {
        setTimeStamp(
            {
                company: company,
                clientName: props.cName,
                cID: props.cId,
                jobName: props.jName,
                jobId: props.jId,
                user: user,
                description: "",
                }
        )
    },[props.cName]);

    const timeStop = {
        company: company,
        jobId: props.jId,
        timeID: timeStampID,
        timeStart: timeStartTime,
        user: user,
    };

    function handleChange(event) {
        const{name, value} = event.target;
    
        setTimeStamp((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };



    // Duration Clock
    const [startTime, setStartTime] = useState(
        new Date()
    );

    const [durationTime, setDurationTime] = useState(
        "00:00:00"
    );

 

    let duration = "";
    let dTime = "";

    function countDuration() {

        if (timeStartTime === "") {
            dTime = setInterval(() => {


                setDurationTime(() => {
                    duration = intervalToDuration ({
                        start: new Date(startTime),
                        end: new Date()
                    })

                    const formatedDuration = duration.hours + ":" + duration.minutes + ":" + duration.seconds;
                    return (
                        formatedDuration
                    )
                });
            clearInterval(dTime);
          }, 1000);
        };


        if (timeStartTime !== "") {
            dTime = setInterval(() => {


                setDurationTime(() => {
                    duration = intervalToDuration ({
                        start: new Date(timeStartTime),
                        end: new Date()
                    })

                    const formatedDuration = duration.hours + ":" + duration.minutes + ":" + duration.seconds;
                    return (
                        formatedDuration
                    )
                });
            clearInterval(dTime);
          }, 1000);
        };
    };

    

    if (timerGo === true) {
        countDuration();
    };

     
    

    function HandleStart(event) {
        event.preventDefault();
        store.dispatch(setPressedGo());

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/createjobandstamp", {timeStamp})
        .then(res => {
            console.log(res.data.message);
            timeStampID = res.data.timeStampID;
            const desc = res.data.timeDescription;
            store.dispatch(setActiveTime(timeStampID));
            store.dispatch(setTimeDescription(desc));
            store.dispatch(setReduxStartTime(res.data.startTime));
            store.dispatch(setJobs(res.data.jobs));
            store.dispatch(setTimerGo());
        });
    };


    function handleStop(event) {
        event.preventDefault();
        store.dispatch(setTimerStop());
        store.dispatch(setPressedStop());
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/stoptimestamp", {timeStop})
            .then(res => {
                console.log(res.data.message);
                store.dispatch(setOutOfCRMClient(null));
                store.dispatch(setOutOfCRMJob(null));
                store.dispatch(setReduxStartTime(""));
                store.dispatch(setActiveTime(null));
                store.dispatch(setActiveJob(null));
                store.dispatch(setTimeDescription(""));
                store.dispatch(setTodayStamps(res.data.userStamps));
                store.dispatch(setAllTimestamps(res.data.timeStamps));
                store.dispatch(setJobs(res.data.jobs));
                store.dispatch(setClients(res.data.clients));
                store.dispatch(setTimerOff());
                store.dispatch(setTimerStop());
                setLoading(false);
            });
    };



    return (
        <div className="timer__time-unit">
            <h2 className="timer__heading-secondary">Current Job</h2>
            
            
            <form onSubmit={HandleStart}>
                <h4 className="form__input-label">Client Name</h4>
                <input className="timer__form-input timer__form-input--read-only" type="text" value={props.cName} name="clientName" readOnly/>
                <h4 className="form__input-label">Job Date</h4>
                <input className="timer__form-input timer__form-input--read-only" type="text" value={props.jDate} name="jobDate" readOnly/>
                <h4 className="form__input-label">Job ID</h4>
                <input className="timer__form-input timer__form-input--read-only" type="text" value={props.jId} name="jobId" readOnly/>
                {timerGone === false ? 
                <h4 className="form__input-label">Job Name</h4>: <h4>Out Of CRM Job Running</h4>}
                {timerGone === false ?
                <select onChange={handleChange} type="text" value={timeStamp.jName} className="selector selector__time-unit" id="jobName" name="jobName" required>
                        <option>No Job Selected</option>
                        <option>Admin</option>
                        <option>Meeting</option>
                        <option>Quick Question</option>
                </select> : <div>&nbsp;</div>}
                <h4 className="form__input-label timer__form-input--desc-label">Description</h4>
                {timeDescription !== "" ? <h4 className="form__input-label timer__form-input--desc">{timeDescription}</h4> : 
                <input onChange={handleChange} className="timer__form-input timer__form-input--desc" type="text" value={timeStamp.description} name="description" placeholder="description" required/>
                }
                {timerGone === false ? 
                <button className="timer__submit-time timer__submit-time--start" type="submit">Start</button>
                : <div>&nbsp;</div>}
            </form>

            {timerGone === true ? 
            <form onSubmit={handleStop}>
                <button className="timer__submit-time timer__submit-time--stop" type="submit">Stop</button>
            </form>
            : <div>&nbsp;</div>}

            

            <div className="timer__duration">
                    <h2>Duration</h2>
                    {timerGo === true ? 
                    <h2>{durationTime}</h2>
                    : <h2></h2>}
            </div>

            {loading === true ? <Loading /> : <div>&nbsp;</div>}

        </div>
    );
};

export default TimeUnit;