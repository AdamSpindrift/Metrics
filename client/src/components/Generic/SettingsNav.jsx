import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";

function SettingsNav() {

    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();

    const navCompany = () => {
        
        navigate("/settings");
    };

    const navUsers = () => {
        
        navigate("/users");
    };

    const navWeeklyTargets = () => {
        
        navigate("/weeklytargets");
    };

    const navQuarterlyTargets = () => {
        
        navigate("/quarterlytargets");
    };

    const navManualTime = () => {
        
        navigate("/manualtime");
    };

    const navCustomJob = () => {
        
        navigate("/customjob");
    };

    const navXeroMatch = () => {
        
        navigate("/xeromatch");
    };

    if (isLoggedIn === true) {
    return (
        <div className="navigation-settings">

            <div className="navigation-settings__background">&nbsp;</div>

            <div className="navigation-settings__nav">
            
                <ul className="navigation-settings__list">
                    <li className="navigation-settings__item">
                        <form onSubmit={navCompany}>
                            <button className="navigation-settings__link" type ="submit">Company</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navUsers}>
                            <button className="navigation-settings__link" type ="submit">Users</button>
                        </form>
                    </li>
                    {/* <li className="navigation-settings__item">
                        <form onSubmit={navWeeklyTargets}>
                            <button className="navigation-settings__link" type ="submit">Weekly Targets</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navQuarterlyTargets}>
                            <button className="navigation-settings__link" type ="submit">Quarterly Targets</button>
                        </form>
                    </li> */}
                    <li className="navigation-settings__item">
                        <form onSubmit={navManualTime}>
                            <button className="navigation-settings__link" type ="submit">Manual Time Entry</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navCustomJob}>
                            <button className="navigation-settings__link" type ="submit">Custom Job</button>
                        </form>
                    </li>
                    <li className="navigation-settings__item">
                        <form onSubmit={navXeroMatch}>
                            <button className="navigation-settings__link" type ="submit">Xero</button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    )
    } else {
        return (<div>&nbsp;</div>);
    };
};

export default SettingsNav;