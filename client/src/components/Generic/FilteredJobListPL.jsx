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
import msToTime from "../Generic/msToTime";

function FilteredJobList (props) {

    const userName = useSelector(state => state.userName);
    const company = useSelector(state => state.company);
    let employees = useSelector(state => state.employees);
    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    const list = props.list;

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

    return (
        <div>

            <div className="">
                <table id="jobstable" className="timer__jobs-table">

                <tbody>
                    <tr className="table-lines-2">
                        <th className="timer__jobs-table__client-col  table-lines-2">Job Name</th>
                        <th className="table__medium-col table-lines-2">Job Date</th>
                        <th className="table__medium-col table-lines-2">Status</th>
                        <th className="table__medium-col table-lines-2">P&L Hours</th>
                        {access === "Admin" ? 
                        <th className="table__medium-col table-lines-2">P&L Fee</th> : <div>&nbsp;</div>}
                    </tr>
                        {list.map((item, i) => (
                        <tr key={i} data-item={item._id} onClick={fetchJobDetails} className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">{item.Title}</td>
                            <td className="table-lines-2">{format(new Date(item.Date), "dd/MMM/yyy")}</td>
                            <td className="table-lines-2">{item.Status}</td>
                            {item.ProfitLossMilliseconds >= 0 ? <td className="table-lines-2 table-pos-value">{msToTime(item.ProfitLossMilliseconds)}</td> :
                            <td className="table-lines-2 table-neg-value">{msToTime(item.ProfitLossMilliseconds)}</td>
                            }

                            {access === "Admin" ?
                            item.ProfitLossFee >= 0 ? <td className="table-lines-2 table-pos-value">{Math.round((item.ProfitLossFee + Number.EPSILON) * 100) / 100}</td> :
                            <td className="table-lines-2 table-neg-value">{Math.round((item.ProfitLossFee + Number.EPSILON) * 100) /100}</td>
                             : <div>&nbsp;</div> }
                        </tr>
                        ))}
                </tbody>

                </table>
            </div>
            
        </div>
    );
};

export default FilteredJobList;