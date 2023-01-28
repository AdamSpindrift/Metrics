import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
require("dotenv").config()

function Reports () {

    let isLoggedIn = useSelector(state => state.loggedIn);

    const navUserBookkeeping = () => {
        
        navigate("/userbookkeepingreport");
    };

    const navUserBookkeepingV2 = () => {
        
        navigate("/userbookkeepingreportv2");
    };

    const navUserRecoverability = () => {
        
        navigate("/userrecoverabilityreport");
    };

    const navClientBookkeeping = () => {
        
        navigate("/clientrecoverabilityreport");
    };

    const navWeightedRecoverability = () => {
        
        navigate("/weightedrecoverability");
    };

    const navBookkeepingTransactionReport = () => {
        
        navigate("/bookkeepingtransactionreport");
    };

    const navMGMTAccountsReport = () => {
        
        navigate("/mgmtaccountsreport");
    };

    const navDailyMonthTimeReport = () => {
        
        navigate("/dailymonthtimereport");
    };

    const navBankTransactionFeeAnalysis = () => {
        
        navigate("/banktransactionanalysis");
    };

    const navCompletedJobsReport = () => {
        
        navigate("/completedjobsreport");
    };

    const navFreshdeskViolationsReport = () => {
        
        navigate("/freshdeskviolationsreport");
    };

    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Reports"/>

                {/* <form onSubmit={navUserBookkeeping}>
                    <button className="main-button main-button--large-2">User Bookkeeping Report</button>
                </form> */}

                <form onSubmit={navUserBookkeepingV2}>
                    <button className="main-button main-button--large-2">User Bookkeeping Report v2</button>
                </form>

                <form onSubmit={navUserRecoverability}>
                    <button className="main-button main-button--large-2">User Recoverability Report</button>
                </form>

                <form onSubmit={navClientBookkeeping}>
                    <button className="main-button main-button--large-2">Client Bookkeeping Report</button>
                </form>

                <form onSubmit={navBookkeepingTransactionReport}>
                    <button className="main-button main-button--large-2">Bookkeeping Transaction Report</button>
                </form>

                <form onSubmit={navMGMTAccountsReport}>
                    <button className="main-button main-button--large-2">MGMT Accounts Report</button>
                </form>

                <form onSubmit={navDailyMonthTimeReport}>
                    <button className="main-button main-button--large-2">Daily Time Report - Month Summary</button>
                </form>

                <form onSubmit={navBankTransactionFeeAnalysis}>
                    <button className="main-button main-button--large-2">Bank Transaction Fee Analysis</button>
                </form>

                <form onSubmit={navCompletedJobsReport}>
                    <button className="main-button main-button--large-2">Completed Jobs Report</button>
                </form>

                <form onSubmit={navFreshdeskViolationsReport}>
                    <button className="main-button main-button--large-2">Freshdesk Violations Report</button>
                </form>

            </div>
        );
    };

    if (isLoggedIn !== true) {
        return (
        <PleaseLogin />
        )
    };
};


export default Reports;