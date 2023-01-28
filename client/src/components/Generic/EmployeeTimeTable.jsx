import React, { useState, Fragment, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { startOfWeek, endOfWeek, format, startOfMonth, endOfMonth, getWeekOfMonth, isWeekend, differenceInBusinessDays, getDay, getMonth, getYear, add } from "date-fns";
import { CSVLink } from "react-csv";
// State
import { useSelector, useDispatch } from "react-redux";
import { setActiveEmployee } from "../actions/setActiveEmployee";
import { setStartStamps } from "../actions/setStartStamps";
import { setEndStamps } from "../actions/setEndStamps";
import store from "../store";
// Generic
import msToTime from "./msToTime";
import add2 from "./add";
import sleep from "./sleep";
import UpdateSuccessMessage from "../Generic/UpdateSuccessMessage";
import Loading from "../Generic/Loading";
require("dotenv").config()



function EmployeeTimeTable (props) {

    const company = useSelector(state => state.company);
    const user = useSelector(state => state.user);
    const userName = user.fName + " " + user.lName;
    const nameArray = userName.split(" ", 2);

    const [times2, setTimes2] = useState([]);

    const [thisPeriodStamps, setThisPeriodStamps] = useState([]);

    const [report2Sent, setReport2Sent] = useState(false);

    const [loading, setLoading] = useState(true);
    
    const users = props.users;

    let timeStamps = props.timeStamps;

    if(timeStamps === null) {
        timeStamps=[];
    };

    let usersTime = [];





    useEffect(() => {


        if (timeStamps.length !== 0) {

            setLoading(true);


            async function createData() {
                for (let i = 0; i< users.length; i++) {

                    const start = new Date(props.start);
                    const end = add(new Date(props.end), {
                        hours: 22,
                    });
        
                    const filteredStamps1 = await timeStamps.filter(s => new Date(s.StartTime) >= new Date(props.start));
                    const rangeStamps = await filteredStamps1.filter(s => new Date(s.StartTime) <= new Date(end));
                    setThisPeriodStamps(rangeStamps);
                    const userStamps = await rangeStamps.filter(s => s.EmployeeName === users[i].FirstName + " " + users[i].LastName)
                    const userDurations = await userStamps.map(s => s.Duration);
                    const userContractDays = parseFloat(users[i].WorkingDaysWeek);
                    const userContractHours = parseFloat(users[i].WorkingHoursDay);
                    let userTime = 0;

                    sleep(2000);
        
                    if (userDurations.length !== 0) {
                        userTime = userDurations.reduce(add2, 0);
                    };

                    // Calc expected Time

                    let businessDaysCalc = differenceInBusinessDays(end, start);
                    let week = businessDaysCalc/5;
                    let subDays = 0;

                    
                
                
                    if(userContractDays !== 5){
                        subDays = (5 - userContractDays) * week;
                    };

                    businessDaysCalc = differenceInBusinessDays(end, start)+1 - subDays;

        
       
                
                    const businessDays = businessDaysCalc;
                    
                    const expectedHours = (businessDays * userContractHours);
                    const expectedMs = (expectedHours * 3600000);
                    const differenceMs = (userTime - expectedMs);
                    

                        setTimeout(() => {
                            const userDetails = {
                                id: users[i]._id,
                                name: users[i].FirstName + " " + users[i].LastName,
                                time: userTime,
                                expectedTime: expectedMs,
                                difference: differenceMs,
                            };
                
                            usersTime.push(userDetails);
        
                            if(i === users.length-1) {
                                
                                setTimes2(usersTime);
                                setLoading(false);
                                
                            }
                        }, 200);
                    
        
                };

            };

            createData();

            
        };

    }, [timeStamps, props.start, props.end]);


    

    

    function selectEmployee (e) {
        e.preventDefault();
        const selectedEmployee = e.currentTarget.getAttribute("data-item");
        store.dispatch(setActiveEmployee(selectedEmployee));
        store.dispatch(setStartStamps(props.start));
        store.dispatch(setEndStamps(props.end));
        navigate("/employeetimestampsrange");
    };

    

    function sendReport (e) {
        e.preventDefault();

        const reportDetails = {
            fName: nameArray[0],
            lName: nameArray[1],
            company: company,
            reportName: "Timestamps " + format(new Date(props.start), "dd/MM/yyyy") + " to " + format(new Date(props.end), "dd/MM/yyyy"),
            startDate: new Date(props.start),
            endDate: new Date(props.end),
        }

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "reportsapi/sendweeklyreport", {reportDetails})
        .then(res => {
            console.log(res.data.message);
            setReport2Sent(true);

            setTimeout(() => {
                setReport2Sent(false);
            }, 2000);
            
        });
    };


    return (
        <div className="container-2">
            {report2Sent ? <UpdateSuccessMessage message="Report Sent" /> : <div className="nbsp">&nbsp;</div>}

            {times2.length !== 0 ?
                <div>
                    <table id="clientstable" className="clients__clients-table margin-top-0">

                    <tbody>
                        <tr className="table-lines-2">
                            <th className="table-lines-2 table__staff-col">Employee</th>
                            <th className="table-lines-2 table__large-col">Time</th>
                            <th className="table-lines-2 table__large-col">Expected Time</th>
                            <th className="table-lines-2 table__large-col">Difference Time</th>
                        </tr>
                            {times2.map((item, i) => (
                            <tr key={i} data-item={item.id} onClick={selectEmployee} className="table__select-row--1 table-lines-2">
                                <td className="table-lines-2">{item.name}</td>
                                <td className="table-lines-2">{msToTime(item.time)}</td>
                                {Math.sign(item.expectedTime) === 1 ? <td className="table-pos-value table-lines-2">{msToTime(item.expectedTime)}</td> : <td className="table-neg-value table-lines-2">{msToTime(item.expectedTime)}</td>}
                                {Math.sign(item.difference) === 1 ? <td className="table-pos-value table-lines-2">{msToTime(item.difference)}</td> : <td className="table-neg-value table-lines-2">{msToTime(item.difference)}</td>}
                            </tr>
                            ))}
                    </tbody>

                    </table>

                    <CSVLink
                        data={thisPeriodStamps}
                        filename={"Times for - " + format(new Date(props.start), "dd/MM/yyyy") + " - " + format(new Date(props.end), "dd/MM/yyyy")}
                        className="main-button main-button--large"
                        target="_blank">
                        Download CSV
                    </CSVLink>

                    <form onSubmit={sendReport}>
                        <button className="main-button main-button--large" type ="submit">Email Custom Report</button>
                    </form>
                </div>
            : <div>&nbsp;</div>}

            {loading === true ? <Loading /> : <div>&nbsp;</div>}
        </div>
    );
};


export default EmployeeTimeTable;