import React, { useState } from "react";
import { navigate } from "hookrouter";
import { format } from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import Filter from "../Generic/Filter";
import FilteredList from "../Generic/FilteredClientListTimer";
import TimeUnit from "../Generic/TimeUnitOutOfCRM";
import TodaysStamps from "../Generic/TodaysStamps";
import Loading from "../Generic/Loading";
require("dotenv").config()

function TimerOutOfCRM () {

    let isLoggedIn = useSelector(state => state.loggedIn);
    const clientsA = useSelector(state => state.clients);
    const outOfCRMClient = useSelector(state => state.outOfCRMClient);
    const outOfCRMJob = useSelector(state => state.outOfCRMJob);
    const todayStamps = useSelector(state => state.todayStamps);
    const loading = useSelector(state => state.loading);
    const dispatch = useDispatch();

    const navTimerCRM = () => {
        navigate("/timer");
    };

    

    // Clients Filter
    const [word, setWord] =useState("");
    const [clients, setClients] = useState(clientsA);
    const [filterDisplay, setFilterDisplay] = useState([]);


  
    const handleChange = e => {
        setWord(e);
        let oldList = clients.map(c => {
            return { ClientName: c.ClientName.toLowerCase(), Title: c.Title, Date: c.Date, _id: c._id};
        });

        if (word !== "") {
            let newList = [];

            newList = oldList.filter(client => 
                client.ClientName.includes(word.toLowerCase())
            );

            setFilterDisplay(newList);
        };

        if (word === "") {
            setFilterDisplay(clients);
        };
    }


    // Initialize Variables
    let clientName = clientsA.filter(client => client._id === outOfCRMClient);
    let clientId = "";
    let jobName = "";
    let jobDate =  format(new Date(), "dd/MMM/yyy");

    
    let cName = "";

    if(clientName[0] !== undefined) {
        cName = clientName[0].ClientName;
    };
    


    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Timer - Non CRM Job" hello="true" />

                <div className="container-2 row">
                    <div className="col-1-of-2">
                        <Filter value={word} handleChange={e => handleChange(e.target.value)} />
                        <div className="timer__inoutcrm">
                            <form onSubmit={navTimerCRM}>
                                <button className="main-button" type="submit">Job In CRM</button>
                            </form>
                        </div>

                        <FilteredList list={word.length < 1 ? clients : filterDisplay} />
                    </div>
                    <div className="col-1-of-2">
    
                        {outOfCRMJob !== null ? 
                        <TimeUnit 
                            cName= {cName}
                            cId= {outOfCRMClient}
                            jName= {jobName}
                            jDate= {jobDate}
                            jId= {outOfCRMJob}
                        /> : <h2></h2>}
                        {todayStamps !== "" ? <TodaysStamps/> : <h2>No Time Recorded Today</h2>}
                    </div>
                </div>

                {loading === true ? <Loading /> : <div>&nbsp;</div>}
            </div>
        );
    };

    if (isLoggedIn !== true) {
        return (
        <PleaseLogin />
        )
    };
};


export default TimerOutOfCRM;