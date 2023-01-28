import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { startOfWeek, endOfWeek, format, startOfMonth, endOfMonth } from "date-fns";
import { CSVLink } from "react-csv";
// State
import { useSelector, useDispatch } from "react-redux";
import { setActiveEmployee } from "../actions/setActiveEmployee";
import { setUsers } from "../actions/setUsers";
import { setTimestamps } from "../actions/setTimestamps";
import { setStartStamps } from "../actions/setStartStamps";
import { setEndStamps } from "../actions/setEndStamps";
import store from "../store";

// Custom Modules
import Header from "../Generic/Header";
import Loading from "../Generic/Loading";
import msToTime from "../Generic/msToTime";
import PleaseLogin from "../Generic/PleaseLogin";
import UpdateSuccessMessage from "../Generic/UpdateSuccessMessage";
import EmployeeTimeTable from "../Generic/EmployeeTimeTable";
import add from "../Generic/add";
import removeDupes from "../Generic/removeDupes";
require("dotenv").config()

function StaffTimesheets () {

    const company = useSelector(state => state.company);
    const userName = useSelector(state => state.userName);
    const nameArray = userName.split(" ", 2);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const allJobs = useSelector(state => state.jobs);
    const dispatch = useDispatch();

    const companyDetails = {company: company};

    const [times, setTimes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [reportSent, setReportSent] = useState(false);

    const [customRange, setRange] = useState({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
        month: startOfMonth(new Date()),
    });

    const jobNames = allJobs.map(j => j.Title);
    const uniqueJobNames = removeDupes(jobNames);

    const [jobType, setJobType] = useState({
        jName: "Accounts production",
    });

    const jobSelector = () => {
        return uniqueJobNames.map((job, i) => {
    
          return (
            <option key={i}>{job}</option>
          )
        })
    };

    function handleChange2(event) {
        const{name, value} = event.target;
    
        setJobType((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
      };

    store.dispatch(setStartStamps(customRange.start));
    store.dispatch(setEndStamps(customRange.end));

    let users = useSelector(state => state.users);
    let timeStamps = useSelector(state => state.timestamps);
    let usersTime = [];

    function handleChange(event) {
        const{name, value} = event.target;
    
        setRange((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    

    useEffect(() => {

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/getusers", {companyDetails})
        .then(res => {
            console.log(res.data.message);
            users = res.data.users;
            store.dispatch(setUsers(users));
        });


        axios.post(process.env.REACT_APP_SERVER_ROUTE + "sentaapi/gettimestamps", {companyDetails})
        .then(res => {
            console.log(res.data.message);
            timeStamps = res.data.timeStamp;
            store.dispatch(setTimestamps(timeStamps));

            if (timeStamps.length !== 0) {
    
                for (let i = 0; i< users.length; i++) {
                    let todayStamps = [];
                    const user = users[i];
            
                    for(let i = 0; i<user.TodaysStamps.length; i++) {
            
                        const filteredStamp = timeStamps.filter(s => s._id === user.TodaysStamps[i]);

                        
                        if(filteredStamp.length !== 0) {
                                todayStamps.push(filteredStamp[0].Duration);
                        };    
                        
                        
                        
                    };
    
                    setTimeout(() => {
    
                        let userTime = 0;
    
    
                        if (todayStamps.length !== 0) {
                            userTime = todayStamps.reduce(add, 0);
                        };
                        
    
                        const userDetails = {
                            id: users[i]._id,
                            name: users[i].FirstName + " " + users[i].LastName,
                            dayComplete: users[i].DayComplete,
                            time: userTime,
                        };
    
                        usersTime.push(userDetails);


                        if(i === users.length-1) {

                            setTimeout(() => {
                                setTimes(usersTime);
                                setLoading(false);
                            }, 100);
                        };
                    
                        
                    }, 200);
        
                };
            } else {
                navigate("/dashboard");
            };


        });
    

        


    }, []);
    

    function selectEmployee (e) {
        e.preventDefault();
        const selectedEmployee = e.currentTarget.getAttribute("data-item");
        store.dispatch(setActiveEmployee(selectedEmployee));
        navigate("/employeetimestamps");
    };


    function sendWeeklyReport (e) {
        e.preventDefault();

        const reportDetails = {
            fName: nameArray[0],
            lName: nameArray[1],
            company: company,
            reportName: "Timestamps " + format(startOfWeek(new Date()), "dd/MM/yyyy") + " to " + format(endOfWeek(new Date()), "dd/MM/yyyy"),
            startDate: startOfWeek(new Date()),
            endDate: endOfWeek(new Date()),
        }

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "reportsapi/sendweeklyreport", {reportDetails})
        .then(res => {
            console.log(res.data.message);
            setReportSent(true);

            setTimeout(() => {
                setReportSent(false);
            }, 2000);
            
        });
    };

    useEffect(() => {

    },[customRange.start, customRange.end]);

    function sendMonthlyReport (e) {
        e.preventDefault();

        const reportDetails = {
            fName: nameArray[0],
            lName: nameArray[1],
            company: company,
            reportName: "Monthly Time Report",
            startDate: customRange.month,
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "reportsapi/monthlyreport", {reportDetails})
        .then(res => {
            console.log(res.data.message);
            setReportSent(true);

            setTimeout(() => {
                setReportSent(false);
            }, 2000);
            
        });
    };

    function sendJobTypeReport (e) {
        e.preventDefault();

        const typeReportDetails = {
            fName: nameArray[0],
            lName: nameArray[1],
            company: company,
            reportName: "Job Type Report",
            startDate: customRange.month,
            jobType: jobType.jName,
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "reportsapi/jobtypereport", {typeReportDetails})
        .then(res => {
            console.log(res.data.message);
            setReportSent(true);

            setTimeout(() => {
                setReportSent(false);
            }, 2000);
            
        });
    };

    function sendBudgets (e) {
        e.preventDefault();

        const reportDetails = {
            fName: nameArray[0],
            lName: nameArray[1],
            company: company,
        };

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "reportsapi/exportbudgets", {reportDetails})
        .then(res => {
            console.log(res.data.message);
            setReportSent(true);

            setTimeout(() => {
                setReportSent(false);
            }, 2000);
            
        });
    };

    
    

    if (isLoggedIn == true) {
    return (
        <div className="container-2">
            <Header title="Staff Timesheets"/>
            {reportSent ? <UpdateSuccessMessage message="Report Sent" /> : <div className="nbsp">&nbsp;</div>}

            <h3 className="margin-top-small">Today's Times</h3>

            {times.length !== 0 ? 
                <table id="clientstable" className="clients__clients-table margin-top-0">

                <tbody>
                    <tr className="table-lines-2">
                        <th className="table-lines-2 table__staff-col">Employee</th>
                        <th className="table-lines-2 table__medium-col">Day Complete</th>
                        <th className="table-lines-2 table__large-col">Time</th>
                    </tr>
                        {times.map((item, i) => (
                        <tr key={i} data-item={item.id} onClick={selectEmployee} className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">{item.name}</td>
                            {item.dayComplete ? <td className="table-lines-2">Yes</td> : <td className="table-lines-2">No</td>}
                            <td className="table-lines-2">{msToTime(item.time)}</td>
                        </tr>
                        ))}
                </tbody>

                </table>
            : <div>&nbsp;</div>}

            <CSVLink
                data={times}
                filename={"Times for - " + format(new Date(), "dd/MM/yyyy")}
                className="main-button main-button--large"
                target="_blank">
                Download CSV
            </CSVLink>

            
            <form onSubmit={sendWeeklyReport}>
                <button className="main-button main-button--large" type ="submit">Email Weekly Report</button>
            </form>

            <div className="dyanmic-timesheet margin-top-large">
                
                <h3>Custom Time Range</h3>

                <form>
                    <div className="row">
                        <div className="col-1-of-4">
                            &nbsp;
                        </div>
                        <div className="col-1-of-4">
                            <h4 className="form__input-label">Start Date</h4>
                            <input onChange={handleChange} className="form__input-date"  type="date" id="start" name="start" value={format(new Date(customRange.start), "yyyy-MM-dd")}></input>
                        </div>

                        <div className="col-1-of-4">
                            <h4 className="form__input-label">End Date</h4>
                            <input onChange={handleChange} className="form__input-date" type="date" id="end" name="end" value={format(new Date(customRange.end), "yyyy-MM-dd")}></input>
                        </div>
                        <div className="col-1-of-4">
                            &nbsp;
                        </div>
                    </div>
                </form>

                <EmployeeTimeTable 
                    users={users}
                    timeStamps={timeStamps}
                    start={customRange.start}
                    end={customRange.end}
                />

           
                    <div className="">
                        
                        <form onSubmit={sendMonthlyReport}>
                            <h4 className="form__input-label">Start Date</h4>
                            <input onChange={handleChange} className="form__input-date"  type="date" id="month" name="month" value={format(new Date(customRange.start), "yyyy-MM-dd")}></input>
                            <button className="main-button main-button--large" type ="submit">Email Monthly Report</button>
                        </form>

                    </div>

                    <div>
                        <form onSubmit={sendJobTypeReport}>
                            <h4 className="form__input-label">Job Type Report</h4>
                            <select onChange={handleChange2} type="text" value={jobType.jName} className="selector selector--large margin-top-small margin-bottom-0" id="jName" name="jName" required>
                                <option>Select Job</option>
                                {jobSelector()}
                            </select>
                            <button className="main-button main-button--large" type ="submit">Email Job Type Report</button>
                        </form>
                    </div>

                    <div>
                        <form onSubmit={sendBudgets}>
                        <button className="main-button main-button--large" type ="submit">Send Budgets</button>
                        </form>
                    </div>
                

            </div>
            

            {loading === true ? <Loading /> : <div>&nbsp;</div>}

        </div>
    );
    } else {
        return (
            <PleaseLogin />
        )
    }
};


export default StaffTimesheets;