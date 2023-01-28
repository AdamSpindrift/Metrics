import React, { useState, useEffect } from "react";
import { navigate } from "hookrouter";
import { format } from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import { setCurrentStamp } from "../actions/setCurrentStamp";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import Loading from "../Generic/Loading";
import msToTime from "../Generic/msToTime";
require("dotenv").config()

function EmployeeTimestamps () {

    let isLoggedIn = useSelector(state => state.loggedIn);
    const timestamps = useSelector(state => state.timestamps);
    const users = useSelector(state => state.users);
    const activeEmployeeID = useSelector(state => state.activeEmployee);
    const dispatch = useDispatch();

    const activeEmployee = users.find(u => u._id === activeEmployeeID);

    const e = activeEmployee;

    const [stamps, setStamps] = useState([]);

    const [loading, setLoading] = useState(true);

    if(e.TodaysStamps.length !== 0) {
        let stampBuilder = [];
        
        for (let i = 0; i< activeEmployee.TodaysStamps.length; i++) {

            const newStamp = timestamps.find(a => a._id === e.TodaysStamps[i]);

            if(newStamp !== undefined) {
                stampBuilder.push(newStamp);
            };
            
        };
        

        setTimeout(() => {
            setStamps(stampBuilder);
            setLoading(false);
        }, 200);
    };

    useEffect(() => {
        if(e.TodaysStamps.length === 0) {
            setLoading(false);
        };
    }, []);

    
    
    function selectStamp (e) {
        e.preventDefault();
        const selectedStamp = e.currentTarget.getAttribute("data-item");
        store.dispatch(setCurrentStamp(selectedStamp));
        navigate("/editstamp");
    };
    
    


    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Employee Timesheet" />
                <h2 className="margin-top-small">{activeEmployee.FirstName + " " + activeEmployee.LastName}</h2>
                <h2>{format(new Date(), "dd/MMM/yyy")}</h2>
                
                {stamps.length !== 0 ? 
                <table id="stampstable" className="clients__clients-table">

                <tbody>
                    <tr className="table-lines-2">
                        <th className="table-lines-2 table__large-col">Client</th>
                        <th className="table-lines-2 table__large-col">Job</th>
                        <th className="table-lines-2">Description</th>
                        <th className="table-lines-2 table__medium-col">Duration</th>
                        <th className="table-lines-2 table__medium-col">Cost</th>
                        <th className="table-lines-2 table__medium-col">Manual Edit</th>                      
                    </tr>
                        {stamps.map((item, i) => (
                        <tr key={i} data-item={item._id} className="table__select-row--1 table-lines-2" onClick={selectStamp}>
                            <td className="table-lines-2">{item.ClientName}</td>
                            <td className="table-lines-2">{item.JobTitle}</td>
                            <td className="table-lines-2">{item.Description}</td>
                            <td className="table-lines-2">{msToTime(item.Duration)}</td>
                            <td className="table-lines-2">£{Math.round(item.Cost)}</td>
                            {item.ManualEdit === true ? <td className="table-lines-2 table-neg-value">Yes</td> : <td className="table-lines-2 table-pos-value">No</td>} 
                        </tr>
                        ))}
                </tbody>

                </table>
            : <div>&nbsp;</div>}
                
            {loading === true ? <Loading /> : <div>&nbsp;</div>}
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
          )
    };
};


export default EmployeeTimestamps;