import React, { useState, useEffect } from "react";
import { navigate } from "hookrouter";
import axios from "axios";
// State
import { useSelector, useDispatch } from "react-redux";
import store from "../store";


// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import SettingsNav from "../Generic/SettingsNav";
require("dotenv").config()

function EmployeeSettings () {

    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();

    function navAddEmployee () {
        navigate("addemployee");
    };

   
    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Employees (Job Counter)"/>
                <SettingsNav />

                

                <form onSubmit={navAddEmployee}>
                    <button className="main-button main-button--large" type ="submit">Add Senta Metrics Employee</button>
                </form>
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
        )
    }
};


export default EmployeeSettings;