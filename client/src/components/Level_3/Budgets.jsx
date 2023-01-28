import React, { useState } from "react";
import { navigate } from "hookrouter";
import axios from "axios";
// State
import { useSelector, useDispatch } from "react-redux";
import { setClients } from "../actions/setClients";
import { setJobs } from "../actions/setjobs";
import store from "../store";
// Custom Modules
import Nav from "../Generic/Nav";
import PleaseLogin from "../Generic/PleaseLogin";
import msToTime from "../Generic/msToTime";
import Loading from "../Generic/Loading";
require("dotenv").config()

function Budgets () {

    const [loading, setLoading] = useState(false);

    const userName = useSelector(state => state.userName);
    const company = useSelector(state => state.company);
    const selectedClientID = useSelector(state => state.activeClient);
    const selectedBudgetID = useSelector(state => state.activeBudget);
    const allClients = useSelector(state => state.clients);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();

    function navClientDetails() {
        navigate("/clientdetails");
    };

    const currentClient = allClients.find(client => client._id === selectedClientID);
    const currentBudget = currentClient.Budgets.find(budget => budget._id === selectedBudgetID);

    const [budgetDetails, setCompany] = useState({
        company: company,
        client: selectedClientID,
        budgetID: selectedBudgetID,
        title: currentBudget.Title,
        frequency: currentBudget.Frequency,
        totalBudget: currentBudget.TotalBudget,
        totalBudgetHours: currentBudget.TotalBudgetHours,
        totalBudgetMinutes: currentBudget.TotalBudgetMinutes,
        visibility: "Visible",
        globalUpdate: "No",
      });
    
    
    function handleChange(event) {
        const{name, value} = event.target;
    
        setCompany((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    function handleSubmit (event) {
        event.preventDefault();
        setLoading(true);
        
    
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/updatebudget", {budgetDetails})
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

    

    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Nav />
                <h1>Budget</h1>

                <div className="budget__details">
                    <div className="budget__details__text float-left">
                        <h2>Budget Name:</h2>
                        <h2>Frequency:</h2>
                        <h2>Yearly Budget:</h2>
                        <h2>Yearly Hours:</h2>
                        <h2>Budget per Job:</h2>
                        <h2>Time per Job:</h2>
                    </div>
                    <div className="budget__details__text">
                        <h2>{currentBudget.Title}</h2>
                        <h2>{currentBudget.Frequency}</h2>
                        <h2>£{currentBudget.TotalBudget}</h2>
                        <h2>{currentBudget.TotalBudgetHours} hrs</h2>
                        <h2>£{Math.round((currentBudget.BudgetedFeePerJob + Number.EPSILON) * 100) /100}</h2>
                        <h2>{msToTime(currentBudget.BudgetedMillisecondsPerJob)}</h2>
                    </div>
                </div>

                <form onSubmit={navClientDetails}>
                    <button className="main-button main-button--float-left" type ="submit">Client Details</button>
                </form>


                <div className="budget__form">
                    <h2>Edit Budget</h2>
                    <form onSubmit={handleSubmit}>
                        <h4 className="">Budget Name</h4>
                        <input onChange={handleChange} type="text" value={budgetDetails.title} name="title" placeholder="Name" readOnly/>
                        <h4 className="">Job Frequency</h4>
                        <select onChange={handleChange} type="text" value={budgetDetails.frequency} className="selector" id="frequency" name="frequency" required>
                                <option>Please Select</option>
                                <option>Daily</option>
                                <option>Weekly</option>
                                <option>Fortnightly</option>
                                <option>2 per Month</option>
                                <option>Monthly</option>
                                <option>Quarterly</option>
                                <option>Annually</option>
                        </select>
                        <h4 className="">Yearly Budgeted Fee GBP</h4>
                        <input onChange={handleChange} type="number" value={budgetDetails.totalBudget} name="totalBudget" placeholder="Yearly Budgeted Fee"/>
                        <h4 className="">Yearly Budgeted Hours</h4>
                        <input onChange={handleChange} type="number" value={budgetDetails.totalBudgetHours} name="totalBudgetHours" placeholder="Yearly Budgeted Hours"/>
                        <h4 className="">Yearly Budgeted Minutes</h4>
                        <input onChange={handleChange} type="number" value={budgetDetails.totalBudgetMinutes} name="totalBudgetMinutes" placeholder="Yearly Budgeted Minutes"/>
                        <h4 className="">Visibility</h4>
                        <select onChange={handleChange} type="text" value={budgetDetails.visibility} className="selector" id="visibility" name="visibility" required>
                                <option>Visible</option>
                                <option>Hidden</option>
                        </select>
                        <h4 className="">Update Every Client</h4>
                        <select onChange={handleChange} type="text" value={budgetDetails.globalUpdate} className="selector" id="globalUpdate" name="globalUpdate" required>
                                <option>No</option>
                                <option>Yes</option>
                        </select>
                        <br/>
                        <button className="main-button main-button--large" type="submit">Submit</button>
                    </form>
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


export default Budgets;