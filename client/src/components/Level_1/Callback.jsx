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

// Used for Lightspeed Test

function Callback () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const settingsComplete = useSelector(state => state.companySettingsComplete);
    const jobs = useSelector(state => state.jobs);
    const dispatch = useDispatch();

    const requestData = {name: company};
    let completedJobs = [];


    
    

    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Callback" hello="true" />
                <div>
                    <h1>Callback</h1>
                </div>
            </div>
        
        );
    } else {
        return (
          <PleaseLogin />
        )
      };
  
};


export default Callback;