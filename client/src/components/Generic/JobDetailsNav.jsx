import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import { setJobs } from "../actions/setjobs";
import store from "../store";
import Loading from "../Generic/Loading";

function JobDetailsNav() {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const selectedClientID = useSelector(state => state.activeClient);
    const selectedJobID = useSelector(state => state.selectedJob);
    const dispatch = useDispatch();

    const clientDetails = {
        company: company,
        clientID: selectedClientID,
    };

    const [loading, setLoading] = useState(false);

    const navClientDetails = () => {
        
        navigate("/clientdetails");
    };


    function handleReady (event) {
        event.preventDefault();
        setLoading(true);

        const jobDetails = {
            company: company,
            jobID: selectedJobID,
            status: "ready",
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/setjobstatus", {jobDetails})
          .then(res => {
            console.log(res.data.message);
            store.dispatch(setJobs(res.data.jobs));
            setLoading(false);
            navigate("/clientdetails");    
          });
        
    };


    function handleComplete (event) {
        event.preventDefault();
        setLoading(true);

        const jobDetails = {
            company: company,
            jobID: selectedJobID,
            status: "completed",
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/setjobstatus", {jobDetails})
          .then(res => {
            console.log(res.data.message);
            store.dispatch(setJobs(res.data.jobs));
            setLoading(false);
            navigate("/clientdetails");    
          });
        
    };

   

    if (isLoggedIn === true) {
    return (
        <div className="navigation-settings">

            <div className="navigation-settings__background">&nbsp;</div>

            <div className="navigation-settings__nav">
            
                <ul className="navigation-settings__list">
                    <li className="navigation-settings__item">
                        <form onSubmit={navClientDetails}>
                            <button className="navigation-settings__link" type ="submit">Client Details</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={handleReady}>
                            <button className="navigation-settings__link" type ="submit">Status Ready</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={handleComplete}>
                            <button className="navigation-settings__link" type ="submit">Status Complete</button>
                        </form>
                    </li>
                </ul>
            </div>
            {loading === true ? <Loading /> : <div>&nbsp;</div>}
        </div>
    )
    } else {
        return (<div>&nbsp;</div>);
    };
};

export default JobDetailsNav;