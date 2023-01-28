import React from "react";
// Level 0 Pages
import Home from "./Level_0/Home";
import Login from './Level_0/Login';
import Register from './Level_0/Register';
import SuccessRegister from './Level_0/SuccesRegister';
// Level 1 Pages
import Clients from './Level_1/Clients';
import Dashboard from "./Level_1/Dashboard";
import JobMetrics from './Level_1/JobMetrics';
import KPI from './Level_1/Kpi';
import PasswordReset from "./Level_1/PasswordReset";
import Reports from "./Level_1/Reports";
import Settings from "./Level_1/Settings";
import StaffTimesheets from "./Level_1/StaffTimesheets";
import Timer from "./Level_1/Timer";
import TimerOutOfCRM from "./Level_1/TimerOutOfCRM";
import XeroAuth from "./Level_1/XeroAuth";
// Level 2 Pages
import AddEmployee from './Level_2/AddEmployee';
import BankTransactionAnalysis from './Level_2/BankTransactionAnalysis';
import BookkeepingUserReport from "./Level_2/BookkeepingUserReport";
import BookkeepingUserReportv2 from "./Level_2/BookkeepingUserReport_v2";
import BookkeepingTransactionReport from "./Level_2/BookkeepingTransactionReport";
import ClientDetails from "./Level_2/ClientDetails";
import ClientRecoverabilityReport from "./Level_2/ClientRecoverabilityReport";
import CompletedJobsReport from './Level_2/CompletedJobsReport';
import CreateKPI from './Level_2/CreateKPI';
import CustomJob from "./Level_2/CustomJob";
import DailyMonthTimeReport from "./Level_2/DailyMonthTimeReport";
import EmployeeDetails from "./Level_2/EmployeeDetails";
import EmployeeSettings from "./Level_2/EmployeeSettings";
import EmployeeTimestamps from "./Level_2/EmployeeTimestamps";
import EmployeeTimestampsRange from "./Level_2/EmployeeTimestampsRange";
import FreshdeskViolationsReport from "./Level_2/FreshdeskViolationsReport";
import ManualTimeEntry from "./Level_2/ManualTimeEntry";
import MGMTAccountsReport from "./Level_2/MGMTAccountsReport";
import QuarterlyAccProd from "./Level_2/QuarterlyAccProd";
import QuarterlyBookkeeping from "./Level_2/QuarterlyBookkeeping";
import QuarterlyPaye from "./Level_2/QuarterlyPaye";
import QuarterlyPtr from "./Level_2/QuarterlyPtr";
import QuarterlyVat from "./Level_2/QuarterlyVat";
import SetClientState from './Level_2/SetClientState';
import SetKPI from './Level_2/SetKPI';
import SetKPITargets from './Level_2/SetKPITargets';
import TransactionBanding from "./Level_2/TransactionBanding";
import UserRecoverabilityReport from "./Level_2/UserRecoverabilityReport";
import Users from "./Level_2/Users";
import WeightedRecoverability from "./Level_2/WeightedRecoverabilityReport";
import XeroClientAnalysis from "./Level_2/XeroClientAnalysis";
import XeroMatch from "./Level_2/XeroMatch";
// Level 3 Pages
import Budgets from "./Level_3/Budgets";
import AddUser from "./Level_3/AddUser";
import EditQuarterlyTarget from './Level_3/EditQuarterlyTarget';
import EditStamp from "./Level_3/EditStamp";
import EditStamp2 from "./Level_3/EditStamp2";
import EditUser from "./Level_3/EditUser";
import EditWeeklyTarget from './Level_3/EditWeeklyTarget';
import Jobs from "./Level_3/Jobs";
//Old
import WeeklyTargets from './Level_2/WeeklyTargets';
import QuarterlyTargets from './Level_2/QuarterlyTargets';
import EditEmployeeMetrics from './EditEmployeeMetrics';
import AdjustEmployeeMetrics from './AdjustEmployeeMetrics';
import QuarterlyChart from "./QuarterlyChart";
//Test
import Callback from "./Level_1/Callback";




const routes = {
    "/":() => <Home />,
    "/Login": () => <Login/>,
    "/register": () => <Register />,
    "/successregister": () => <SuccessRegister />,
    "/dashboard": () =><Dashboard />,
    "/jobmetrics": () =><JobMetrics />,
    "/kpi": () =><KPI />,
    "/passwordreset": () =><PasswordReset />,
    "/reports": () =><Reports />,
    "/clients": () =><Clients />,
    "/settings": () =><Settings />,
    "/stafftime": () =><StaffTimesheets />,
    "/timer": () =><Timer />,
    "/timeroutofcrm": () =><TimerOutOfCRM />,
    "/xeroauth": () =><XeroAuth />,
    "/addemployee": () =><AddEmployee />,
    "/banktransactionanalysis": () =><BankTransactionAnalysis />,
    "/userbookkeepingreport" : () =><BookkeepingUserReport />,
    "/userbookkeepingreportv2" : () =><BookkeepingUserReportv2 />,
    "/clientrecoverabilityreport" : () =><ClientRecoverabilityReport />,
    "/completedjobsreport" : () =><CompletedJobsReport />,
    "/bookkeepingtransactionreport" : () =><BookkeepingTransactionReport />,
    "/clientdetails": () =><ClientDetails />,
    "/createkpi": () =><CreateKPI />,
    "/customjob": () =><CustomJob />,
    "/dailymonthtimereport": () =><DailyMonthTimeReport />,
    "/employeesettings": () =><EmployeeSettings />,
    "/employeetimestamps": () =><EmployeeTimestamps />,
    "/employeetimestampsrange": () =><EmployeeTimestampsRange />,
    "/freshdeskviolationsreport": () =><FreshdeskViolationsReport />,
    "/manualtime": () =><ManualTimeEntry />,
    "/mgmtaccountsreport": () =><MGMTAccountsReport />,
    "/employeedetails": () =><EmployeeDetails />,
    "/qaccprod": ()=><QuarterlyAccProd />,
    "/qbookkeeping": ()=><QuarterlyBookkeeping />,
    "/qpaye": ()=><QuarterlyPaye />,
    "/qptr": ()=><QuarterlyPtr />,
    "/qvat": () =><QuarterlyVat />,
    "/clientstate": () =><SetClientState />,
    "/setkpi": () =><SetKPI />,
    "/setkpitarget": () =><SetKPITargets />,
    "/transactionbanding": () =><TransactionBanding />,
    "/userrecoverabilityreport": () =><UserRecoverabilityReport />,
    "/users": () =><Users />,
    "/xeromatch": () =><XeroMatch />,
    "/budgets": () =><Budgets />,
    "/adduser": () =><AddUser />,
    "/editweeklytarget": () =><EditWeeklyTarget />,
    "/editquarterlytarget": () =><EditQuarterlyTarget />,
    "/editstamp": () =><EditStamp />,
    "/editstamp2": () =><EditStamp2 />,
    "/edituser": () =><EditUser />,
    "/job": () => <Jobs />,
    "/weightedrecoverability": () => <WeightedRecoverability />,
    "/xeroclientanalysis": () => <XeroClientAnalysis />,
    "/xeromatch": () => <XeroMatch />,
    "/weeklytargets": () =><WeeklyTargets />,
    "/quarterlytargets": () =><QuarterlyTargets />,
    "/editemployeemetrics": () =><EditEmployeeMetrics />,
    "/adjustmetric": () =><AdjustEmployeeMetrics />,
    "/quarterlychart": () =><QuarterlyChart />,
    "/callback": () =><Callback />,
};


export default routes;