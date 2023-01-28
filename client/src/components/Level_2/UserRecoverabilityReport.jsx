import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { startOfWeek, endOfWeek, format, startOfMonth, endOfMonth, subMonths, getMonth, getYear, getDate } from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import { setUsers } from "../actions/setUsers";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import msToTime from "../Generic/msToTime";
import add from "../Generic/add";
import sleep from "../Generic/sleep";
import Loading from "../Generic/Loading";
require("dotenv").config()

function UserRecoverabilityReport () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalJobs = useSelector(state => state.jobs);
    const globalTimestamps = useSelector(state => state.allTimestamps);
    const dispatch = useDispatch();

    const companyDetails = {company: company};

    const navUserBookkeeping = () => {
        
        navigate("/userbookkeepingreport");
    };

    const [loading, setLoading] = useState(false);

    const [users, setUser] = useState([]);
    const [activeUser, setActiveUser] = useState({
        userName: "",
        startDate: subMonths(startOfMonth(new Date()),0),
        endDate: subMonths(endOfMonth(new Date()),0),
    });

    const [jobAnalysis, setJobAnalysis] = useState([]);
    const [nonBillableJobAnalysis, setNonBillableJobAnalysis] = useState([]);
    const [userPeriodDuration, setUserPeriodDuration] = useState(0);
    const [userBillableHours, setUserBillableHours] = useState(0);
    const [userNonBillableHours, setUserNonBillableHours] = useState(0);
    const [wipHours, setWipHours] = useState(0);

    const [recoverability2, setRecoverability2] = useState(0);
    const [userAHR2, setUserAHR2] = useState(0);

    const [totalRecoverability, setTotalRecoverability] = useState(0);
    const [totalUserAHR, setTotalUserAHR] = useState(0);


    useEffect(() =>{
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/getusers", {companyDetails})
          .then(res => {
            setUser(res.data.users);
            store.dispatch(setUsers(res.data.users));
          });

    },[]);

    

    useEffect(() =>{

        setLoading(true);

        const periodStamps =  globalTimestamps.filter(s => new Date(getYear(new Date(s.StartTime)), getMonth(new Date(s.StartTime)), getDate(new Date(s.StartTime))) >= new Date(getYear(activeUser.startDate), getMonth(activeUser.startDate), getDate(activeUser.startDate)) && new Date(getYear(new Date(s.StartTime)), getMonth(new Date(s.StartTime)), getDate(new Date(s.StartTime))) <= new Date(getYear(activeUser.endDate), getMonth(activeUser.endDate), getDate(activeUser.endDate)));
        const userPeriodStamps = periodStamps.filter(s => s.EmployeeName === activeUser.userName);
        const userPeriodDurationReduce = userPeriodStamps.map(s => s.Duration).reduce(add, 0);
        const userPeriodHours = (userPeriodDurationReduce / 3600000);

        const nonBillableStamps = userPeriodStamps.filter(s => s.JobTitle.toLowerCase().includes("admin") || s.JobTitle.toLowerCase().includes("meeting") || s.JobTitle.toLowerCase().includes("quick question") || s.ClientName === company);
        const nonBillableMs = nonBillableStamps.map(s => s.Duration).reduce(add, 0);
        const nonBillableHrs = (nonBillableMs / 3600000);

        const userPeriodJobIds = userPeriodStamps.map(s => s.JobId);
        const uniqueUserJobIDs = [...new Set(userPeriodJobIds)];
        let periodJobs = [];

        sleep(100);

        setUserPeriodDuration(userPeriodHours);
        setUserNonBillableHours(nonBillableHrs);


        for( let i = 0; i<uniqueUserJobIDs.length; i++) {
            const foundJob = globalJobs.find(j => j._id === uniqueUserJobIDs[i]);

            if(foundJob !== null || foundJob !== undefined) {
                periodJobs.push(foundJob);
            };
        };

        

        sleep(100);

        const completedJobs = periodJobs.filter(j => j.Status === "completed" || j.Title.toLowerCase().includes("admin") || j.Title.toLowerCase().includes("meeting") || j.Title.toLowerCase().includes("quick question") || j.ClientName === company);

        const wipJobs = periodJobs.filter(j => j.Status !== "completed" && !j.Title.toLowerCase().includes("admin") && !j.Title.toLowerCase().includes("meeting") && !j.Title.toLowerCase().includes("quick question") && j.ClientName !== company);

        sleep(100);

        console.log(wipJobs);

        
        
        
        let jobAnalysisBuild = [];
        let nonBillableJobAnalysisBuild = [];
        let userRecover = [];
        let userAHR = [];
        let userBudgetTime = [];
        let userDuration = [];
        let userBudgetFee = [];
        let completedDate = format(new Date(2000,0,1,6),"dd-MMM yyyy");


        for(let i = 0; i<completedJobs.length; i++) {

            const currentJob = completedJobs[i];
            const jobStampIDs = currentJob.Timestamps;
            const jobStamps = [];

            for(let i = 0; i<jobStampIDs.length; i++) {
                const newStamp = globalTimestamps.find(s=> s._id === jobStampIDs[i]);

                if(newStamp !== null || newStamp !== undefined) {
                    jobStamps.push(newStamp);
                };
            };

            sleep(100);

            

            const allUsers = jobStamps.map(s => s.EmployeeName);
            const uniqueUsers = [...new Set(allUsers)];
            let userTimePercentages = [];
            let currentUserJobPercentage = 1;

            for (let i = 0; i<uniqueUsers.length; i++) {
                const userStamps = jobStamps.filter(s => s.EmployeeName === uniqueUsers[i]);
                const userTimeArray = userStamps.map(s => s.Duration);
                const userTime = userTimeArray.reduce(add, 0);
                const userTimePercentage = ((userTime / currentJob.Duration) * 100).toFixed(0);

                const newUser = uniqueUsers[i] + " - " + userTimePercentage + "%";

                if(uniqueUsers[i] === activeUser.userName) {
                    currentUserJobPercentage = (userTime / currentJob.Duration);
                };

                userTimePercentages.push(newUser);
            };


            if(currentJob.CompletedDate !== null && currentJob.CompletedDate !== undefined) {
                completedDate = format(new Date(currentJob.CompletedDate),"dd-MMM yyyy");
            }

            sleep(100);

            const recover = (currentJob.BudgetMilliseconds / currentJob.Duration);

            const jobAnalysisObject = {
                ClientName: currentJob.ClientName,
                Title: currentJob.Title,
                Date: format(new Date(currentJob.Date), "dd-MMM yyy"),
                CompletedDate: completedDate,
                BudgetFee: currentJob.BudgetFee.toFixed(2),
                BudgetMilliseconds: currentJob.BudgetMilliseconds,
                Duration: currentJob.Duration,
                AllUsers: userTimePercentages,
                TotalRecoverability: recover,
                AHR: currentJob.AHR.toFixed(0),
            };

            const jobTitle = currentJob.Title;


            if(jobTitle.toLowerCase().includes("admin") || jobTitle.toLowerCase().includes("meeting") || jobTitle.toLowerCase().includes("quick question") || currentJob.ClientName === company){

                nonBillableJobAnalysisBuild.push(jobAnalysisObject);
                
            } else {

                if(currentJob.ClientName !== company && jobTitle.toLowerCase().includes("bookkeeping") || jobTitle.toLowerCase().includes("payment run") || jobTitle.toLowerCase().includes("management") || 
                jobTitle.toLowerCase().includes("accounts production") || jobTitle.toLowerCase().includes("vat")) {

                    jobAnalysisBuild.push(jobAnalysisObject);

                    if(!isNaN(recover)) {
                        userRecover.push(recover);
                    };

                    if(!isNaN(currentJob.AHR)) {
                        userAHR.push(currentJob.AHR);
                    };

                    userBudgetTime.push(currentJob.BudgetMilliseconds*currentUserJobPercentage);
                    userBudgetFee.push(currentJob.BudgetFee*currentUserJobPercentage);
                    userDuration.push(currentJob.Duration*currentUserJobPercentage);

                    
                    
                    
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

            nonBillableJobAnalysisBuild.sort(function(a,b){
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

                setJobAnalysis(jobAnalysisBuild);
                setNonBillableJobAnalysis(nonBillableJobAnalysisBuild);

                // New Calcs
                const totalUserBudgetTime = userBudgetTime.reduce(add, 0);
                const totalUserBudgetFee = userBudgetFee.reduce(add,0);
                const totalUserDuration = userDuration.reduce(add, 0);
                const totalUserDurationHours = (totalUserDuration/3600000);

                setUserBillableHours(totalUserDurationHours)

                setRecoverability2((totalUserBudgetTime / totalUserDuration));
                setUserAHR2(totalUserBudgetFee/totalUserDurationHours);

                setTotalRecoverability((totalUserBudgetTime/userPeriodDurationReduce));
                setTotalUserAHR((totalUserBudgetFee/userPeriodHours));

                setTimeout(() => {
                    setWipHours(userPeriodDuration - userBillableHours - userNonBillableHours);

                    setLoading(false);
                },[1000]);
                
            },[200]);
            
            
        },[2000]);

        
        
    },[activeUser]);

    const userSelector = () => {
        return users.map((u, i) => {
    
          return (
            <option key={i}>{u.FirstName + " " + u.LastName}</option>
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
                <Header title="User Recoverability Report"/>

                <div className="bookkeeping-user-report">

                

                    <form className="bookkeeping-user-report__form margin-top-small">
                        <div>
                            <h4 className="form__input-label">User</h4>
                            <select onChange={handleChange} type="text" value={activeUser.userName} className="selector" id="userName" name="userName" required>
                                <option>Select User</option>
                                {userSelector()}
                            </select>
                        </div>
                        <div className="">
                            <h4 className="form__input-label">Start Date</h4>
                            <input onChange={handleChange} className="form__input-date"  type="date" id="startDate" name="startDate" value={format(new Date(activeUser.startDate), "yyyy-MM-dd")}></input>
                        </div>

                        <div className="col-1-of-4">
                            <h4 className="form__input-label">End Date</h4>
                            <input onChange={handleChange} className="form__input-date" type="date" id="endDate" name="endDate" value={format(new Date(activeUser.endDate), "yyyy-MM-dd")}></input>
                        </div>
                    </form>

                    <div className="bookkeeping-user-report__recoverability">

                        <div>
                            <h4>Completed Recoverability</h4>
                            <h4>{(recoverability2*100).toFixed(0)}%</h4>
                        </div>
                        
                        <div>
                            <h4>Completed AHR</h4>
                            <h4>£{userAHR2.toFixed(0)}</h4>
                        </div>

                        <div>
                            <h4>Total Recoverability</h4>
                            <h4>{(totalRecoverability*100).toFixed(0)}%</h4>
                        </div>

                        <div>
                            <h4>Total AHR</h4>
                            <h4>£{totalUserAHR.toFixed(0)}</h4>
                        </div>

                        <div>
                            <h4>Total Hours</h4>
                            <h4>{userPeriodDuration.toFixed(0)}</h4>
                        </div>

                        <div>
                            <h4>Billable Hours</h4>
                            <h4>{userBillableHours.toFixed(0)}</h4>
                        </div>

                        <div>
                            <h4>Non Billable Hours</h4>
                            <h4>{userNonBillableHours.toFixed(0)}</h4>
                        </div>

                        <div>
                            <h4>WIP (hrs)</h4>
                            <h4>{wipHours.toFixed(0)}</h4>
                        </div>
                        
                    </div>

                    <div className="bookkeeping-transaction-report__notes bookkeeping-transaction-report__notes--2">
                        <h4 className="bookkeeping-transaction-report__notes--heading">Calculation Notes:</h4>
                        <br></br>
                        <h6>The Summary figures are rounded values.</h6>
                    </div>

                    <h2 className="bookkeeping-user-report__heading bookkeeping-user-report__heading--1">Billable Completed Jobs</h2>

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
                    
                    <h2 className="bookkeeping-user-report__heading bookkeeping-user-report__heading--2">Non-Billable Jobs</h2>

                    <table id="jobrecoverabilitytable" className="job-analysis-table job-analysis-table--non-billable">

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
                            {nonBillableJobAnalysis.map((item, i) => (
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


export default UserRecoverabilityReport;