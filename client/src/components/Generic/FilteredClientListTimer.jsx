import React from "react";
import { v4 as uuidv4 } from "uuid";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import { setOutOfCRMClient } from "../actions/setOutOfCRMClient";
import { setOutOfCRMJob } from "../actions/setOutOfCRMJob";
import { setTimerActive } from "../actions/setTimerActive";
// Generic


function FilteredClientListTimer (props) {

    const dispatch = useDispatch();

    const list = props.list;

    const newJobID = uuidv4();

    

    function selectClient (e) {
        e.preventDefault();
        const selectedClient = e.currentTarget.getAttribute("data-item");
        store.dispatch(setOutOfCRMClient(selectedClient));
        store.dispatch(setOutOfCRMJob(newJobID));
        store.dispatch(setTimerActive());
    };

    return (
        <div>

            <div className="">
                <table id="clientstable" className="clients__clients-table">

                <tbody>
                    <tr className="table-lines-2">
                        <th className="client__clients-table__client-col table-lines-2">Client Name</th>
                        
                    </tr>
                        {list.map((item, i) => (
                        <tr key={i} data-item={item._id} onClick={selectClient} className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">{item.ClientName}</td>
                        </tr>
                        ))}
                </tbody>

                </table>
            </div>
            
        </div>
    );
};

export default FilteredClientListTimer;