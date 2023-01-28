import React from "react";
import { format } from "date-fns";
// State
import {useSelector, useDispatch} from "react-redux";
import {login} from "../actions/login";
import {setUserName} from "../actions/setusername";
import {setCompany} from "../actions/setcompany";
import {setEmployees} from "../actions/setemployees";
import {setTimerActive} from "../actions/setTimerActive";
import {setActiveJob} from "../actions/setActiveJob";
import store from "../store";
import { navigate } from "hookrouter";

function FilteredJobList (props) {

    const userName = useSelector(state => state.userName);
    const company = useSelector(state => state.company);
    let employees = useSelector(state => state.employees);
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
        props.setNewJob(job)
        store.dispatch(setActiveJob(job));
        store.dispatch(setTimerActive());
    };

    return (
        <div>

            <div className="">
                <table id="jobstable" className="timer__jobs-table">

                <tbody>
                    <tr className="table-lines-2">
                        <th className="table-lines-2">Client Name</th>
                        <th className="table-lines-2">Job Name</th>
                        <th className="table-lines-2">Job Date</th>
                    </tr>
                        {list.map((item, i) => (
                        <tr key={i} data-item={item._id} onClick={fetchJobDetails} className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">{item.ClientName}</td>
                            <td className="table-lines-2">{item.Title}</td>
                            <td className="table-lines-2">{format(new Date(item.Date), "dd/MMM/yyy")}</td>
                        </tr>
                        ))}
                </tbody>

                </table>
            </div>
            
        </div>
    );
};

export default FilteredJobList;