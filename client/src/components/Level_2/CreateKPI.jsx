import React, { useState, useEffect } from "react";
import {navigate} from "hookrouter";
import axios from "axios";
// State
import {useSelector, useDispatch} from "react-redux";
import {setKpiRoles} from "../actions/setKpiRoles";
import {setKpis} from "../actions/setKpis";
import {setKpiTemplates} from "../actions/setKpiTemplates";
import store from "../store";
// Custom Modules
import Header from "../Generic/Header";
import Loading from "../Generic/Loading";
import ListKPIs from "../Generic/ListKPIS";
import KPINav from "../Generic/KPINav";

require("dotenv").config()

function CreateKPI () {

    const company = useSelector(state => state.company);
    let isLoggedIn = useSelector(state => state.loggedIn);
    const kpiTemplates = useSelector(state => state.kpiTemplates);
    const roles = useSelector(state => state.kpiRoles);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const [kpiDetails, setKpi] = useState({
        company: company,
        name: "",
        description: "",
      });

      const [role, setRole] = useState({
        company: company,
        name: "",
      });

      const [kpiJobRole, setKpiJobRole] = useState({
        company: company,
        jobRole: undefined,
        kpiName: "",
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

    const kpiSelector = () => {
        return kpiTemplates.map((kpi, i) => {
    
          return (
            <option key={i}>{kpi.Name}</option>
          )
        })
    };

    const roleSelector = () => {
        return roles.map((kpi, i) => {
    
          return (
            <option key={i}>{kpi.Name}</option>
          )
        })
    };

    const handleAddkpi = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/createkpi", {kpiDetails})
            .then(res => {
                const companyKPI = res.data.KPICompany;
                store.dispatch(setKpiRoles(companyKPI.JobRoles));
                store.dispatch(setKpis(companyKPI.KPIs));
                store.dispatch(setKpiTemplates(companyKPI.KPITemplates));
                setLoading(false);
                navigate("/createkpi");
            });
    };

    const handleCreateRole = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/createrole", {role})
            .then(res => {
                setLoading(false);
                navigate("/createkpi");
            });
    };

    const handleCreateCompany = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/createkpicompany", {role})
            .then(res => {
                setLoading(false);
                navigate("/createkpi");
            });
    };

    const handleRoles = (event) => {
        event.preventDefault();
        setLoading(true);

        axios.post(process.env.REACT_APP_SERVER_ROUTE + "kpi/kpitorole", {kpiJobRole})
            .then(res => {
                const companyKPI = res.data.KPICompany;
                store.dispatch(setKpiRoles(companyKPI.JobRoles));
                store.dispatch(setKpis(companyKPI.KPIs));
                store.dispatch(setKpiTemplates(companyKPI.KPITemplates));
                setLoading(false);
                navigate("/createkpi");
            });
    };

    return (
        <div className="container-2">
            <Header title="Create KPI"/>
            <KPINav />

            <div className="addkpi">

                <div className="addkpi__form">
                    <form onSubmit={handleAddkpi}>
                        <h4 className="form__input-label">KPI Name</h4>
                        <input onChange={handleChange} type="text" value={kpiDetails.name} name="name" placeholder="Name" required/>
                        <h4 className="form__input-label">Description</h4>
                        <textarea onChange={handleChange} type="text" value={kpiDetails.description} name="description" placeholder="description" required className="addkpi__textarea"/>
                        <button className="main-button main-button--large" type="submit">Create KPI</button>
                    </form>

                </div>

                <div className="addkpi__form">
                    <form onSubmit={handleCreateRole}>
                        <h4 className="form__input-label">Role Name</h4>
                        <input onChange={handleChange3} type="text" value={role.Name} name="name" placeholder="name" required/>
                        <button className="main-button main-button--large" type="submit">Create Role</button>
                    </form>

                    {/* <form onSubmit={handleCreateCompany}>
                        <h4 className="form__input-label">Create Company</h4>
                        <button className="main-button main-button--large" type="submit">Create Company</button>
                    </form> */}

                </div>

                <div className="addkpi__roles">
                    <form onSubmit={handleRoles}>
                        <h4 className="form__input-label">Select Job Role</h4>
                        <select onChange={handleChange2} type="text" value={kpiJobRole.jobRole} className="selector selector__time-unit" id="jobRole" name="jobRole" required>
                            <option>No Role Selected</option>
                            {roleSelector()}
                        </select>
                        <h4 className="form__input-label">Select KPI</h4>
                        <select onChange={handleChange2} type="text" value={kpiJobRole.kpiName} className="selector selector__time-unit" id="kpiName" name="kpiName" required>
                                <option>No KPI Selected</option>
                                {kpiSelector()}
                        </select> : <div>&nbsp;</div>
                        <button className="main-button main-button--large" type="submit">Add KPI to Role</button>
                    </form>

                </div>

                <div className="addkpi__kpi-list">
                    <ListKPIs />

                </div>

                <div>&nbsp;</div>

                <div className="addkpi__role-kpi-list">
                    <ListKPIs jobRole={kpiJobRole.jobRole}/>
                </div>
            </div>

            {loading === true ? <Loading /> : <div>&nbsp;</div>}

        </div>
    );
};


export default CreateKPI;