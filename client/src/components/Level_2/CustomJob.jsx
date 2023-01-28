import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { navigate } from "hookrouter";
import axios from "axios";
// State
import { useSelector, useDispatch } from "react-redux";
import store from "../store";
import { setJobs } from "../actions/setjobs";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import SettingsNav from "../Generic/SettingsNav";
import FilteredClientListTimer from "../Generic/FilteredClientListTimer";
import Filter from "../Generic/Filter";
import Loading from "../Generic/Loading";
require("dotenv").config()

function CustomJob () {

    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const outOfCRMClient = useSelector(state => state.outOfCRMClient);
    const outOfCRMJob = useSelector(state => state.outOfCRMJob);
    const clientsA = useSelector(state => state.clients);
    const dispatch = useDispatch();


    // Clients Filter
    const [word, setWord] =useState("");
    const [clients, setClients] = useState(clientsA);
    const [filterDisplay, setFilterDisplay] = useState([]);

    const [jobDetails, setTimeStamp] = useState({
        company: company,
        jobName: "",
        jobDate: format(new Date(), "dd/MMM/yyy"),
    });

    const [jobMessage, setJobMessage] = useState(false);

    const [loading, setLoading] = useState(false);


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

    
    let cName = "";

    if(clientName[0] !== undefined) {
        cName = clientName[0].ClientName;
    };


    function handleChange2(event) {
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

        const newJob = {
            company: company,
            jobName: jobDetails.jobName,
            jobId: outOfCRMJob,
            clientId: outOfCRMClient,
            clientName: cName,
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/createjob", {newJob})
        .then(res => {
            console.log(res.data.message);
            store.dispatch(setJobs(res.data.jobs));
            setJobMessage(true);
            setLoading(false);

            setTimeout(() => {
                navigate("/settings");
            }, 1000);
        });
    };


   
    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Custom Job"/>
                <SettingsNav />

                <div className="container-2 row-settings">
                    <div className="col-1-of-2-set">
                        <Filter value={word} handleChange={e => handleChange(e.target.value)} />

                        <FilteredClientListTimer list={word.length < 1 ? clients : filterDisplay} />
                    </div>
                    <div className="col-1-of-2-set">

                        <div className="custom-job__form justify">

                            <form onSubmit={HandleSubmit}>
                                <h4 className="form__input-label">Client Name</h4>
                                <input className="timer__form-input timer__form-input--read-only" type="text" value={cName} name="clientName" readOnly/>

                                <h4 className="form__input-label">Job Date</h4>
                                <input className="timer__form-input timer__form-input--read-only" type="text" value={jobDetails.jobDate} name="jobDate" readOnly/>

                                <h4 className="form__input-label">Job Name</h4>
                                <input onChange={handleChange2} className="timer__form-input timer__form-input" type="text" value={jobDetails.jobName} name="jobName" placeholder="Job Name" required/>

                                <button className="main-button main-button--large-2 margin-left0" type="submit">Create Job</button>

                                {jobMessage ? <h3 className="message__success">Job Created</h3> : <div>&nbsp;</div>}
                            </form>

                        </div>
                    </div>

                </div>

                
                {loading === true ? <Loading /> : <div>&nbsp;</div>}
                
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
        )
    }
};


export default CustomJob;