import React, { useState, Fragment, useEffect } from "react";
import {navigate} from "hookrouter";
// State
import {useSelector, useDispatch} from "react-redux";
import {logout} from "../actions/logout";
import store from "../store";

function Nav() {

    
    let isLoggedIn = useSelector(state => state.loggedIn);
    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    const navDashboard = () => {
        
        navigate("/dashboard");
    };

    const navTimer = () => {
        
        navigate("/timer");
    };

    const navClients = () => {
        
        navigate("/clients");
    };

    const navStaffTime = () => {
        
        navigate("/stafftime");
    };

    const navSettings = () => {
        navigate("/settings");
    };

    const navPasswordReset = () => {
        navigate("/passwordreset");
    };

    const navReports = () => {
        
        navigate("/reports");
    };

    const navKPI = () => {
        
        navigate("/kpi");
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
      };

    if (isLoggedIn === true) {
    return (
        <div className="navigation">
            <input type="checkbox" className="navigation__checkbox" id="navi-toggle"></input>
            <label htmlFor="navi-toggle" className="navigation__button">
                <p className="navigation__icon">Menu</p>
                <p className="navigation__icon--2">Exit</p>
            </label>

            <div className="navigation__dim-screen">&nbsp;</div>
 
            <div className="navigation__background">&nbsp;</div>



            <nav className="navigation__nav">
                <ul className="navigation__list">
                    <li className="navigation__item">
                        <form onSubmit={navDashboard}>
                            <button className="navigation__link" type ="submit">Dashboard</button>
                        </form>
                    </li>
                    <li className="navigation__item">
                        <form onSubmit={navTimer}>
                            <button className="navigation__link" type ="submit">Timer</button>
                        </form>
                    </li>
                    <li className="navigation__item">
                        <form onSubmit={navClients}>
                            <button className="navigation__link" type ="submit">Clients</button>
                        </form>
                    </li>
                    {access === "Admin" ?
                    <li className="navigation__item">
                        <form onSubmit={navStaffTime}>
                            <button className="navigation__link" type ="submit">Staff Time</button>
                        </form>
                    </li> : <div>&nbsp;</div>}
                    {access === "Admin" ? 
                    <li className="navigation__item">
                        <form onSubmit={navSettings}>
                            <button className="navigation__link" type ="submit">Settings</button>
                        </form>
                    </li> : <div>&nbsp;</div>}
                    <li className="navigation__item">
                        <form onSubmit={navPasswordReset}>
                            <button className="navigation__link" type ="submit">Password Reset</button>
                        </form>
                    </li>
                    <li className="navigation__item">
                        <form onSubmit={navReports}>
                            <button className="navigation__link" type ="submit">Reports</button>
                        </form>
                    </li>
                    {access === "Admin" ? 
                    <li className="navigation__item">
                        <form onSubmit={navKPI}>
                            <button className="navigation__link" type ="submit">Key Performance</button>
                        </form>
                    </li> : <div>&nbsp;</div>}
                    <li className="navigation__item">
                        <form onSubmit={handleLogout}>
                            <button className="navigation__link" type ="submit">Log Out</button>
                        </form>
                    </li>
                </ul>
            </nav>
        </div>
    )
    } else {
        return (<div>&nbsp;</div>);
    };
};

export default Nav;