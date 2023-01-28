import React from "react";
import { format } from "date-fns";
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

    const list = props.list;

    function add(accumulator, a) {
        return accumulator + a;
    };
    

    function handleSubmit(event) {

        store.dispatch (setUserName(userName));
        store.dispatch (setCompany(company));
        store.dispatch (setEmployees(employees));
        store.dispatch(login());
        store.dispatch(setTimerActive());
        navigate("/timer");

    };

    const allDuration = list.map(j => j.Duration);
    const duration = allDuration.reduce(add, 0);

    function fetchJobDetails (e) {
        e.preventDefault();
        const job = e.currentTarget.getAttribute("data-item");
        store.dispatch(setSelectedJob(job));
        navigate("/job");
    };

    return (
        <div>

            <div className="">
                <h4 className="margin-top-small">Total Duration</h4>
                <h4>{msToTime(duration)}</h4>
                <table id="jobstable" className="timer__jobs-table">

                <tbody>
                    <tr className="table-lines-2">
                        <th className="timer__jobs-table__client-col  table-lines-2">Client</th>
                        <th className="timer__jobs-table__client-col  table-lines-2">Job Name</th>
                        <th className="table__medium-col table-lines-2">Job Date</th>
                        <th className="table__medium-col table-lines-2">Status</th>
                        <th className="table__medium-col table-lines-2">P&L Hours</th>
                        <th className="table__medium-col table-lines-2">Duration</th>
                        <th className="table__medium-col table-lines-2">Recoverability</th>
                        <th className="table__medium-col table-lines-2">AHR</th>
                    </tr>
                        {list.map((item, i) => (
                        <tr key={i} data-item={item._id} onClick={fetchJobDetails} className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">{item.ClientName}</td>
                            <td className="table-lines-2">{item.Title}</td>
                            <td className="table-lines-2">{format(new Date(item.Date), "dd/MMM/yyy")}</td>
                            <td className="table-lines-2">{item.Status}</td>
                            {item.ProfitLossMilliseconds >= 0 ? <td className="table-lines-2 table-pos-value">{msToTime(item.ProfitLossMilliseconds)}</td> :
                            <td className="table-lines-2 table-neg-value">{msToTime(item.ProfitLossMilliseconds)}</td>
                            }
                             <td className="table-lines-2">{msToTime(item.Duration)}</td>
                             {(item.BudgetMilliseconds/item.Duration) >= 1.1 ? <td className="table-lines-2 table-pos-value">{Math.round(((item.BudgetMilliseconds/item.Duration) + Number.EPSILON) * 100) / 100}</td> :
                            <td className="table-lines-2 table-neg-value">{Math.round(((item.BudgetMilliseconds/item.Duration) + Number.EPSILON) * 100) /100}</td>}
                             <td className="table-lines-2">{Math.round((item.AHR + Number.EPSILON) * 100) /100}</td>
                        </tr>
                        ))}
                </tbody>

                </table>
            </div>
            
        </div>
    );
};

export default FilteredJobList;