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

function ManualTimeEntry () {

    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();


   
    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Manual Time Entry"/>
                <SettingsNav />

                

                
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
        )
    }
};


export default ManualTimeEntry;