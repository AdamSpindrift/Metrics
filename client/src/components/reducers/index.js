import invalidPassword from "./invalidPassword";
import userName from "./userName";
import userAccess from "./userAccess";
import loggedIn from "./isLogged";
import company from "./company";
import companySettingsComplete from "./companySettingsComplete";
import currentStamp from "./currentStamp";
import employees from "./employees";
import fName from "./fName";
import lName from "./lName";
import logo from "./logo";
import timerActive from "./timerActive";
import jobs from "./jobs";
import kpis from "./kpis";
import kpiRoles from "./kpiRoles";
import kpiTemplates from "./kpiTemplates";
import activeJob from "./activeJob";
import activeTime from "./activeTimeStamp";
import timerGo from "./timerGo";
import timeDescription from "./timeDescription";
import timerStartTime from "./timerStartTime";
import todayStamps from "./todayStamps";
import clients from "./clients";
import activeClient from "./activeClient";
import activeBudget from "./activeBudget";
import selectedJob from "./selectedJob";
import stampsStart from "./stampsStart";
import stampsEnd from "./stampsEnd";
import teams from "./teams";
import users from "./users";
import user from "./user";
import activeUser from "./activeUser";
import dayComplete from "./dayComplete";
import activeEmployee from "./activeEmployee";
import timestamps from "./timestamps";
import transactions from "./transactions";
import outOfCRMClient from "./outOfCRMClient";
import outOfCRMJob from "./outOfCRMJob";
import pressedGo from "./pressedGo";
import allTimestamps from "./allTimestamps";
import {combineReducers} from "redux";

const rootReducers = combineReducers({
    invalidPassword,
    userName,
    userAccess,
    loggedIn,
    company,
    companySettingsComplete,
    currentStamp,
    employees,
    fName,
    lName,
    logo,
    clients,
    jobs,
    kpis,
    kpiRoles,
    kpiTemplates,
    activeClient,
    activeBudget,
    selectedJob,
    stampsStart,
    stampsEnd,
    teams,
    timerActive,
    activeJob,
    activeTime,
    timerGo,
    timeDescription,
    timerStartTime,
    todayStamps,
    users,
    user,
    activeUser,
    dayComplete,
    activeEmployee,
    timestamps,
    transactions,
    outOfCRMClient,
    outOfCRMJob,
    pressedGo,
    allTimestamps,
});

export default rootReducers;