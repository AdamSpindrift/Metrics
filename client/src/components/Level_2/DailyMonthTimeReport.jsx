import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
import { format, startOfMonth, endOfMonth, subMonths, getMonth, getYear, getDate } from "date-fns";
import { CSVLink } from "react-csv";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import msToTime from "../Generic/msToTime";
import msToTime2 from "../Generic/msToTime2";
import add from "../Generic/add";
import sleep from "../Generic/sleep";
import Loading from "../Generic/Loading";
import removeDupes from "../Generic/removeDupes";
require("dotenv").config()

function DailyMonthTimeReport () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const globalTimestamps = useSelector(state => state.allTimestamps);
    const users = useSelector(state => state.users);
    const dispatch = useDispatch();


    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState({
        month: format(endOfMonth(subMonths(new Date(),1)), "dd/MM/yyyy"),
    });
    const [tableArray, setTableArray] = useState([]);

    const monthArray = [
        format(endOfMonth(new Date()), "dd/MM/yyyy"),
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

    const usersSorted = users.sort((a,b) => (a.FirstName > b.FirstName) ? 1 : ((b.FirstName > a.FirstName) ? -1 : 0));

    

    useEffect(() =>{

        setLoading(true);

        const build = [];

        const dateArray = month.month.split("/");
        const date = endOfMonth(new Date(dateArray[2], dateArray[1]-1, dateArray[0]));
        const stampsThisMonth = globalTimestamps.filter(t => getMonth(new Date(t.StartTime)) === getMonth(new Date(date)) && getYear(new Date(t.StartTime)) === getYear(new Date(date)));

        for(let i=0; i<usersSorted.length; i++) {

            const userName = users[i].FirstName + " " + users[i].LastName;
            const userStamps = stampsThisMonth.filter(s => s.EmployeeName === userName);
            const totalUserTime = userStamps.map(s => s.Duration).reduce(add,0);

            const object = {
                userName: usersSorted[i].FirstName + "" + usersSorted[i].LastName,
                day1: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 1).map(s => s.Duration).reduce(add,0)),
                day2: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 2).map(s => s.Duration).reduce(add,0)),
                day3: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 3).map(s => s.Duration).reduce(add,0)),
                day4: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 4).map(s => s.Duration).reduce(add,0)),
                day5: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 5).map(s => s.Duration).reduce(add,0)),
                day6: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 6).map(s => s.Duration).reduce(add,0)),
                day7: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 7).map(s => s.Duration).reduce(add,0)),
                day8: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 8).map(s => s.Duration).reduce(add,0)),
                day9: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 9).map(s => s.Duration).reduce(add,0)),
                day10: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 10).map(s => s.Duration).reduce(add,0)),
                day11: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 11).map(s => s.Duration).reduce(add,0)),
                day12: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 12).map(s => s.Duration).reduce(add,0)),
                day13: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 13).map(s => s.Duration).reduce(add,0)),
                day14: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 14).map(s => s.Duration).reduce(add,0)),
                day15: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 15).map(s => s.Duration).reduce(add,0)),
                day16: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 16).map(s => s.Duration).reduce(add,0)),
                day17: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 17).map(s => s.Duration).reduce(add,0)),
                day18: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 18).map(s => s.Duration).reduce(add,0)),
                day19: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 19).map(s => s.Duration).reduce(add,0)),
                day20: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 20).map(s => s.Duration).reduce(add,0)),
                day21: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 21).map(s => s.Duration).reduce(add,0)),
                day22: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 22).map(s => s.Duration).reduce(add,0)),
                day23: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 23).map(s => s.Duration).reduce(add,0)),
                day24: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 24).map(s => s.Duration).reduce(add,0)),
                day25: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 25).map(s => s.Duration).reduce(add,0)),
                day26: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 26).map(s => s.Duration).reduce(add,0)),
                day27: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 27).map(s => s.Duration).reduce(add,0)),
                day28: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 28).map(s => s.Duration).reduce(add,0)),
                day29: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 29).map(s => s.Duration).reduce(add,0)),
                day30: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 30).map(s => s.Duration).reduce(add,0)),
                day31: msToTime2(userStamps.filter(s => getDate(new Date(s.StartTime)) === 31).map(s => s.Duration).reduce(add,0)),
                total: msToTime2(totalUserTime),
            };

            build.push(object);

            if(i === usersSorted.length-1) {

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
                <Header title="Daily Time Report - Month Summary"/>

                <div className="daily-monthly-time-report">

                

                    <form className="daily-monthly-time-report__form margin-top-small">
                        <div>
                            <h4 className="form__input-label">Month</h4>
                            <select onChange={handleChange} type="text" value={month.month} className="selector" id="month" name="month" required>
                                <option>Select Month</option>
                                {monthSelector()}
                            </select>
                        </div>
                        
                    </form>

                    <CSVLink
                        data={tableArray}
                        filename={"User Time Report for " + month.month}
                        className="main-button main-button--large bookkeeping-transaction-report__download"
                        target="_blank">
                    Download CSV
                    </CSVLink>

                    



                    <table id="bookkeepingtransactiontable" className="daily-monthly-time-report__table">

                        <tbody>
                            <tr className="table-lines-2 daily-monthly-time-report__table--row">
                                <th className="daily-monthly-time-report__table--colmedium">User Name</th>
                                <th className="daily-monthly-time-report__table--colsmall">1</th>
                                <th className="daily-monthly-time-report__table--colsmall">2</th>
                                <th className="daily-monthly-time-report__table--colsmall">3</th>
                                <th className="daily-monthly-time-report__table--colsmall">4</th>
                                <th className="daily-monthly-time-report__table--colsmall">5</th>
                                <th className="daily-monthly-time-report__table--colsmall">6</th>
                                <th className="daily-monthly-time-report__table--colsmall">7</th>
                                <th className="daily-monthly-time-report__table--colsmall">8</th>
                                <th className="daily-monthly-time-report__table--colsmall">9</th>
                                <th className="daily-monthly-time-report__table--colsmall">10</th>
                                <th className="daily-monthly-time-report__table--colsmall">11</th>
                                <th className="daily-monthly-time-report__table--colsmall">12</th>
                                <th className="daily-monthly-time-report__table--colsmall">13</th>
                                <th className="daily-monthly-time-report__table--colsmall">14</th>
                                <th className="daily-monthly-time-report__table--colsmall">15</th>
                                <th className="daily-monthly-time-report__table--colsmall">16</th>
                                
                                
                            </tr>
                            {tableArray.map((item, i) => (
                                <tr key={i} data-item={item._id} className="table-lines-2 daily-monthly-time-report__table--row">
                                    <td className="table-lines-2">{item.userName}</td>
                                    <td className="table-lines-2">{item.day1}</td>
                                    <td className="table-lines-2">{item.day2}</td>
                                    <td className="table-lines-2">{item.day3}</td>
                                    <td className="table-lines-2">{item.day4}</td>
                                    <td className="table-lines-2">{item.day5}</td>
                                    <td className="table-lines-2">{item.day6}</td>
                                    <td className="table-lines-2">{item.day7}</td>
                                    <td className="table-lines-2">{item.day8}</td>
                                    <td className="table-lines-2">{item.day9}</td>
                                    <td className="table-lines-2">{item.day10}</td>
                                    <td className="table-lines-2">{item.day11}</td>
                                    <td className="table-lines-2">{item.day12}</td>
                                    <td className="table-lines-2">{item.day13}</td>
                                    <td className="table-lines-2">{item.day14}</td>
                                    <td className="table-lines-2">{item.day15}</td>
                                    <td className="table-lines-2">{item.day16}</td>
                                    
                                </tr>
                            ))}
                        </tbody>

                    </table>

                    <table id="bookkeepingtransactiontable" className="daily-monthly-time-report__table daily-monthly-time-report__table--2ndhalf">

                        <tbody>
                            <tr className="table-lines-2 daily-monthly-time-report__table--row">
                                <th className="daily-monthly-time-report__table--colmedium">User Name</th>
                                <th className="daily-monthly-time-report__table--colsmall daily-monthly-time-report__table--colhighlight">Total</th>
                                <th className="daily-monthly-time-report__table--colsmall">17</th>
                                <th className="daily-monthly-time-report__table--colsmall">18</th>
                                <th className="daily-monthly-time-report__table--colsmall">19</th>
                                <th className="daily-monthly-time-report__table--colsmall">20</th>
                                <th className="daily-monthly-time-report__table--colsmall">21</th>
                                <th className="daily-monthly-time-report__table--colsmall">22</th>
                                <th className="daily-monthly-time-report__table--colsmall">23</th>
                                <th className="daily-monthly-time-report__table--colsmall">24</th>
                                <th className="daily-monthly-time-report__table--colsmall">25</th>
                                <th className="daily-monthly-time-report__table--colsmall">26</th>
                                <th className="daily-monthly-time-report__table--colsmall">27</th>
                                <th className="daily-monthly-time-report__table--colsmall">28</th>
                                <th className="daily-monthly-time-report__table--colsmall">29</th>
                                <th className="daily-monthly-time-report__table--colsmall">30</th>
                                <th className="daily-monthly-time-report__table--colsmall">31</th>
                            </tr>
                            {tableArray.map((item, i) => (
                                <tr key={i} data-item={item._id} className="table-lines-2 daily-monthly-time-report__table--row">
                                    <td className="table-lines-2">{item.userName}</td>
                                    <td className="table-lines-2 daily-monthly-time-report__table--colhighlight">{item.total}</td>
                                    <td className="table-lines-2">{item.day17}</td>
                                    <td className="table-lines-2">{item.day18}</td>
                                    <td className="table-lines-2">{item.day19}</td>
                                    <td className="table-lines-2">{item.day20}</td>
                                    <td className="table-lines-2">{item.day21}</td>
                                    <td className="table-lines-2">{item.day22}</td>
                                    <td className="table-lines-2">{item.day23}</td>
                                    <td className="table-lines-2">{item.day24}</td>
                                    <td className="table-lines-2">{item.day25}</td>
                                    <td className="table-lines-2">{item.day26}</td>
                                    <td className="table-lines-2">{item.day27}</td>
                                    <td className="table-lines-2">{item.day28}</td>
                                    <td className="table-lines-2">{item.day29}</td>
                                    <td className="table-lines-2">{item.day30}</td>
                                    <td className="table-lines-2">{item.day31}</td>
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


export default DailyMonthTimeReport;