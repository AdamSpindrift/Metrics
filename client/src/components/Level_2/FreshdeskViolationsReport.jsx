import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { format, startOfMonth, endOfMonth, subMonths, getDate, getMonth, getYear, sub, endOfWeek } from "date-fns";
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

function FreshdeskViolationsReport () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalJobs = useSelector(state => state.jobs);
    const globalTimestamps = useSelector(state => state.allTimestamps);
    const clients = useSelector(state => state.clients);
    const teams = useSelector(state => state.teams);


    const dispatch = useDispatch();


    const [loading, setLoading] = useState(true);
    const [companyDetails, setCompanyDetails] = useState({
        company: company,
    });
    const [month, setMonth] = useState({
        month: format(endOfMonth(subMonths(new Date(),1)), "dd/MM/yyyy"),
        team: "No Team Selected",
    });
    const [weekEnd, setWeekEnd] = useState({
        date: format(endOfWeek(sub(new Date,{weeks: 1}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
        team: "No Team Selected",
    });
    const [tableArray, setTableArray] = useState([]);
    const [allFreshdeskCards, setAllFreshdeskCards] = useState([]);

    useEffect(() => {

        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "transactionapi/getfreshdeskcards", {companyDetails})
          .then(res => {
            setAllFreshdeskCards(res.data.freshdeskCards);
            setLoading(false);
          });

    },[]);

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

        console.log("Running useEfeect");
        console.log(allFreshdeskCards);

        setLoading(true);

        if(allFreshdeskCards.length !== 0) {
            const dateArray = weekEnd.date.split("/");

            const periodFreshdeskCards = allFreshdeskCards.filter( t => getDate(new Date(t.EndDate)) === parseInt(dateArray[0]) && getMonth(new Date(t.EndDate)) === parseInt(dateArray[1])-1 && getYear(new Date(t.EndDate)) === parseInt(dateArray[2]));
            const periodFreshdeskCardsSorted = periodFreshdeskCards.sort((a,b) => (a.FirstResponseViolations > b.FirstResponseViolations ? -1 : 1));
            
            

            

            if(weekEnd.team === "No Team Selected") {
                setTableArray(periodFreshdeskCardsSorted);
            };

            if(weekEnd.team !== "No Team Selected") {
                const podFilter = periodFreshdeskCardsSorted.filter(t => t.Team === weekEnd.team);
                setTableArray(podFilter);
            };


            setLoading(false)

        };

        
        
    },[weekEnd, allFreshdeskCards]);



    const monthSelector = () => {
        return monthArray.map((m, i) => {
    
          return (
            <option key={i}>{m}</option>
          )
        })
    };

    const taskEndSelector = () => {
        const endWeek = [
            format(endOfWeek(new Date,{weekStartsOn: 1}),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 1}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 2}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 3}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 4}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 5}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 6}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 7}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 8}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 9}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 10}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
            format(endOfWeek(sub(new Date,{weeks: 11}),{ weekStartsOn: 1 }),"dd/MM/yyyy"),
        ];
    
        return endWeek.map((m, i) => {
    
            return (
              <option key={i}>{m}</option>
            )
          });
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

    function handleChange2(event) {
      const{name, value} = event.target;

        setWeekEnd((prevValue) => {

            return {
              ...prevValue,
              [name]:value
            };
        })
    };


    
    if( isLoggedIn === true) {

        return (
            <div className="container-2">
                <Header title="Freshdesk Violations Report"/>

                <div className="bookkeeping-transaction-report">

                

                    <form className="bookkeeping-transaction-report__form margin-top-small">
                        <div>
                            <h4 className="form__input-label">Week Ending</h4>
                            <select onChange={handleChange2} type="text" value={weekEnd.date} className="selector" id="date" name="date" required>
                                <option>Select Week End Date</option>
                                {taskEndSelector()}
                            </select>
                        </div>
                        
                    </form>

                    <form className="bookkeeping-transaction-report__form bookkeeping-transaction-report__form--team margin-top-small">
                        <div>
                            <h4 className="form__input-label">Team</h4>
                            <select onChange={handleChange2} type="text" value={weekEnd.team} className="selector" id="team" name="team" required>
                                <option>No Team Selected</option>
                                {teamSelector()}
                            </select>
                        </div>
                        
                    </form>

                    <CSVLink
                        data={tableArray}
                        filename={"Freshdesk Violations Report for " + weekEnd.date + " - " + weekEnd.team}
                        className="main-button main-button--large bookkeeping-transaction-report__download"
                        target="_blank">
                    Download CSV
                    </CSVLink>

                    {/* <div className="bookkeeping-transaction-report__notes">
                        <h4 className="bookkeeping-transaction-report__notes--heading">Calculation Notes:</h4>
                        <br></br>
                        <h6>Overdue and Cancelled tasks are a sum of total for user in the week period.</h6>
                        <br></br>
                        <h6>Completed and Total jobs are measured on key tasks within a job type. Management Accounts for example is measured on the task "Send management accounts to client".</h6>
                    </div> */}



                    {<table id="bookkeepingtransactiontable" className="bookkeeping-transaction-report__table">

                        <tbody>
                            <tr className="table-lines-2 bookkeeping-transaction-report__table--row">
                                <th className="bookkeeping-transaction-report__table--colmedium">User Name</th>
                                <th className="bookkeeping-transaction-report__table--colsmall">First Response Violations</th>
                            </tr>
                            {tableArray.map((item, i) => (
                                <tr key={i} data-item={item._id} className="table-lines-2 bookkeeping-transaction-report__table--row">
                                    <td className="table-lines-2">{item.UserName}</td>
                                    <td className="table-lines-2">{item.FirstResponseViolations}</td>
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


export default FreshdeskViolationsReport;