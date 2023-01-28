import React, { useState, Fragment, useEffect } from "react";
import { navigate } from "hookrouter";
import { format } from "date-fns";
import axios from "axios";
// State
import { useSelector, useDispatch } from "react-redux";
import { setUsers } from "../actions/setUsers";
import { setActiveUser } from "../actions/setActiveUser";
import store from "../store";


// Custom Modules
import Header from "../Generic/Header";
import PleaseLogin from "../Generic/PleaseLogin";
import SettingsNav from "../Generic/SettingsNav";
require("dotenv").config()

function Users () {

    
    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const dispatch = useDispatch();

    function navClientDetails() {
        navigate("/clientdetails");
    };

    const [users, setUser] = useState([]);

    const companyDetails = {company: company,};

    useEffect(() =>{
        axios.post(process.env.REACT_APP_SERVER_ROUTE + "api/getusers", {companyDetails})
          .then(res => {
            console.log(res.data.message);
            setUser(res.data.users);
            store.dispatch(setUsers(res.data.users));
          });

    },[]);
    
    function fetchUserDetails (e) {
        e.preventDefault();
        const user = e.currentTarget.getAttribute("data-item");
        store.dispatch(setActiveUser(user));
        navigate("/edituser");
    };

    function navAddUser () {
        navigate("/adduser");
    };
    

    if( isLoggedIn === true) {
        return (
            <div className="container-2">
                <Header title="Users"/>
                <SettingsNav />

                {users.length > 0 ? 

                    <div className="">
                        <table id="userstable" className="users__users-table">

                            <tbody>
                                <tr className="table-lines-2">
                                    <th className="table-lines-2">First Name</th>
                                    <th className="table-lines-2">Last Name</th>
                                    <th className="table-lines-2">Email</th>
                                    <th className="table-lines-2">Access</th>
                                    <th className="table-lines-2">Role</th>
                                </tr>
                                {users.map((item, i) => (
                                <tr key={i} data-item={item._id} onClick={fetchUserDetails} className="table__select-row--1 table-lines-2">
                                    <td className="table-lines-2">{item.FirstName}</td>
                                    <td className="table-lines-2">{item.LastName}</td>
                                    <td className="table-lines-2">{item.Email}</td>
                                    <td className="table-lines-2">{item.Access}</td>
                                    <td className="table-lines-2">{item.JobTitle}</td>
                                </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>


                : <div>&nbsp;</div> }

                <form onSubmit={navAddUser}>
                    <button className="main-button main-button--large" type ="submit">Add User</button>
                </form>
                
            </div>
        );
    } else {
        return (
            <PleaseLogin />
        )
    }
};


export default Users;