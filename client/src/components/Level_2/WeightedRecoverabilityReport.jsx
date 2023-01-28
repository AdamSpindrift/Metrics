import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
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
require("dotenv").config()

function WeightedRecoverabilityReport () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalJobs = useSelector(state => state.jobs);
    const globalTimestamps = useSelector(state => state.allTimestamps);
    const clients1 = useSelector(state => state.clients);
    const clients = clients1.sort((a,b) => (a.ClientName > b.ClientName) ? 1 : ((b.ClientName > a.ClientName) ? -1 : 0));
    const dispatch = useDispatch();

    const navUserBookkeeping = () => {
        
        navigate("/userbookkeepingreport");
    };

    const [loading, setLoading] = useState(false);

    const [activeUser, setActiveUser] = useState({
        startDate: subMonths(startOfMonth(new Date()),0),
        endDate: subMonths(endOfMonth(new Date()),0),
    });

    const [clientAnalysis, setClientAnalysis] = useState([]);
    const [companyrecoverability, setCompanyRecoverability] = useState(0);
    const [companyAHR, setCompanyAHR] = useState(0);
    const [periodUsers, setPeriodUsers] = useState([]);


    useEffect(() =>{

        setLoading(true);

        const completedPeriodJobs = globalJobs.filter(j => new Date (j.CompletedDate) > new Date (activeUser.startDate));
        const completedPeriodJobs2 = completedPeriodJobs.filter(j => new Date(j.CompletedDate) < new Date(activeUser.endDate));
        const compBookkeepingJobs = [];
        let clientAnalysisBuild = [];

        // Filter Bookkeeping related Jobs

        console.log(completedPeriodJobs2.length);

        sleep(2000);

        // Not running Loop for some reason

        for(let i = 0; i< completedPeriodJobs2; i++) {

            const jobTitle = completedPeriodJobs2[i].Title;
            console.log("Bookkeeping Loop - " + [i]);

            if(jobTitle.toLowerCase().includes("admin") || jobTitle.toLowerCase().includes("meeting") || jobTitle.toLowerCase().includes("quick question")){ 
                console.log("Admin");
            } else {

                console.log("Non Admin");

                if(completedPeriodJobs2[i].ClientName !== company && jobTitle.toLowerCase().includes("bookkeeping") || jobTitle.toLowerCase().includes("payment run")) {

                    compBookkeepingJobs.push(completedPeriodJobs2[i]);
                    console.log("Job Hit");
                };
            };
        };

        sleep(200);

        // Filter relevant timestamps

        let completedPeriodTime = [];
        let periodStamps = [];

        for(let i = 0; i<compBookkeepingJobs.length; i++) {
            let newCompletedPeriodTime = [...completedPeriodTime, ...compBookkeepingJobs[i].Timestamps];

            completedPeriodTime = newCompletedPeriodTime;
        };

        sleep(100);

        for( let i = 0; i<completedPeriodTime.length; i++) {
            const newStamp = globalTimestamps.find(s => s._id === completedPeriodTime[i]);

            if(newStamp !== undefined || newStamp !== null) {
                periodStamps.push(newStamp);
            }; 
        };

        // Get relevant Employees

        const periodClients = compBookkeepingJobs.map(j => j.ClientName);
        const uniquePeriodClients = [...new Set(periodClients)];

        sleep(100);

        const periodUsers1 = periodStamps.map(s => s.EmployeeName);
        const uniquePeriodUsers = [...new Set(periodUsers1)];
        setPeriodUsers(uniquePeriodUsers);

        for(let i = 0; i<uniquePeriodClients.length; i++) {

            const clientJobs = compBookkeepingJobs.filter(j => j.ClientName === uniquePeriodClients[i]);
            const clientBudgetTimeArray = clientJobs.map(j => j.BudgetMilliseconds);
            const clientBudgetTime = clientBudgetTimeArray.reduce(add, 0);
            const clientBudgetFeeArray = clientJobs.map(j => j.BudgetFee);
            const clientDurationArray = clientJobs.map(j => j.Duration);

            const clientBudgetFee = clientBudgetFeeArray.reduce(add, 0);
            const clientDuration = clientDurationArray.reduce(add, 0);
            const clientBudgetHours = (clientBudgetTime / 3600000);
            const clientDurationHours = (clientDuration / 3600000);
            const clientAHR = (clientBudgetFee / clientDurationHours);

            const clientStamps = periodStamps.filter(s => s.ClientName === uniquePeriodClients[i]);
            

            let userTime = [];
            let userFeeAllocation = []

            for(let i = 0; i<uniquePeriodUsers.length; i++) {

                const userStamps = clientStamps.filter(s => s.EmployeeName === uniquePeriodUsers[i]);

                if(userStamps.length !== 0) {
                    const userTimeArray = userStamps.map(s => s.Duration);
                    const userTimer = userTimeArray.reduce(add, 0);
                    const userHours = (userTimer / 3600000);

                    userTime.push(userHours);

                    const userFee = (userHours / clientDuration * clientBudgetFee);
                    userFeeAllocation.push(userFee);
                } else {
                    userTime.push(0);
                    userFeeAllocation.push(0);
                };
                
            };

            sleep(100);

            const clientAnalysisObject = {
                clientName: uniquePeriodClients[i],
                userTime: userTime,
                totalTime: clientDurationHours,
                budgetTime: clientBudgetHours,
                budgetFee: clientBudgetFee,
                AHR: clientAHR,
                userFeeAllocation: userFeeAllocation, 
            };

            clientAnalysisBuild.push(clientAnalysisObject);

            const limit = (uniquePeriodClients.length - 1);

            if( i === limit) {
                setTimeout(() => {
                    setClientAnalysis(clientAnalysisBuild);
                },[200]);
            };


        };



        


            

            
        



        setTimeout(() => {

            clientAnalysisBuild.sort(function(a,b){
                let nameA = a.ClientName.toLowerCase();
                let nameB = b.ClientName.toLowerCase();
                if(nameA < nameB) {
                    return -1;
                };
                if(nameA > nameB) {
                    return 1;
                };
            });

            setTimeout(() => {
                setClientAnalysis(clientAnalysisBuild);
                setLoading(false);
            },[200]);
            
            
        },[2000]);

        
        
    },[activeUser]);


    const userHeaders = (users) => {
        return users.map((u, i) => {
    
            return (
              <th key={i}>{u}</th>
            )
          })
    };


    function handleChange(event) {
        const{name, value} = event.target;
    
        setActiveUser((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
      };


    
    if( isLoggedIn === true) {

        return (
            <div className="container-2">
                <Header title="Bookkeeping Client Report"/>

                <div className="bookkeeping-user-report">

                

                    <form className="bookkeeping-user-report__form margin-top-small">
                        
                        <div className="">
                            <h4 className="form__input-label">Start Date</h4>
                            <input onChange={handleChange} className="form__input-date"  type="date" id="startDate" name="startDate" value={format(new Date(activeUser.startDate), "yyyy-MM-dd")}></input>
                        </div>

                        <div className="">
                            <h4 className="form__input-label">End Date</h4>
                            <input onChange={handleChange} className="form__input-date" type="date" id="endDate" name="endDate" value={format(new Date(activeUser.endDate), "yyyy-MM-dd")}></input>
                        </div>
                    </form>

                    {/* <div className="bookkeeping-user-report__recoverability">

                        <div>
                            <h3>Recoverability</h3>
                            <h3>{recoverability.toFixed(2)}</h3>
                        </div>
                        
                        <div>
                            <h3>AHR</h3>
                            <h3>{clientAHR.toFixed(0)}</h3>
                        </div>
                        
                    </div> */}



                    <table id="jobrecoverabilitytable" className="job-analysis-table">

                        <tbody>
                            <tr className="table-lines-2">
                                <th className="">Client Name</th>
                                {userHeaders(periodUsers)}
                                <th>Total Time</th>
                                <th>Budget Time</th>
                                <th>Budget Fee</th>
                                <th>AHR</th>
                                {userHeaders(periodUsers)}
                            </tr>
                            {clientAnalysis.map((item, i) => (
                                <tr key={i} data-item={item._id} className="table-lines-2">
                                    <td className="table-lines-2">{item.ClientName}</td>
                                    <td></td>
                                    
                                </tr>
                            ))}
                        </tbody>

                    </table>

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


export default WeightedRecoverabilityReport;