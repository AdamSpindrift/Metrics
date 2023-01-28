import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { format, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from "date-fns";
import { CSVLink } from "react-csv";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import msToTime from "../Generic/msToTime";
import add from "../Generic/add";
import sleep from "../Generic/sleep";
import Loading from "../Generic/Loading";
import removeDupes from "../Generic/removeDupes";
require("dotenv").config()

function MGMTAccountsTransactionsReport () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalJobs = useSelector(state => state.jobs);
    const globalTimestamps = useSelector(state => state.allTimestamps);
    const clients = useSelector(state => state.clients);
    const teams = useSelector(state => state.teams);


    const mgmtAccountsJobs = globalJobs.filter(j => j.Title.toLowerCase().includes("management accounts"));
    const mgmtAccountsTimestamps = globalTimestamps.filter(t => t.JobTitle.toLowerCase().includes("management accounts"));
    const allMgmtAccountsClients = mgmtAccountsTimestamps.map(t => ({ClientId: t.ClientId, ClientName: t.ClientName}));
    const ids = allMgmtAccountsClients.map(c => c.ClientId);
    const uniqueMgmtAccountsClients = allMgmtAccountsClients.filter(({ClientId}, index) => !ids.includes(ClientId, index + 1) )
    const mgmtAccountsClientsSorted = uniqueMgmtAccountsClients.sort((a,b) => (a.ClientName > b.ClientName) ? 1 : ((b.ClientName > a.ClientName) ? -1 : 0));
    const dispatch = useDispatch();


    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState({
        month: format(endOfMonth(subMonths(new Date(),1)), "dd/MM/yyyy"),
        team: "No Team Selected",
    });
    const [tableArray, setTableArray] = useState([]);

    const monthArray = [
        format(endOfMonth(subMonths(new Date(),1)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),2)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),3)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),4)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),5)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),6)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),7)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),8)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),9)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),10)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),11)), "dd/MM/yyyy"),
        format(endOfMonth(subMonths(new Date(),12)), "dd/MM/yyyy"),
    ];

    

    useEffect(() =>{

        setLoading(true);

        const build = [];

        const dateArray = month.month.split("/");
        const date = endOfMonth(new Date(dateArray[2], dateArray[1]-1, dateArray[0]));
        const jobsThisMonth = mgmtAccountsJobs.filter(t => getMonth(new Date(t.Date)) === getMonth(new Date(date)) && getYear(new Date(t.Date)) === getYear(new Date(date)));
        


        for(let i=0; i<mgmtAccountsClientsSorted.length; i++) {

            let timeDifference = 0;
            let recoverability = 0;
            let completedAHR = 0;
            let completedDate = new Date(1970, 0, 1);
            
            const tClient = clients.find(c => c.ClientName === mgmtAccountsClientsSorted[i].ClientName);
            const tJobs = jobsThisMonth.filter(j => j.ClientName === mgmtAccountsClientsSorted[i].ClientName);
            const jobBudgetArray = tJobs.map(j => j.BudgetFee);
            const jobBudgetTimeArray = tJobs.map(j => j.BudgetMilliseconds);
            const jobTimeArray = tJobs.map(j => j.Duration);
            const removeNaNBudgetTime = jobBudgetTimeArray.filter(a => !isNaN(a));
            const removeNaNDuration = jobTimeArray.filter(a => !isNaN(a));
            const jobBudgetTime = removeNaNBudgetTime.reduce(add,0);
            const duration = removeNaNDuration.reduce(add,0);
            timeDifference = jobBudgetTime - duration;
            recoverability = jobBudgetTime/duration;

            
            completedAHR = (jobBudgetArray.reduce(add, 0).toFixed(0) / (duration/3600000)).toFixed(2);

            if(tJobs[0] !== undefined) {
                completedDate = tJobs[0].CompletedDate;
            };
            

            if(completedDate === undefined) {
                completedDate = new Date(1970, 0, 1);
            };

            if(!isFinite(timeDifference)) {
                timeDifference = 0;
            };

            if(!isFinite(recoverability)) {
                recoverability = 0;
            };

            if(!isFinite(completedAHR)) {
                completedAHR = 0;
            };


            const object = {
                clientName: mgmtAccountsClientsSorted[i].ClientName,
                completedFeeBudget: jobBudgetArray.reduce(add, 0).toFixed(0),
                timeDifference: timeDifference,
                completedAHR: completedAHR,
                completedRecoverability: recoverability,
                completedDate: completedDate,
            }

            if(tClient.ClientState === "Client") {

                if(month.team === "No Team Selected") {
                    build.push(object);
                };

                if(month.team === tClient.Team) {
                    build.push(object);
                };
                
            };

            if(i === mgmtAccountsClientsSorted.length-1) {

                const buildSorted = build.sort((a,b) => new Date(b.completedDate) - new Date(a.completedDate))
                setTableArray(build);
            };

        };


        setLoading(false)
        
    },[month]);

    const monthSelector = () => {
        return monthArray.map((m, i) => {
    
          return (
            <option key={i}>{m}</option>
          )
        })
    };

    const teamSelector = () => {
        return teams.map((t, i) => {
    
          return (
            <option key={i}>{t}</option>
          )
        })
      };

    

    function handleChange(event) {
        const{name, value} = event.target;
    
        setMonth((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
      };


    
    if( isLoggedIn === true) {

        return (
            <div className="container-2">
                <Header title="MGMT Accounts Report"/>

                <div className="bookkeeping-transaction-report">

                

                    <form className="bookkeeping-transaction-report__form margin-top-small">
                        <div>
                            <h4 className="form__input-label">Month</h4>
                            <select onChange={handleChange} type="text" value={month.month} className="selector" id="month" name="month" required>
                                <option>Select Month</option>
                                {monthSelector()}
                            </select>
                        </div>
                        
                    </form>

                    <form className="bookkeeping-transaction-report__form bookkeeping-transaction-report__form--team margin-top-small">
                        <div>
                            <h4 className="form__input-label">Team</h4>
                            <select onChange={handleChange} type="text" value={month.team} className="selector" id="team" name="team" required>
                                <option>No Team Selected</option>
                                {teamSelector()}
                            </select>
                        </div>
                        
                    </form>

                    <CSVLink
                        data={tableArray}
                        filename={"MGMT Accounts Report for " + month.month + " - " + month.team}
                        className="main-button main-button--large bookkeeping-transaction-report__download"
                        target="_blank">
                    Download CSV
                    </CSVLink>



                    {<table id="bookkeepingtransactiontable" className="bookkeeping-transaction-report__table">

                        <tbody>
                            <tr className="table-lines-2 bookkeeping-transaction-report__table--row">
                                <th className="bookkeeping-transaction-report__table--colmedium">Client Name</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">Completed Fee</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">Completed Date</th>
                                <th className="bookkeeping-transaction-report__table--colmedium">Time Difference</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">AHR</th>
                                <th className="bookkeeping-transaction-report__table--colmedium">Recoverability</th>
                            </tr>
                            {tableArray.map((item, i) => (
                                <tr key={i} data-item={item._id} className="table-lines-2 bookkeeping-transaction-report__table--row">
                                    <td className="table-lines-2">{item.clientName}</td>
                                    <td className="table-lines-2">£{item.completedFeeBudget}</td>
                                    <td className="table-lines-2">{format(new Date(item.completedDate),"dd/MM/yyyy")}</td>
                                    {item.timeDifference >= 0 ? <td className="table-lines-2 table-pos-value">{msToTime(item.timeDifference)}</td> :
                                    <td className="table-lines-2 table-neg-value">{msToTime(item.timeDifference)}</td>}
                                    <td className="table-lines-2">{item.completedAHR}</td>
                                    {item.completedRecoverability >= 1.1 ? <td className="table-lines-2 table-pos-value">{item.completedRecoverability.toFixed(2)}</td> :
                                    <td className="table-lines-2 table-neg-value">{item.completedRecoverability.toFixed(2)}</td>}
                                    
                                </tr>
                            ))}
                        </tbody>

                    </table> }

                </div>
                
                {loading === true ? <Loading /> : <div>&nbsp;</div>}

            </div>
        );
    };

    if (isLoggedIn !== true) {
        return (
        <PleaseLogin />
        )
    };
};


export default MGMTAccountsTransactionsReport;