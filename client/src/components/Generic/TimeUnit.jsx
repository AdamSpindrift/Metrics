import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
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
import { setAllTimestamps } from "../actions/setAllTimestamps";
import { setJobs } from "../actions/setjobs";
import { setPressedGo } from "../actions/setPressedGo";
import { setPressedStop } from "../actions/setPressedStop";
import { setOutOfCRMClient } from "../actions/setOutOfCRMClient";
import { setOutOfCRMJob } from "../actions/setOutOfCRMJob";
import { setClients } from "../actions/setClients";
import store from "../store";
// Custom Modules
import Loading from "../Generic/Loading";
import pad from "../Generic/Pad";
require("dotenv").config()

function TimeUnit (props) {

    // State
    const user = useSelector(state => state.userName);
    const company = useSelector(state => state.company);
    let timeStampID = useSelector(state => state.activeTime);
    let timeDescription = useSelector(state => state.timeDescription);
    const timeStartTime = useSelector(state => state.timerStartTime);
    const [timerGo, setTimerGoInternal] = useState(useSelector(state => state.timerGo));
    const dispatch = useDispatch();


    const [timeStamp, setTimeStamp] = useState({
        company: company,
        clientName: props.cName,
        cID: props.cId,
        jobName: props.jName,
        jobId: props.jId,
        user: user,
        description: "",
        startTime: timeStartTime,
    });

    const [desc, setDesc] = useState({
        
        description: "",
        
    });


    const [loading, setLoading] = useState(false);

    const [reload, setReload] = useState(0);

    // console.log("Timer Go = " + timerGo);
    // console.log("Start Time from Redux - " + timeStartTime);
    // console.log("Start Time - " + timeStamp.startTime);



    useEffect(() => {
        setTimeStamp(
            {
                company: company,
                clientName: props.cName,
                cID: props.cId,
                jobName: props.jName,
                jobId: props.jId,
                user: user,
                }
        );
        
    },[props.jDate]);

    useEffect(() => {

    },[reload]);



    



    function handleChange(event) {
        const{name, value} = event.target;
    
        setTimeStamp((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    function handleChange2(event) {
        const{name, value} = event.target;
    
        setDesc((prevValue) => {
    
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

            if (timeStamp.startTime !== "" && timeStamp.startTime !== undefined) {
                dTime = setInterval(() => {
    
    
                    setDurationTime(() => {
                        duration = intervalToDuration ({
                            start: new Date(timeStamp.startTime),
                            end: new Date(),
                        })
    
                        const formatedDuration = pad(duration.hours, 2) + ":" + pad(duration.minutes, 2) + ":" + pad(duration.seconds, 2);
                        return (
                            formatedDuration
                        )
                    });
                clearInterval(dTime);
              }, 500);
            };
    };

    

    // Dealing with re-instating Time

    useEffect(() => {
        
        if (timerGo === true) {
            countDuration();
        };

    }, [timerGo]);


    if (timerGo === true) {

        countDuration();
    };

    setTimeout(() => {

        if (timeStamp.startTime === "" || timeStamp.startTime === undefined) {

            setTimeStamp(
                {
                    startTime: timeStartTime,
                    }
            );

        };

    },[1000]);


    // if (timeDescription === undefined ){
    //     timeDescription = "";
    // };


     
    

    function HandleStart(event) {
        event.preventDefault();
        store.dispatch(setPressedGo());
        setLoading(true);

        const stamp2 = {company: company,
        clientName: props.cName,
        cID: props.cId,
        jobName: props.jName,
        jobId: props.jId,
        user: user,
        description: desc.description,
        startTime: new Date(),
        };


        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/createtimestamp", {stamp2})
        .then(res => {
            console.log(res.data.message);
            timeStampID = res.data.timeStampID;
            setTimerGoInternal(true);
            setTimeStamp({startTime: res.data.startTime});
            store.dispatch(setActiveTime(timeStampID));
            store.dispatch(setTimeDescription(res.data.timeDescription));
            store.dispatch(setReduxStartTime(res.data.startTime));
            store.dispatch(setTimerGo());
            setTimeStamp({});
            setTimeout(() => {
                setReload(reload + 1);
            },[3000]);
            setLoading(false);
        });
    };


    function handleStop(event) {
        event.preventDefault();
        store.dispatch(setTimerStop());
        store.dispatch(setPressedStop());
        setLoading(true);
        let errorTime = true;

        const timeStop = {
            company: company,
            jobId: props.jId,
            timeID: timeStampID,
            startTime: new Date(timeStartTime),
            user: user,
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/stoptimestamp", {timeStop})
            .then(res => {
                console.log(res.data.message);
                errorTime = false;
                setTimeStamp(
                    {
                        company: "",
                        clientName: "",
                        cID: "",
                        jobName: "",
                        jobId: "",
                        user: user,
                        description: "",
                        }
                );
                setTimerGoInternal(false);
                store.dispatch(setReduxStartTime(""));
                store.dispatch(setActiveTime(null));
                store.dispatch(setActiveJob(null));
                store.dispatch(setTimeDescription(""));
                store.dispatch(setTodayStamps(res.data.userStamps));
                store.dispatch(setAllTimestamps(res.data.timeStamps));
                store.dispatch(setJobs(res.data.jobs));
                store.dispatch(setTimerOff());
                store.dispatch(setTimerStop());
                store.dispatch(setOutOfCRMClient(null));
                store.dispatch(setOutOfCRMJob(null));
                clearInterval(dTime);
                props.func(res.data.duration);
                setLoading(false);
            });


        // Error Timeout

        setTimeout(() => {

            if(errorTime === true) {
                navigate("/");
            };

            
        }, 30000);
            
    };


    return (
        <div className="timer__time-unit">
            <h2 className="timer__heading-secondary">Current Job</h2>

            
            
            <form onSubmit={HandleStart}>
                <h4 className="form__input-label">Client Name</h4>
                <input className="timer__form-input timer__form-input--read-only" type="text" value={timeStamp.clientName} name="clientName" readOnly/>
                <h4 className="form__input-label">Job Date</h4>
                <input className="timer__form-input timer__form-input--read-only" type="text" value={props.jDate} name="jobDate" readOnly/>
                <h4 className="form__input-label">Job ID</h4>
                <input className="timer__form-input timer__form-input--read-only" type="text" value={timeStamp.jobId} name="jobId" readOnly/>
                <h4 className="form__input-label">Job Name</h4>
                <input className="timer__form-input timer__form-input--read-only" type="text" value={timeStamp.jobName} name="jobName" readOnly/>
                <h4 className="form__input-label timer__form-input--desc-label">Description</h4>
                {timeDescription !== "" ? <h4 className="form__input-label timer__form-input--desc">{timeDescription}</h4> : 
                <input onChange={handleChange2} className="timer__form-input timer__form-input--desc" type="text" value={desc.description} name="description" placeholder="description" required/>
                }
                {timerGo === false ? 
                <button className="timer__submit-time timer__submit-time--start" type="submit">Start</button>
                : <div className="nbsp">&nbsp;</div>}
            </form>

            {timerGo === true ? 
            <form onSubmit={handleStop}>
                <button className="timer__submit-time timer__submit-time--stop" type="submit">Stop</button>
            </form>
            : <div className="nbsp">&nbsp;</div>}

            

            <div className="timer__duration">
                    <h2>Duration</h2>
                    {timerGo === true ? 
                    <h2>{durationTime}</h2>
                    : <div className="nbsp">&nbsp;</div>}
            </div>

            {loading === true ? <Loading /> : <div className="nbsp">&nbsp;</div>}

        </div>
    );
};

export default TimeUnit;