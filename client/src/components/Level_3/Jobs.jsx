import React, { useState, useEffect } from "react";
import { navigate } from "hookrouter";
import { format } from "date-fns";
import axios from "axios";
// State
import { useSelector, useDispatch } from "react-redux";
import { setClients } from "../actions/setClients";
import { setJobs } from "../actions/setjobs";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import msToTime from "../Generic/msToTime";
import JobDetailsNav from "../Generic/JobDetailsNav";
import Loading from "../Generic/Loading";
require("dotenv").config()

function Jobs () {

    const jobs = useSelector(state => state.jobs);
    const selectedJobID = useSelector(state => state.selectedJob);
    const selectedClientID = useSelector(state => state.activeClient);
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const [timeStamps, setStamps] = useState([]);

    const selectedJob = jobs.filter(job => job._id === selectedJobID);

    const jobPostID = {jobID : selectedJobID,
                    company: company,
                };

    const [budgetDetails, setBudget] = useState({
      company: company,
      client: selectedClientID,
      jobID : selectedJobID,
      totalBudget: 0,
      totalBudgetHours: 0,
      totalBudgetMinutes: 0,
    });
    


    useEffect(() =>{
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/gettimestamps", {jobPostID})
          .then(res => {
            console.log(res.data.message);
            setStamps(res.data.timeStamps);
          });

    },[]);

    function handleChange(event) {
        const{name, value} = event.target;
    
        setBudget((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    function handleSubmit (event) {
        event.preventDefault();
        setLoading(true);
        
    
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/updatejobdirectbudget", {budgetDetails})
          .then(res => {
            console.log(res.data.message);
            store.dispatch(setClients(res.data.clients));
            store.dispatch(setJobs(res.data.jobs));
            setLoading(false);
            setTimeout(() => {
                navigate('/clientdetails');
            }, 100);
          });
    };

    // console.log("Profit Loss Milliseconds - " + selectedJob[0].ProfitLossMilliseconds);
    

    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Job" />
                <JobDetailsNav />

                {access === "Admin" ?
                <div className="job__edit-budget">
                    <form onSubmit={handleSubmit}>
                        <h4 className="">Budgeted Fee GBP</h4>
                        <input onChange={handleChange} type="number" value={budgetDetails.totalBudget} name="totalBudget" placeholder="Yearly Budgeted Fee"/>
                        <h4 className="">Budgeted Hours</h4>
                        <input onChange={handleChange} type="number" value={budgetDetails.totalBudgetHours} name="totalBudgetHours" placeholder="Yearly Budgeted Hours"/>
                        <h4 className="">Budgeted Minutes</h4>
                        <input onChange={handleChange} type="number" value={budgetDetails.totalBudgetMinutes} name="totalBudgetMinutes" placeholder="Yearly Budgeted Minutes"/>
                        <button className="main-button main-button--large" type="submit">Submit</button>
                    </form>
                </div>

                : <div className="job__edit-budget">&nbsp;</div>}

                <div className="budget__details job__details">
                    <div className="budget__details__text float-left">
                        <h3>Job Name:</h3>
                        <h3>Client Name:</h3>
                        <h3>Date:</h3>
                        {access === "Admin" ?
                        <h3>Budget Fee:</h3>: <div>&nbsp;</div>}
                        <h3>Budget Time:</h3>
                        <h3>Status</h3>
                        <h3>Recoverability</h3>
                        <h3>Profit/Loss Time</h3>
                        <h3>Duration</h3>
                        <h3>AHR</h3>
                        {/* <h3>ID:</h3> */}
                    </div>
                    <div className="budget__details__text">
                        <h3>{selectedJob[0].Title}</h3>
                        <h3>{selectedJob[0].ClientName}</h3>
                        <h3>{format(new Date(selectedJob[0].Date), "dd/MMM/yyy")}</h3>
                        {access === "Admin" ?
                        <h3>£{Math.round((selectedJob[0].BudgetFee + Number.EPSILON) * 100) /100}</h3>: <div>&nbsp;</div>}
                        <h3>{msToTime(selectedJob[0].BudgetMilliseconds)}</h3>
                        <h3>{selectedJob[0].Status}</h3>
                        {(selectedJob[0].BudgetMilliseconds/selectedJob[0].Duration) >= 1.1 ? <h3 className="table-pos-value">{Math.round(((selectedJob[0].BudgetMilliseconds/selectedJob[0].Duration) + Number.EPSILON) * 100) / 100}</h3> : <h3 className="table-neg-value">{Math.round(((selectedJob[0].BudgetMilliseconds/selectedJob[0].Duration) + Number.EPSILON) * 100) /100}</h3>}
                        {selectedJob[0].ProfitLossMilliseconds >= 0 ? <h3 className="table-pos-value">{msToTime(selectedJob[0].ProfitLossMilliseconds)}</h3> : <h3 className="table-neg-value">{msToTime(selectedJob[0].ProfitLossMilliseconds)}</h3>}
                        {Number.isNaN(selectedJob[0].Duration) ? <h3>No Data</h3> : <h3>{msToTime(selectedJob[0].Duration)}</h3>}
                        {Number.isNaN(selectedJob[0].AHR) ? <h3>No Data</h3> : <h3>£{Math.round((selectedJob[0].AHR + Number.EPSILON) * 100) /100}</h3>}
                        {/* <h3>{selectedJob[0]._id}</h3> */}
                        
                        
                        
                    </div>
                </div>

                {timeStamps.length > 0 ? 

                <div className="job__time-stamps">
            
                    <h2 className="job__heading-secondary">Time Stamps</h2>
                    
                    <table id="timestamptable" className="job__time-stamps--table">
                    
                    <tbody>
                    
                        <tr>
                            <th>Employee</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Time HH:MM:SS</th>
                            <th>Manual Edit</th>
                        </tr>
                            {timeStamps.map((item, i) => (
                            <tr key={i} className="">
                                <td className="job__time-stamps--table-row">{item.EmployeeName}</td>
                                <td className="job__time-stamps--table-row job__time-stamps--table-row__description">{item.Description}</td>
                                <td className="job__time-stamps--table-row">{format(new Date(item.StartTime), "dd/MMM/yyy")}</td>
                                {item.Duration !== null ? <td className="job__time-stamps--table-row">{msToTime(item.Duration)}</td> : <td>&nbsp;</td>}
                                {item.ManualEdit === true ? <td className="table-lines-2 table-neg-value">Yes</td> : <td className="table-lines-2 table-pos-value">No</td>} 
                            </tr>
                            ))}
                    </tbody>
                            
                    </table>

                
                </div>

                : <div>&nbsp;</div> }

                {loading === true ? <Loading /> : <div>&nbsp;</div>}  
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
        )
    }
};


export default Jobs;