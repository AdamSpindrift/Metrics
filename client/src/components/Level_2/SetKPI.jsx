import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import { setLoading } from "../actions/setLoading";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import ListKPIs from "../Generic/ListKPIS"
import KPINav from "../Generic/KPINav";

require("dotenv").config()

function SetKPI () {

    const [kpiDetails, setKpi] = useState({
        Name: "",
        Description: "",
        DataType: "",
      });

      const [kpiJobRole, setKpiJobRole] = useState({
        jobRole: "",
        kpiName: "",
      });

      const [role, setRole] = useState({
        name: "",
      });


      function handleChange(event) {
        const{name, value} = event.target;
    
        setKpi((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    function handleChange2(event) {
        const{name, value} = event.target;
    
        setKpiJobRole((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    function handleChange3(event) {
        const{name, value} = event.target;
    
        setRole((prevValue) => {
    
          return {
            ...prevValue,
            [name]:value
          };
        })
    };

    const handleAddkpi = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/addkpi", {kpiDetails})
            .then(res => {
                setLoading(false);
                navigate("/settings");
            });
    };

    const handleRoles = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/kpiroles", {kpiDetails})
            .then(res => {
                setLoading(false);
                navigate("/settings");
            });
    };

    return (
        <div className="container-2">
            <Header title="Set KPI's"/>
            <KPINav />

            <div className="addkpi">

                <div className="addkpi__form">
                    <form onSubmit={handleAddkpi}>
                        <h4 className="form__input-label">KPI Name</h4>
                        <input onChange={handleChange} type="text" value={kpiDetails.Name} name="Name" placeholder="Name" required/>
                        <h4 className="form__input-label">Data Type</h4>
                        <input onChange={handleChange} type="text" value={kpiDetails.DataType} name="DataType" placeholder="Data Type" required/>
                        <h4 className="form__input-label">Description</h4>
                        <textarea onChange={handleChange} type="text" value={kpiDetails.Description} name="Description" placeholder="Description" required className="addkpi__textarea"/>
                        <button className="main-button main-button--large" type="submit">Create KPI</button>
                    </form>

                </div>

                <div className="addkpi__form">
                    <form onSubmit={handleAddkpi}>
                        <h4 className="form__input-label">Role Name</h4>
                        <input onChange={handleChange3} type="text" value={role.Name} name="Name" placeholder="Name" required/>
                        <button className="main-button main-button--large" type="submit">Create Role</button>
                    </form>

                </div>

                <div className="addkpi__roles">
                    <form onSubmit={handleRoles}>
                        <h4 className="form__input-label">Select Job Role</h4>
                        <select onChange={handleChange2} type="text" value="" className="selector selector__time-unit" id="jobRole" name="jobRole" required>
                            <option>No Role Selected</option>
                            <option>Director</option>
                            <option>Team Lead</option>
                            <option>Team Member</option>
                            <option>Sales Team</option>
                            <option>Admin Team</option>
                        </select>
                        <h4 className="form__input-label">Select KPI</h4>
                        <select onChange={handleChange2} type="text" value="" className="selector selector__time-unit" id="kpiName" name="kpiName" required>
                                <option>No KPI Selected</option>
                                <option>KPI 1</option>
                                <option>KPI 2</option>
                                <option>KPI 3</option>
                        </select> : <div>&nbsp;</div>
                        <button className="main-button main-button--large" type="submit">Add KPI to Role</button>
                    </form>

                </div>

                <div className="addkpi__kpi-list">
                    <ListKPIs />

                </div>

                <div>&nbsp;</div>

                <div className="addkpi__role-kpi-list">
                    <ListKPIs />
                </div>
            </div>
        </div>
    );
};


export default SetKPI;