import React, { useState, useEffect } from "react";
import { startOfYear, format, endOfMonth, getYear, getTime } from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import {login} from "../actions/login";
import {setUserName} from "../actions/setusername";
import {setCompany} from "../actions/setcompany";
import {setEmployees} from "../actions/setemployees";
import {setTimerActive} from "../actions/setTimerActive";
import {setSelectedJob} from "../actions/setSelectedJob";
import store from "../store";
import { navigate } from "hookrouter";
//Custom Modules
import msToTime from "./msToTime";

function FilteredJobList (props) {

    const userName = useSelector(state => state.userName);
    const company = useSelector(state => state.company);
    let employees = useSelector(state => state.employees);
    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    const [list, setList] = useState(props.list);

    const [filterList, setFilterList] = useState([]);

    const [word, setWord] = useState({
        word: "",
    });

    const [customRange, setRange] = useState({
        start: startOfYear(new Date()),
        end: endOfMonth(new Date()),
    })

    const propsList = props.list;

    function handleSubmit(event) {

        store.dispatch (setUserName(userName));
        store.dispatch (setCompany(company));
        store.dispatch (setEmployees(employees));
        store.dispatch(login());
        store.dispatch(setTimerActive());
        navigate("/timer");

    };

    function fetchJobDetails (e) {
        e.preventDefault();
        const job = e.currentTarget.getAttribute("data-item");
        store.dispatch(setSelectedJob(job));
        navigate("/job");
    };

    function handleChange(event) {
        const{name, value} = event.target;
    
        setWord((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    function handleChange2(event) {
        const{name, value} = event.target;
    
        setRange((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    useEffect(() => {

        if (word.word !== "") {

            console.log("re-render list");

            const newList = propsList.filter(job => 
                job.Title.toLowerCase().includes(word.word.toLowerCase())
            );

            const newListDates = newList.filter(j => new Date(j.Date) >= new Date(customRange.start) && new Date(j.Date) <= new Date(customRange.end));

            setList(newListDates);
        };

        if (word.word === "") {
            setList(propsList);
        };

    },[word]);

    useEffect(() => {

        const dateFilterList = propsList.filter(j => new Date(j.Date) >= new Date(customRange.start) && new Date(j.Date) <= new Date(customRange.end));

        if(word.word === "") {
            setList(dateFilterList);
        };

        if(word.word !== "") {
            const newDateWordList = dateFilterList.filter(job => 
                job.Title.toLowerCase().includes(word.word.toLowerCase())
            );

            setList(newDateWordList);
        };


    },[customRange]);
    


    return (
        <div>

            <div className="filter-jobs-list">

                <h4 className="form__input-label">Job Name</h4>
                <h4 className="form__input-label">Start Date</h4>
                <h4 className="form__input-label">End Date</h4>

                <input className="filter-jobs-list__form-input" value={word.word} onChange={handleChange} name="word"/>

                <input onChange={handleChange2} className="form__input-date" type="date" id="start" name="start" value={format(new Date(customRange.start), "yyyy-MM-dd")}></input>
                
                <input onChange={handleChange2} className="form__input-date" type="date" id="end" name="end" value={format(new Date(customRange.end), "yyyy-MM-dd")}></input>

                <table id="jobstable" className="filter-jobs-list__jobs-table">

                    <tbody>
                        <tr className="table-lines-2">
                            <th className="timer__jobs-table__client-col  table-lines-2">Job Name</th>
                            <th className="table__medium-col table-lines-2">Job Date</th>
                            <th className="table__medium-col table-lines-2">Completed Date</th>
                            <th className="table__medium-col table-lines-2">Status</th>
                            <th className="table__medium-col table-lines-2">P&L Hours</th>
                            {access === "Admin" ? 
                            <th className="table__medium-col table-lines-2">Recoverability</th> : <div>&nbsp;</div>}
                        </tr>
                            {list.map((item, i) => (
                            <tr key={i} data-item={item._id} onClick={fetchJobDetails} className="table__select-row--1 table-lines-2">
                                <td className="table-lines-2">{item.Title}</td>
                                <td className="table-lines-2">{format(new Date(item.Date), "dd/MMM/yyy")}</td>
                                {isNaN(getYear(new Date(item.CompletedDate))) || getYear(new Date(item.CompletedDate)) === 1970 ? <td className="table-lines-2">No Date</td> : <td className="table-lines-2">{format(new Date(item.CompletedDate), "dd/MMM/yyy")}</td>}
                                <td className="table-lines-2">{item.Status}</td>
                                {item.ProfitLossMilliseconds >= 0 ? <td className="table-lines-2 table-pos-value">{msToTime(item.ProfitLossMilliseconds)}</td> :
                                <td className="table-lines-2 table-neg-value">{msToTime(item.ProfitLossMilliseconds)}</td>}

                                {(item.BudgetMilliseconds/item.Duration) >= 1.1 ? <td className="table-lines-2 table-pos-value">{Math.round(((item.BudgetMilliseconds/item.Duration) + Number.EPSILON) * 100) / 100}</td> :
                                <td className="table-lines-2 table-neg-value">{Math.round(((item.BudgetMilliseconds/item.Duration) + Number.EPSILON) * 100) /100}</td>}
                            </tr>
                            ))}
                    </tbody>

                </table>
            </div>
            
        </div>
    );
};

export default FilteredJobList;