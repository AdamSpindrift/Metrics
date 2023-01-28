import React, { useState } from "react";
import axios from "axios";
import { format , getMonth, getYear, getHours, getMinutes} from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import { setTimestamps } from "../actions/setTimestamps";
import { setAllTimestamps } from "../actions/setAllTimestamps";
import { setJobs } from "../actions/setjobs";
import { setClients } from "../actions/setClients";
import { setTodayStamps } from "../actions/setTodayStamps";
// Custom Modules
import PleaseLogin from "../Generic/PleaseLogin";
import Header from "../Generic/Header";
import Loading from "../Generic/Loading";
import { navigate } from "hookrouter";
require("dotenv").config()

function EditStamp () {

    let isLoggedIn = useSelector(state => state.loggedIn);
    const timestamps = useSelector(state => state.allTimestamps);
    const currentStampID = useSelector(state => state.currentStamp);
    const company = useSelector(state => state.company);
    const user = useSelector(state => state.userName);
    const dispatch = useDispatch();

    const currentStamp = timestamps.find(t => t._id === currentStampID);

    const [stampDetails, setTimeStamp] = useState({
        description: currentStamp.Description,
        startH: getHours(new Date(currentStamp.StartTime)),
        startM: getMinutes(new Date(currentStamp.StartTime)),
        endH: getHours(new Date(currentStamp.EndTime)),
        endM: getMinutes(new Date(currentStamp.EndTime)),
        start: format(new Date(currentStamp.StartTime), "yyyy-MM-dd"),
        end: format(new Date(currentStamp.StartTime), "yyyy-MM-dd"),
    });

    const [jobMessage, setJobMessage] = useState(false);

    const [loading, setLoading] = useState(false);

    const day = new Date(currentStamp.StartTime).getDate();
    const month = getMonth(new Date(currentStamp.StartTime));
    const year = getYear(new Date(currentStamp.StartTime));
    const hours = [...Array(24).keys()];
    const minutes = [...Array(60).keys()];


    function handleChange(event) {
        const{name, value} = event.target;
    
        setTimeStamp((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };


    function HandleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        let errorTime = true;

        const startArray = stampDetails.start.split("-");
        const endArray = stampDetails.end.split("-");

        const newStamp = {
            company: company,
            stampID: currentStamp._id,
            startTime: new Date(parseInt(startArray[0]), parseInt(startArray[1])-1, parseInt(startArray[2]), stampDetails.startH, stampDetails.startM, 0, 0),
            endTime: new Date(parseInt(endArray[0]), parseInt(endArray[1])-1, parseInt(endArray[2]), stampDetails.endH, stampDetails.endM, 0, 0),
            description: stampDetails.description,
            employeeCost: currentStamp.EmployeeCostPerHour,
            jobId: currentStamp.JobId,
            user: user,
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/edittimestamp", {newStamp})
        .then(res => {
            setLoading(false);
            errorTime = false;
            console.log(res.data.message);
            store.dispatch(setJobs(res.data.jobs));
            store.dispatch(setTodayStamps(res.data.userStamps));
            store.dispatch(setTimestamps(res.data.timeStamps));
            store.dispatch(setAllTimestamps(res.data.timeStamps));
            navigate("/timer");
        });


        // Error Timeout

        setTimeout(() => {

            if(errorTime === true) {
                navigate("/");
            };

            
        }, 30000);
    };


    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Edit Stamp" />

                <div className="clients__details clients__details--small">
                    <div className="clients__details__text float-left">
                        <h3>Client Name:</h3>
                        <h3>Job Name:</h3>
                        <h3>Description:</h3>
                        <h3>Start Time:</h3>
                        <h3>End Time:</h3>
                        <h3>Employee:</h3>
                    </div>
                    <div className="clients__details__text">
                        <h3>{currentStamp.ClientName}</h3>
                        <h3>{currentStamp.JobTitle}</h3>
                        <h3>{currentStamp.Description}</h3>
                        <h3>{format(new Date(currentStamp.StartTime), "dd/MM/yyyy HH:mm")}</h3>
                        <h3>{format(new Date(currentStamp.EndTime), "dd/MM/yyyy HH:mm")}</h3>
                        <h3>{currentStamp.EmployeeName}</h3>
                    </div>
                </div>

                <h4>New start date is - {format(new Date(stampDetails.start), "dd/MM/yyyy")}</h4>
                <h4>New end date is - {format(new Date(stampDetails.end), "dd/MM/yyyy")}</h4>
                
                <form onSubmit={HandleSubmit}>
                    <h4 className="form__input-label">Description</h4>
                    <input onChange={handleChange}  className="input--large" type="text" value={stampDetails.description} name="description" required/>

                    <h4 className="form__input-label">Start Date</h4>
                    <input onChange={handleChange} className="form__input-date"  type="date" id="start" name="start" value={format(new Date(stampDetails.start), "yyyy-MM-dd")}></input>
                        
                    <h4 className="form__input-label">End Date</h4>
                    <input onChange={handleChange} className="form__input-date" type="date" id="end" name="end" value={format(new Date(stampDetails.end), "yyyy-MM-dd")}></input>

                    <h4 className="form__input-label">Start Time</h4>
                    <select onChange={handleChange} type="text" value={stampDetails.startH} className="selector selector--time" id="startH" name="startH" required>
                            {hours.map((h, i) => <option key={i}>{h}</option>)}
                    </select>
                    <select onChange={handleChange} type="text" value={stampDetails.startM} className="selector selector--time" id="startM" name="startM" required>
                            {minutes.map((h, i) => <option key={i}>{h}</option>)}
                    </select>
                    <h4 className="form__input-label">End Time</h4>
                    <select onChange={handleChange} type="text" value={stampDetails.endH} className="selector selector--time" id="endH" name="endH" required>
                            {hours.map((h, i) => <option key={i}>{h}</option>)}
                    </select>
                    <select onChange={handleChange} type="text" value={stampDetails.endM} className="selector selector--time" id="endM" name="endM" required>
                            {minutes.map((h, i) => <option key={i}>{h}</option>)}
                    </select>
                    <br></br>
                    <button className="main-button" type="submit">Update Stamp</button>
                    {jobMessage ? <h3 className="message__success">Stamp Updated</h3> : <div>&nbsp;</div>}
                </form>

                {loading === true ? <Loading /> : <div>&nbsp;</div>}  
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
          )
    };
};


export default EditStamp;