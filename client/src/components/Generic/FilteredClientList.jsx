import React from "react";
// State
import {useSelector, useDispatch} from "react-redux";
import store from "../store";
import { setActiveClient } from "../actions/setActiveClient";
import { navigate } from "hookrouter";
// Generic
import msToTime from "./msToTime";

function FilteredClientList (props) {

    const access = useSelector(state => state.userAccess);
    const dispatch = useDispatch();

    let list = props.list;
    list.sort((a, b) => (a.ClientName > b.ClientName) ? 1 : -1);

    

    function selectClient (e) {
        e.preventDefault();
        const selectedClient = e.currentTarget.getAttribute("data-item");
        store.dispatch(setActiveClient(selectedClient));
        navigate("/clientdetails");
    };

    return (
        <div>

            <div className="">
                <table id="clientstable" className="clients__clients-table">

                <tbody>
                    <tr className="table-lines-2">
                        <th className="client__clients-table__client-col table-lines-2">Client Name</th>
                        <th className="table-lines-2">Account Manager</th>
                        <th className="table-lines-2">State</th>
                    </tr>
                        {list.map((item, i) => (
                        <tr key={i} data-item={item._id} onClick={selectClient} className="table__select-row--1 table-lines-2">
                            <td className="table-lines-2">{item.ClientName}</td>
                            <td className="table-lines-2">{item.AccManager}</td>
                            <td className="table-lines-2">{item.ClientState}</td>
                        </tr>
                        ))}
                </tbody>

                </table>
            </div>
            
        </div>
    );
};

export default FilteredClientList;