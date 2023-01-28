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

function ClientRecoverabilityReport () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalJobs = useSelector(state => state.jobs);
    const globalTimestamps = useSelector(state => state.allTimestamps);
    const clients1 = useSelector(state => state.clients);
    const clients2 = clients1.filter(c => c.ClientType !== "Individual")
    const clients = clients2.sort((a,b) => (a.ClientName > b.ClientName) ? 1 : ((b.ClientName > a.ClientName) ? -1 : 0));
    const dispatch = useDispatch();

    const navUserBookkeeping = () => {
        
        navigate("/userbookkeepingreport");
    };

    const [loading, setLoading] = useState(true);

    const [activeUser, setActiveUser] = useState({
        clientName: "",
        startDate: subMonths(startOfMonth(new Date()),0),
        endDate: subMonths(endOfMonth(new Date()),0),
    });

    const [jobAnalysis, setJobAnalysis] = useState([]);
    const [recoverability, setRecoverability] = useState(0);
    const [mRecoverability, setMRecoverability] = useState(0);
    const [clientAHR, setClientAHR] = useState(0);
    const [clientFee, setClientFee] = useState(0);
    const [monthlyBookkeepingFee, setBookkeepingFee] = useState(0);
    const [monthlyPaymentRunFee, setPaymentRunFee] = useState(0);
    const [combinedFee, setCombinedFee] = useState(0);
    const [combinedAHR, setCombinedAHR] = useState(0);


    useEffect(() =>{

        setLoading(true);

        const completedPeriodJobs = globalJobs.filter(j => new Date (j.CompletedDate) > new Date (activeUser.startDate));
        const completedPeriodJobs2 = completedPeriodJobs.filter(j => new Date(j.CompletedDate) < new Date(activeUser.endDate));
        
        let completedPeriodTime = [];
        let periodStamps = [];


        for(let i = 0; i<completedPeriodJobs2.length; i++) {
            let newCompletedPeriodTime = [...completedPeriodTime, ...completedPeriodJobs2[i].Timestamps];

            completedPeriodTime = newCompletedPeriodTime;
        };

        sleep(100);

        for( let i = 0; i<completedPeriodTime.length; i++) {
            const newStamp = globalTimestamps.find(s => s._id === completedPeriodTime[i]);

            if(newStamp !== undefined || newStamp !== null) {
                periodStamps.push(newStamp);
            }; 
        };

        sleep(100);

        const uniqueJobs = completedPeriodJobs2.filter(j => j.ClientName === activeUser.clientName);

        let jobAnalysisBuild = [];
        let userRecover = [];
        let userAHR = [];
        let budgetTime = [];
        let allDuration = [];
        let budgetFee = [];

        for(let i = 0; i<uniqueJobs.length; i++) {

            const currentJob = uniqueJobs[i];
            const jobStampIDs = currentJob.Timestamps;
            const jobStamps = [];
            let duration = 0;

            if(!isNaN(currentJob.Duration)){
                duration = currentJob.Duration;
            };


            for(let i = 0; i<jobStampIDs.length; i++) {
                const newStamp = periodStamps.find(s=> s._id === jobStampIDs[i]);

                if(newStamp !== null || newStamp !== undefined) {
                    jobStamps.push(newStamp);
                };
            };

            sleep(100)

            const allUsers = jobStamps.map(s => s.EmployeeName);
            const uniqueUsers = [...new Set(allUsers)];
            let userTimePercentages = [];

            for (let i = 0; i<uniqueUsers.length; i++) {
                const userStamps = jobStamps.filter(s => s.EmployeeName === uniqueUsers[i]);
                const userTimeArray = userStamps.map(s => s.Duration);
                const userTime = userTimeArray.reduce(add, 0);
                const userTimePercentage = ((userTime / duration) * 100).toFixed(0);

                const newUser = uniqueUsers[i] + " - " + userTimePercentage + "%";

                userTimePercentages.push(newUser);
            };

            sleep(100);

            let recover = (currentJob.BudgetMilliseconds / currentJob.Duration);

            if(isFinite(recover)) {
                
            } else {
                recover = 1;
            };

            let AHR = currentJob.AHR;

            if(AHR === null || AHR === undefined || AHR === 0) {
                let budgetHours = (currentJob.BudgetMilliseconds / 3600000);
                AHR = (currentJob.BudgetFee / budgetHours);
            };

            const jobFee = currentJob.BudgetFee.toFixed(2);

            const jobAnalysisObject = {
                ClientName: currentJob.ClientName,
                Title: currentJob.Title,
                Date: format(new Date(currentJob.Date), "dd-MMM yyy"),
                CompletedDate: format(new Date(currentJob.CompletedDate),"dd-MMM yyyy"),
                BudgetFee: jobFee,
                BudgetMilliseconds: currentJob.BudgetMilliseconds,
                Duration: duration,
                AllUsers: userTimePercentages,
                TotalRecoverability: recover,
                AHR: AHR.toFixed(0),
            };

            const jobTitle = currentJob.Title;


            if(jobTitle.toLowerCase().includes("admin") || jobTitle.toLowerCase().includes("meeting") || jobTitle.toLowerCase().includes("quick question")){ 
                
            } else {

                if(currentJob.ClientName !== company && jobTitle.toLowerCase().includes("bookkeeping") || jobTitle.toLowerCase().includes("payment run")) {

                    jobAnalysisBuild.push(jobAnalysisObject);

                    budgetTime.push(currentJob.BudgetMilliseconds);
                    allDuration.push(duration);
                    budgetFee.push(parseFloat(jobFee));

                    if(!isNaN(AHR)) {
                        userAHR.push(AHR);
                    };
                    
                    
                    
                };
                
                
            };

            
        };



        setTimeout(() => {

            
            

            jobAnalysisBuild.sort(function(a,b){
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
                const totalDuration = allDuration.reduce(add,0);
                const totalBudgetDuration = budgetTime.reduce(add,0);
                const totalFee = budgetFee.reduce(add,0);
                const hours = (totalDuration / 3600000);
                setJobAnalysis(jobAnalysisBuild);
                setRecoverability(totalBudgetDuration/totalDuration);
                setClientAHR((totalFee/hours));
                setClientFee(totalFee);
                if(activeUser.clientName !== "") {
                    const activeClient = clients2.find(c => c.ClientName === activeUser.clientName);
                    const budgets = activeClient.Budgets;
                    const paymentRunBudget = budgets.find(b => b.Title === "Payment Run");
                    
                    const res = jobAnalysisBuild.filter(({ ["Title"]: name }) => name && name.includes('Bookkeeping'));
                    const bookkeepingBudget = budgets.find(b => b.Title === res[0].Title);
    
                    if(!isNaN(bookkeepingBudget.MonthlyBudget)){
                        setBookkeepingFee(bookkeepingBudget.MonthlyBudget)
                    };
    
                    if(!isNaN(paymentRunBudget.MonthlyBudget)){
                        setPaymentRunFee(paymentRunBudget.MonthlyBudget)
                    };
    
                    
                    setCombinedFee(paymentRunBudget.MonthlyBudget +bookkeepingBudget.MonthlyBudget);
    
                    setCombinedAHR((paymentRunBudget.MonthlyBudget +bookkeepingBudget.MonthlyBudget)/hours);
                    
                    setMRecoverability(((combinedFee/40)/hours));

                    console.log("Combined Fee / 40 - " + ((combinedFee/40)/hours));
                }

                setLoading(false);
            },[200]);
            
            
        },[2000]);

        
        
    },[activeUser]);

    const userSelector = () => {
        return clients.map((c, i) => {
    
          return (
            <option key={i}>{c.ClientName}</option>
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
                        <div>
                            <h4 className="form__input-label">User</h4>
                            <select onChange={handleChange} type="text" value={activeUser.clientName} className="selector" id="clientName" name="clientName" required>
                                <option>Select User</option>
                                {userSelector()}
                            </select>
                        </div>
                        <div className="">
                            <h4 className="form__input-label">Start Date</h4>
                            <input onChange={handleChange} className="form__input-date"  type="date" id="startDate" name="startDate" value={format(new Date(activeUser.startDate), "yyyy-MM-dd")}></input>
                        </div>

                        <div className="">
                            <h4 className="form__input-label">End Date</h4>
                            <input onChange={handleChange} className="form__input-date" type="date" id="endDate" name="endDate" value={format(new Date(activeUser.endDate), "yyyy-MM-dd")}></input>
                        </div>
                    </form>

                    <div className="bookkeeping-user-report__recoverability">

                        <div>
                            <h4>Monthly</h4>
                            <h4>Recoverability</h4>
                            <h4>{mRecoverability.toFixed(2)}</h4>
                        </div>

                        <div>
                            <h4>Completed</h4>
                            <h4>Recoverability</h4>
                            <h4>{recoverability.toFixed(2)}</h4>
                        </div>

                        <div>
                            <h4>Completed Fee</h4>
                            <h4>{clientFee.toFixed(0)}</h4>
                        </div>
                        
                        <div>
                            <h4>Completed AHR</h4>
                            <h4>{clientAHR.toFixed(0)}</h4>
                        </div>

                        
                        
                    </div>

                    <div className="bookkeeping-user-report__recoverability bookkeeping-user-report__recoverability--2">

                        <div>
                            <h4>Monthly</h4>
                            <h4>Bookkeeping Fee</h4>
                            <h4>{monthlyBookkeepingFee.toFixed(0)}</h4>
                        </div>
                        <div>
                            <h4>Monthly</h4>
                            <h4>Payment Run Fee</h4>
                            <h4>{monthlyPaymentRunFee.toFixed(0)}</h4>
                        </div>
                        <div>
                            <h4>Monthly</h4>
                            <h4>Combined Fee</h4>
                            <h4>{combinedFee.toFixed(0)}</h4>
                        </div>
                        <div>
                            <h4>Monthly</h4>
                            <h4>Combined AHR</h4>
                            <h4>{combinedAHR.toFixed(0)}</h4>
                        </div>
                        
                    </div>



                    <table id="jobrecoverabilitytable" className="job-analysis-table">

                        <tbody>
                            <tr className="table-lines-2">
                                <th className="">Client Name</th>
                                <th className="">Job Name</th>
                                <th className="">Date</th>
                                <th className="">Completed Date</th>
                                <th className="">Budget Fee</th>
                                <th className="">Budget Time</th>
                                <th className="">Duration</th>
                                <th className="">User Time %</th>
                                <th className="">Recoverability</th>
                                <th className="">AHR</th>
                            </tr>
                            {jobAnalysis.map((item, i) => (
                                <tr key={i} data-item={item._id} className="table-lines-2">
                                    <td className="table-lines-2">{item.ClientName}</td>
                                    <td className="table-lines-2">{item.Title}</td>
                                    <td className="table-lines-2">{item.Date}</td>
                                    <td className="table-lines-2">{item.CompletedDate}</td>
                                    <td className="table-lines-2">£{item.BudgetFee}</td>
                                    <td className="table-lines-2">{msToTime(item.BudgetMilliseconds)}</td>
                                    <td className="table-lines-2">{msToTime(item.Duration)}</td>
                                    <td className="table-lines-2 job-analysis-table__user-time">{item.AllUsers[0]}<br></br>{item.AllUsers[1]}<br></br>{item.AllUsers[2]}<br></br>{item.AllUsers[3]}<br></br></td>
                                    <td className="table-lines-2">{item.TotalRecoverability.toFixed(2)}</td>
                                    <td className="table-lines-2">{item.AHR}</td>
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


export default ClientRecoverabilityReport;