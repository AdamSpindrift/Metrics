import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import { setUsers } from "../actions/setUsers";
import {setKpiRoles} from "../actions/setKpiRoles";
import {setKpis} from "../actions/setKpis";
import {setKpiTemplates} from "../actions/setKpiTemplates";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import ListKPIs from "../Generic/ListKPIS"
import KPINav from "../Generic/KPINav";
import Loading from "../Generic/Loading";

require("dotenv").config()

function SetKPITargets () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    let allUsers = useSelector(state => state.users);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const [users, setUser] = useState(allUsers);

    const [selectedUser, setSelectedUser] = useState({
        name: "",
    });

    const [targets, setTargets] = useState([]);


    const [companyDetails, setCompanyDetails] = useState({company: company});

    useEffect(() =>{

        if(selectedUser.name !== "") {
            const nameArray = selectedUser.name.split(" ");

            const userObject = users.find(user => user.FirstName === nameArray[0] && user.LastName === nameArray[1]);
            
            setTargets(userObject.KPITargets);
        };
        

    },[selectedUser]);

    function handleChange(event) {
        const{name, value} = event.target;
    
        setSelectedUser((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    function handleChange2(event) {
        const{name, value} = event.target;
    
        setSelectedUser((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    const handleNewTargets = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/initialtargets", {companyDetails})
            .then(res => {
                console.log(res.data.message);
                store.dispatch(setUsers(res.data.users));
                setLoading(false);
                navigate("/setkpitarget");
            });
    };

    const handleUserSelector = (event) => {
        event.preventDefault();

        const userArray = selectedUser.split(" ", 2);

        const selectedUser = users.find(u => u.FirstName === userArray[0] && u.LastName === userArray[1]);

        setTargets(selectedUser.KPITargets);
    };

    const userSelector = () => {
        return allUsers.map((user, i) => {
    
            if(user !== null) {
                return (
                    <option key={i}>{user.FirstName + " " + user.LastName}</option>
                )
            };

            if (user === null) {
                return (
                    <option key={i}>No User</option>
                )
            }
          
        })
    };

    // const listTargets = () => {
    //     return targets.map((target, i) => {

    //         return (
    //             <div>
    //             <h4 className="form__input-label">{target.Name}</h4>
    //             <input onChange={handleChange2} type="text" value={kpiDetails.name} name="name" placeholder="Name" required/>
    //             </div>
    //         )
    //     })
    // };


    return (
        <div className="container-2">
            <Header title="Set KPI Targets"/>
            <KPINav />

            <div className="kpi-templates">

                <form onSubmit={handleNewTargets}>
                    <button className="main-button main-button--large" type="submit">Add Initial Targets</button>
                </form>

                <form onSubmit={handleUserSelector}>
                    <h4 className="form__input-label">Select User</h4>
                    <select onChange={handleChange} type="text" value={selectedUser.name} className="selector selector__time-unit" id="name" name="name" required>
                        <option>None selected</option>
                        {userSelector()}
                    </select>

                    <table id="kpitable" className="kpi__table">
                        <tbody>
                            <tr>
                              <th className="addkpi__th">KPI Name</th>
                              <th className="addkpi__th">Target</th>
                            </tr>

                            {targets.length > 0 ? targets.map((item, i) => (
          
                                  <tr key={i} className="table__select-row--1">
                                    <td>{item.Name}</td>
                                    <td>{item.Target}</td>
                                  </tr>

                            )) : <tr></tr>}
                        </tbody>
                    </table>
                   
                    <button className="main-button main-button--large" type="submit">Add KPI to Role</button>
                </form>

            </div>

            {loading === true ? <Loading /> : <div>&nbsp;</div>}
        </div>
    );
};


export default SetKPITargets;