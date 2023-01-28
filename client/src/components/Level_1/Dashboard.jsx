import React, { useState, Fragment, useEffect } from "react";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import ClientJobDurationChart from "../Generic/ClientJobDurationChart";
import AccountsProdChart from "../Generic/AccountsProdChart";
import FilteredJobsListFull from "../Generic/FilteredJobsListFull";
require("dotenv").config()

function Dashboard () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const settingsComplete = useSelector(state => state.companySettingsComplete);
    const jobs = useSelector(state => state.jobs);
    const dispatch = useDispatch();

    const requestData = {name: company};
    let completedJobs = [];

    if(Array.isArray(jobs)) {
        completedJobs = jobs.filter(j => j.Status === "completed");
    };
    
    

    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Dashboard" hello="true" />
                {settingsComplete ? <div className="nbsp">&nbsp;</div> : <h2 className="message__error margin-top-small">Please Update Company Settings</h2>}
                <br/>
                <FilteredJobsListFull />
                {completedJobs.length > 50 ? <ClientJobDurationChart /> : <h2>More data required for Job Duration Chart</h2>}
                <br/>
                {jobs.length > 50 ? <AccountsProdChart /> : <h2>More data required for Accounts Production Chart</h2>}
            </div>
        
        );
    } else {
        return (
          <PleaseLogin />
        )
      };
  
};


export default Dashboard;